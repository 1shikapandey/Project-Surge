import { PublishCommand } from '@aws-sdk/client-sns';
import { sns } from './clients';

export type Severity = 'advisory' | 'warning' | 'critical' | 'severe';

/** Message text must come from computed telemetry only (never raw LLM text) — keeps the provenance rule. */
export async function publishAlert(cityId: string, severity: Severity, subject: string, message: string) {
  if (!process.env.ALERT_TOPIC_ARN) return;
  await sns.send(new PublishCommand({
    TopicArn: process.env.ALERT_TOPIC_ARN,
    Subject: subject.slice(0, 100),
    Message: message,
    MessageAttributes: {
      city: { DataType: 'String', StringValue: cityId },
      severity: { DataType: 'String', StringValue: severity },
    },
  }));
}
