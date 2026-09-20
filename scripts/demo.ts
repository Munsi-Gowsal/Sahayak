import { handler as createEmergency } from '../services/api/src/handlers/createEmergency';
import { handler as getEmergencies } from '../services/api/src/handlers/getEmergencies';
import { handler as getEmergency } from '../services/api/src/handlers/getEmergency';
import { handler as assignEmergency } from '../services/api/src/handlers/assignEmergency';
import { handler as updateEmergencyStatus } from '../services/api/src/handlers/updateEmergencyStatus';
import { handler as createResource } from '../services/api/src/handlers/createResource';

const demoScenario = "My mother is trapped inside our house. Water has entered the ground floor. There are 4 people here and she cannot walk.";
const defaultLocation = { latitude: 12.9716, longitude: 77.5946, address: "KR Puram" };

function makeEvent(method: string, role: string, body?: any, pathParams?: any, queryParams?: any) {
  return {
    httpMethod: method,
    headers: { "x-mock-role": role },
    body: body ? JSON.stringify(body) : null,
    pathParameters: pathParams || {},
    queryStringParameters: queryParams || {}
  };
}

async function runDemo() {
  console.log("=== SAHAYAK END-TO-END API DEMO ===\n");

  // 1. Create a Resource via OPERATOR
  console.log("0. Provisioning Rescue Team A (OPERATOR)...");
  const resResource = await createResource(makeEvent("POST", "OPERATOR", {
    name: "Rescue Team A",
    type: "Rescue",
    location: { latitude: 12.9800, longitude: 77.6000 },
    capacity: 6,
    equipment: ["boat"],
    status: "AVAILABLE"
  }));
  const resourceData = JSON.parse(resResource.body);
  const resourceId = resourceData.resource.id;
  console.log(`Created Resource: ${resourceId}`);

  // 2. Citizen Submits Report
  console.log(`\n1. Citizen submits emergency report:\n"${demoScenario}"`);
  const resCreate = await createEmergency(makeEvent("POST", "CITIZEN", {
    originalReport: demoScenario,
    location: defaultLocation
  }));
  const createData = JSON.parse(resCreate.body);
  const incidentId = createData.incidentId;
  console.log(`Response: Status=${createData.status}, Priority=${createData.priority}, ID=${incidentId}`);

  // 3. Operator fetches emergencies
  console.log(`\n2. Operator reviews queue...`);
  const resQueue = await getEmergencies(makeEvent("GET", "OPERATOR"));
  const queueData = JSON.parse(resQueue.body);
  const incident = queueData.find((i: any) => i.id === incidentId);
  console.log(`Extracted Facts: ${JSON.stringify(incident.facts)}`);
  console.log(`Priority Score: ${incident.priority.score}`);

  // 4. Operator assigns resource
  console.log(`\n3. Operator assigns ${resourceId} to ${incidentId}...`);
  const resAssign = await assignEmergency(makeEvent("POST", "OPERATOR", { resourceId }, { id: incidentId }));
  console.log(JSON.parse(resAssign.body).message);

  // 5. Responder progresses status
  const statuses = ["ACCEPTED", "TRAVELLING", "ARRIVED", "HELP_IN_PROGRESS", "RESOLVED"];
  for (const status of statuses) {
    console.log(`\n4. Responder changes status to ${status}...`);
    const resStatus = await updateEmergencyStatus(makeEvent("PUT", "RESPONDER", { status }, { id: incidentId }));
    console.log(JSON.parse(resStatus.body).message);
    
    // Check citizen status sync
    const resCitizen = await getEmergency(makeEvent("GET", "CITIZEN", null, { id: incidentId }));
    const citizenData = JSON.parse(resCitizen.body);
    console.log(`-> Citizen sees status: ${citizenData.status}`);
  }

  console.log("\n=== DEMO COMPLETE ===");
}

runDemo().catch(console.error);
