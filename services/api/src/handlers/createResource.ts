import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { Resource } from "@sahayak/shared";
import { v4 as uuidv4 } from "uuid";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    requireRole(event, ["OPERATOR"]);
    const body = JSON.parse(event.body || "{}");
    
    if (!body.name || !body.type || !body.location) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required resource fields" }),
      };
    }

    const now = new Date().toISOString();
    const resource: Resource = {
      id: body.id || `RES-${uuidv4().substring(0, 8).toUpperCase()}`,
      name: body.name,
      type: body.type,
      location: body.location,
      capacity: body.capacity || 1,
      equipment: body.equipment || [],
      status: body.status || "AVAILABLE",
      updatedAt: now,
    };

    await db.send(new PutCommand({
      TableName: TABLE_NAMES.RESOURCES,
      Item: resource
    }));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Resource created successfully",
        resource
      }),
    };
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
