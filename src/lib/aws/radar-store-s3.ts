import { PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './clients';
import type { RadarBlobPayload } from '../radar-blob-service';

const bucket = () => process.env.RADAR_BUCKET || 'surge-radar-history';

export async function saveRadarGridToS3(key: string, payload: RadarBlobPayload): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    Body: JSON.stringify(payload),
    ContentType: 'application/json',
  }));
  return `s3://${bucket()}/${key}`;
}

function dayPrefixes(station: string, start?: Date, end?: Date): string[] {
  const base = `radar-history/${station}/`;
  if (!start || !end) return [base];
  const out: string[] = [];
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  while (d <= end && out.length <= 62) {
    out.push(`${base}${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}/`);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out.length > 62 ? [base] : out;
}

function keyToDate(key: string): Date | null {
  const p = key.split('/');
  if (p.length < 6) return null;
  const t = p[5].replace('.json', '');
  return new Date(Date.UTC(+p[2], +p[3] - 1, +p[4], +t.slice(0, 2), +t.slice(2, 4)));
}

export async function fetchHistoricalRadarGridsFromS3(
  station: string,
  start?: Date,
  end?: Date
): Promise<RadarBlobPayload[]> {
  const keys: string[] = [];
  for (const Prefix of dayPrefixes(station, start, end)) {
    let ContinuationToken: string | undefined;
    do {
      const out = await s3.send(new ListObjectsV2Command({ Bucket: bucket(), Prefix, ContinuationToken }));
      for (const o of out.Contents ?? []) {
        if (o.Key?.endsWith('.json')) keys.push(o.Key);
      }
      ContinuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
    } while (ContinuationToken);
  }
  const wanted = keys.sort().filter((k) => {
    const d = keyToDate(k);
    return d && (!start || d >= start) && (!end || d <= end);
  });

  const results: RadarBlobPayload[] = [];
  for (let i = 0; i < wanted.length; i += 10) {
    const batch = await Promise.all(wanted.slice(i, i + 10).map(async (Key) => {
      const obj = await s3.send(new GetObjectCommand({ Bucket: bucket(), Key }));
      return JSON.parse(await obj.Body!.transformToString()) as RadarBlobPayload;
    }));
    results.push(...batch);
  }
  return results;
}
