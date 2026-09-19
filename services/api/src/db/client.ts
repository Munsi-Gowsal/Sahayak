import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  // Allow overriding endpoint for local testing (e.g. DynamoDB Local)
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});

export const db = DynamoDBDocumentClient.from(ddbClient);

export const TABLE_NAMES = {
  INCIDENTS: process.env.INCIDENTS_TABLE || "Sahayak-Incidents",
  RESOURCES: process.env.RESOURCES_TABLE || "Sahayak-Resources",
};
