import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// One shared client for the whole app. No access keys are passed here -
// on EC2, the SDK automatically picks up the credentials from the IAM
// role attached to the instance (MediConnectBackendRole). Locally (if
// ever needed for testing off EC2), it would fall back to whatever
// `aws configure` has set up on that machine.
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// The Document Client is a thin wrapper that lets us send/receive plain
// JS objects (e.g. { providerId: 'PRV-101' }) instead of DynamoDB's raw
// attribute-value format (e.g. { providerId: { S: 'PRV-101' } }).
export const ddb = DynamoDBDocumentClient.from(client);

// Table names centralised here, same reasoning as endpoints.js on the
// frontend - one place to change if a table is ever renamed.
export const TABLES = {
  PROVIDERS: 'Providers',
  DOCTORS: 'Doctors',
  SLOTS: 'Slots',
  BOOKINGS: 'Bookings',
  FACILITIES: 'NZHealthcare',
};
