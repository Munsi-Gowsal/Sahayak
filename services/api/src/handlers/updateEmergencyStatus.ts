import { v4 as uuidv4 } from "uuid";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { ResponderStatus, mapResponderStatusToCitizenStatus, TimelineEvent, Incident, Resource } from "@sahayak/shared";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    const role = requireRole(event, ["RESPONDER", "OPERATOR"]);
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");
    const { status, actorId = "RESPONDER", metadata = {} } = body as { status: ResponderStatus, actorId: string, metadata: any };

    if (!id || !status) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing incident ID or status" }) };
    }

    // Validation: state machine for Responder Status
    const validTransitions: Record<string, string[]> = {
      "ASSIGNED": ["ACCEPTED"],
      "ACCEPTED": ["TRAVELLING"],
      "TRAVELLING": ["ARRIVED"],
      "ARRIVED": ["HELP_IN_PROGRESS"],
      "HELP_IN_PROGRESS": ["RESOLVED"],
      "RESOLVED": [] // Terminal state
    };

    // 0. Fetch Incident to check current state
    const incidentResp = await db.send(new GetCommand({
      TableName: TABLE_NAMES.INCIDENTS,
      Key: { id }
    }));
    const incident = incidentResp.Item as Incident;

    if (!incident) {
      return { statusCode: 404, body: JSON.stringify({ error: "Incident not found" }) };
    }

    // Determine current responder status from timeline (most recent STATUS_CHANGE by RESPONDER)
    const lastResponderEvent = [...(incident.timeline || [])]
      .reverse()
      .find(e => e.actorRole === "RESPONDER" && e.metadata?.responderStatus);
    
    // Default to ASSIGNED if no previous responder event found (it means it was just assigned by OPERATOR)
    const currentResponderStatus = lastResponderEvent?.metadata?.responderStatus || "ASSIGNED";

    // Validate transition
    if (status !== currentResponderStatus && !validTransitions[currentResponderStatus]?.includes(status)) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ 
          error: `Invalid status transition from ${currentResponderStatus} to ${status}` 
        }) 
      };
    }

    const citizenStatus = mapResponderStatusToCitizenStatus(status);
    const now = new Date().toISOString();

    const newTimelineEvent: TimelineEvent = {
      id: uuidv4(),
      type: "STATUS_CHANGE",
      actorId,
      actorRole: "RESPONDER",
      timestamp: now,
      metadata: { responderStatus: status, citizenStatus, ...metadata }
    };

    // 1. Update Incident
    await db.send(new UpdateCommand({
      TableName: TABLE_NAMES.INCIDENTS,
      Key: { id },
      UpdateExpression: "SET #status = :s, updatedAt = :u, timeline = list_append(timeline, :t)",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":s": citizenStatus,
        ":u": now,
        ":t": [newTimelineEvent]
      }
    }));

    // 2. If RESOLVED, free up the resource
    if (status === "RESOLVED") {
      if (incident?.assignedResource) {
        await db.send(new UpdateCommand({
          TableName: TABLE_NAMES.RESOURCES,
          Key: { id: incident.assignedResource },
          UpdateExpression: "SET #status = :s, assignedIncidentId = :null, updatedAt = :u",
          ExpressionAttributeNames: {
            "#status": "status"
          },
          ExpressionAttributeValues: {
            ":s": "AVAILABLE",
            ":null": null,
            ":u": now
          }
        }));
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Status updated successfully",
        incidentId: id,
        citizenStatus,
        responderStatus: status
      }),
    };

  } catch (error: any) {
    console.error(`Error updating emergency status ${event.pathParameters?.id}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
