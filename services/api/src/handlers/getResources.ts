import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    requireRole(event, ["OPERATOR"]);
    const status = event.queryStringParameters?.status;
    let commandParams: any = {
      TableName: TABLE_NAMES.RESOURCES,
    };

    if (status) {
      commandParams.FilterExpression = "#status = :status";
      commandParams.ExpressionAttributeNames = { "#status": "status" };
      commandParams.ExpressionAttributeValues = { ":status": status };
    }

    const { Items } = await db.send(new ScanCommand(commandParams));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Items || []),
    };
  } catch (error: any) {
    console.error("Error fetching resources:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
