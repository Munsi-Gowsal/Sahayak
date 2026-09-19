import { v4 as uuidv4 } from "uuid";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { Incident, Resource, TimelineEvent } from "@sahayak/shared";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    const role = requireRole(event, ["OPERATOR"]);
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");
    const { resourceId, operatorId = "SYSTEM_OPERATOR" } = body;

    if (!id || !resourceId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing incident ID or resourceId" }) };
    }

    // 1. Fetch Incident
    const incidentResp = await db.send(new GetCommand({
      TableName: TABLE_NAMES.INCIDENTS,
      Key: { id }
    }));
    const incident = incidentResp.Item as Incident;

    if (!incident) {
      return { statusCode: 404, body: JSON.stringify({ error: "Incident not found" }) };
    }

    // 2. Fetch Resource
    const resourceResp = await db.send(new GetCommand({
      TableName: TABLE_NAMES.RESOURCES,
      Key: { id: resourceId }
    }));
    const resource = resourceResp.Item as Resource;

    if (!resource) {
      return { statusCode: 404, body: JSON.stringify({ error: "Resource not found" }) };
    }

    if (resource.status !== "AVAILABLE") {
      return { statusCode: 400, body: JSON.stringify({ error: "Resource is not AVAILABLE" }) };
    }

    const now = new Date().toISOString();

    // 3. Update Incident
    const newTimelineEvent: TimelineEvent = {
      id: uuidv4(),
      type: "RESOURCE_ASSIGNED",
      actorId: operatorId,
      actorRole: "OPERATOR",
      timestamp: now,
      metadata: { resourceId, resourceName: resource.name, status: "RESPONDER_ASSIGNED" }
    };

    await db.send(new UpdateCommand({
      TableName: TABLE_NAMES.INCIDENTS,
      Key: { id },
      UpdateExpression: "SET assignedResource = :r, #status = :s, updatedAt = :u, timeline = list_append(timeline, :t)",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":r": resourceId,
        ":s": "RESPONDER_ASSIGNED",
        ":u": now,
        ":t": [newTimelineEvent]
      }
    }));

    // 4. Update Resource
    await db.send(new UpdateCommand({
      TableName: TABLE_NAMES.RESOURCES,
      Key: { id: resourceId },
      UpdateExpression: "SET #status = :s, assignedIncidentId = :i, updatedAt = :u",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":s": "DISPATCHED",
        ":i": id,
        ":u": now
      }
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Resource assigned successfully",
        incidentId: id,
        resourceId
      }),
    };

  } catch (error: any) {
    console.error(`Error assigning resource to emergency ${event.pathParameters?.id}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
