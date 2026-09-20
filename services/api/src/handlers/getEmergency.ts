import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    requireRole(event, ["CITIZEN", "OPERATOR", "RESPONDER"]);
    const { id } = event.pathParameters || {};

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing incident ID" }) };
    }

    const command = new GetCommand({
      TableName: TABLE_NAMES.INCIDENTS,
      Key: { id }
    });

    const response = await db.send(command);

    if (!response.Item) {
      return { statusCode: 404, body: JSON.stringify({ error: "Incident not found" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.Item),
    };

  } catch (error: any) {
    console.error(`Error fetching emergency ${event.pathParameters?.id}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
