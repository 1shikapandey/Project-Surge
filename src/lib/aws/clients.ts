import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SageMakerRuntimeClient } from '@aws-sdk/client-sagemaker-runtime';

export const REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'ap-south-1';

export const s3 = new S3Client({ region: REGION });
export const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});
export const sns = new SNSClient({ region: REGION });
export const sqs = new SQSClient({ region: REGION });
export const sagemaker = new SageMakerRuntimeClient({ region: process.env.SAGEMAKER_REGION || REGION });

/** `table('snapshots')` -> `surge-dev-snapshots` */
export const table = (name: string) => `${process.env.TABLE_PREFIX || 'surge'}-${name}`;

/** True when shared state should live in AWS instead of process memory. */
export const useAws = () => process.env.DATA_BACKEND === 'aws';
