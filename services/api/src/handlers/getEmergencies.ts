import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    requireRole(event, ["OPERATOR"]);
    const { status, priority } = event.queryStringParameters || {};

    let filterExpression = undefined;
    let expressionAttributeValues: Record<string, any> = {};
    let expressionAttributeNames: Record<string, string> = {};

    const filters = [];
    if (status) {
      filters.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }
    if (priority) {
      expressionAttributeNames["#priority"] = "priority";
      expressionAttributeNames["#level"] = "level";
      filters.push("#priority.#level = :priorityLevel");
      expressionAttributeValues[":priorityLevel"] = priority;
    }

    if (filters.length > 0) {
      filterExpression = filters.join(" AND ");
    } else {
      // Clean up if empty
      expressionAttributeNames = undefined as any;
      expressionAttributeValues = undefined as any;
    }

    const command = new ScanCommand({
      TableName: TABLE_NAMES.INCIDENTS,
      ...(filterExpression && { FilterExpression: filterExpression }),
      ...(filterExpression && { ExpressionAttributeNames: expressionAttributeNames }),
      ...(filterExpression && { ExpressionAttributeValues: expressionAttributeValues }),
    });

    const response = await db.send(command);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidents: response.Items || [],
      }),
    };

  } catch (error: any) {
    console.error("Error fetching emergencies:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
