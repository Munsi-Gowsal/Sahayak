import { extractEmergencyFacts } from './src/ai/extractEmergencyFacts.js';
import { calculatePriority } from './src/logic/calculatePriority.js';
import { matchResources } from './src/logic/matchResources.js';

const DEMO_INPUT = "My mother is trapped inside our house. Water has entered the ground floor. There are 4 people here and she cannot walk.";
const INCOMPLETE_INPUT = "I need help urgently.";

const MOCK_RESOURCES = [
  {
    id: "res-1",
    type: "BOAT",
    status: "AVAILABLE",
    capacity: 6,
    equipment: ["boat", "lifejackets"],
    location: { latitude: 28.6139, longitude: 77.2090, address: "Station A" }
  },
  {
    id: "res-2",
    type: "AMBULANCE",
    status: "AVAILABLE",
    capacity: 2,
    equipment: ["medical", "stretcher"],
    location: { latitude: 28.6239, longitude: 77.2190, address: "Station B" }
  },
  {
    id: "res-3",
    type: "BOAT",
    status: "UNAVAILABLE",
    capacity: 8,
    equipment: ["boat"],
    location: { latitude: 28.6039, longitude: 77.2000, address: "Station C" }
  }
];

async function run() {
  console.log("================= RUNNING PIPELINE TEST =================");
  console.log("\\n--- 1. Testing DEMO INPUT ---");
  console.log(`Input: "${DEMO_INPUT}"`);
  try {
    const facts = await extractEmergencyFacts(DEMO_INPUT);
    console.log("Facts extracted:");
    console.log(JSON.stringify(facts, null, 2));

    // Assume location since bedrock might not find it based on exact text
    if (!facts.location) {
      facts.location = { latitude: 28.61, longitude: 77.21, address: "Unknown" };
    }

    const priority = calculatePriority(facts);
    console.log("\\nPriority extracted:");
    console.log(JSON.stringify(priority, null, 2));

    const matched = matchResources(facts, MOCK_RESOURCES as any);
    console.log("\\nMatched Resources:");
    console.log(JSON.stringify(matched, null, 2));

  } catch (err: any) {
    console.error("Failed DEMO INPUT pipeline:", err.message);
  }

  console.log("\\n--- 2. Testing INCOMPLETE INPUT ---");
  console.log(`Input: "${INCOMPLETE_INPUT}"`);
  try {
    const facts2 = await extractEmergencyFacts(INCOMPLETE_INPUT);
    console.log("Facts extracted:");
    console.log(JSON.stringify(facts2, null, 2));
  } catch (err: any) {
    console.error("Failed INCOMPLETE pipeline:", err.message);
  }
}

run();
