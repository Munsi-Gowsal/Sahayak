import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    requireRole(event, ["OPERATOR"]);
    const { id } = event.pathParameters || {};
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing resource id" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const { status, location } = body;
    const now = new Date().toISOString();

    let updateExpression = "SET updatedAt = :u";
    let expressionAttributeNames: any = {};
    let expressionAttributeValues: any = { ":u": now };

    if (status) {
      updateExpression += ", #status = :s";
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":s"] = status;
    }

    if (location) {
      updateExpression += ", #loc = :l";
      expressionAttributeNames["#loc"] = "location";
      expressionAttributeValues[":l"] = location;
    }

    await db.send(new UpdateCommand({
      TableName: TABLE_NAMES.RESOURCES,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Resource updated successfully" }),
    };
  } catch (error: any) {
    console.error(`Error updating resource ${event.pathParameters?.id}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
