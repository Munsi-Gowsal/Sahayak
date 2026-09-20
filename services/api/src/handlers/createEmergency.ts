import { v4 as uuidv4 } from "uuid";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../db/client";
import { extractEmergencyFacts } from "../ai/extractEmergencyFacts";
import { calculatePriority } from "../logic/calculatePriority";
import { matchResources } from "../logic/matchResources";
import { EmergencyFactsSchema, LocationSchema, Incident, Resource } from "@sahayak/shared";
import { requireRole } from "../utils/auth";

export const handler = async (event: any) => {
  try {
    requireRole(event, ["CITIZEN", "OPERATOR"]);
    const body = JSON.parse(event.body || "{}");
    const { originalReport, location } = body;

    if (!originalReport) {
      return { statusCode: 400, body: JSON.stringify({ error: "originalReport is required" }) };
    }

    // 1. Extract facts using Bedrock
    let facts: any = { equipmentRequired: [], missingInformation: ["people", "location", "need"] };
    let extractionFailed = false;

    try {
      facts = await extractEmergencyFacts(originalReport);
    } catch (err) {
      console.warn("Bedrock extraction failed, marking as INCOMPLETE");
      extractionFailed = true;
    }

    // If location is provided in request, override the Bedrock extracted location
    if (location) {
      facts.location = LocationSchema.parse(location);
      // Remove location from missingInformation if it was there
      facts.missingInformation = facts.missingInformation?.filter((i: string) => i !== 'location') || [];
    }

    // 2. Validate facts
    let validatedFacts;
    try {
      validatedFacts = EmergencyFactsSchema.parse(facts);
    } catch (e) {
      console.warn("Schema validation failed, marking as INCOMPLETE", e);
      extractionFailed = true;
      validatedFacts = facts as any; // fallback
    }

    // 3. Determine status and calculate priority
    const isMissingCritical = 
      !validatedFacts.location || 
      validatedFacts.people === undefined || 
      validatedFacts.missingInformation?.includes('location') ||
      validatedFacts.missingInformation?.includes('people');
      
    const status = (extractionFailed || isMissingCritical) ? "INCOMPLETE" : "SUBMITTED";

    const priority = status === "INCOMPLETE" 
      ? { score: 0, level: 'NORMAL' as const, reasons: ["Information incomplete. Manual review required."] }
      : calculatePriority(validatedFacts);

    // 4. Resource matching
    let recommendedResources: string[] = [];
    if (status !== "INCOMPLETE") {
      const resourcesResp = await db.send(new ScanCommand({ TableName: TABLE_NAMES.RESOURCES }));
      const availableResources = (resourcesResp.Items || []) as Resource[];
      const matched = matchResources(validatedFacts, availableResources);
      recommendedResources = matched.map(r => r.id);
    }
    
    // 5. Create Incident record
    const incidentId = `SAH-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const incident: Incident = {
      id: incidentId,
      originalReport,
      facts: validatedFacts,
      priority,
      status,
      recommendedResources, 
      evidence: body.evidence || [],
      missingInformation: validatedFacts.missingInformation || [],
      timeline: [
        {
          id: uuidv4(),
          type: "STATUS_CHANGE",
          actorId: "CITIZEN",
          actorRole: "CITIZEN",
          timestamp: now,
          metadata: { status }
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Save to DynamoDB
    await db.send(new PutCommand({
      TableName: TABLE_NAMES.INCIDENTS,
      Item: incident
    }));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: status === "INCOMPLETE" ? "Emergency report saved but requires manual review" : "Emergency report created successfully",
        incidentId: incident.id,
        priority: priority.level,
        status
      }),
    };

  } catch (error: any) {
    console.error("Error creating emergency:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
