import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAMES } from "../services/api/src/db/client";
import { Resource } from "@sahayak/shared";

const mockResources: Resource[] = [
  {
    id: "res-1",
    name: "Rescue Team A",
    type: "Rescue",
    status: "AVAILABLE",
    capacity: 6,
    equipment: ["boat", "ropes", "lifejackets"],
    location: { latitude: 12.9800, longitude: 77.6000 },
    updatedAt: new Date().toISOString()
  },
  {
    id: "res-2",
    name: "Medical Team B",
    type: "Medical",
    status: "AVAILABLE",
    capacity: 2,
    equipment: ["ambulance", "first-aid", "stretcher"],
    location: { latitude: 12.9750, longitude: 77.5900 },
    updatedAt: new Date().toISOString()
  },
  {
    id: "res-3",
    name: "Evacuation Bus 1",
    type: "Transport",
    status: "AVAILABLE",
    capacity: 40,
    equipment: [],
    location: { latitude: 12.9600, longitude: 77.5800 },
    updatedAt: new Date().toISOString()
  }
];

async function seedData() {
  console.log("Seeding DynamoDB with mock resources...");
  try {
    for (const resource of mockResources) {
      await db.send(new PutCommand({
        TableName: TABLE_NAMES.RESOURCES,
        Item: resource
      }));
      console.log(`Seeded resource: ${resource.name} (${resource.id})`);
    }
    console.log("Seeding complete.");
  } catch (error: any) {
    console.error("Error seeding data:", error.message);
    console.log("Make sure your AWS credentials are set and DynamoDB tables exist.");
  }
}

seedData();
