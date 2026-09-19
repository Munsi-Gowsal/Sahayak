import { BedrockRuntimeClient, ConverseCommand, Tool } from "@aws-sdk/client-bedrock-runtime";
import { EmergencyFacts } from "@sahayak/shared";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1"
});

const extractionTool: Tool = {
  toolSpec: {
    name: "extract_emergency_facts",
    description: "Extract structured facts from a citizen's emergency report.",
    inputSchema: {
      json: {
        type: "object",
        properties: {
          people: {
            type: "integer",
            description: "Number of people involved. Omit if unknown."
          },
          vulnerablePeople: {
            type: "integer",
            description: "Number of vulnerable people (elderly, infants, sick). Omit if unknown."
          },
          mobilityIssue: {
            type: "boolean",
            description: "Whether any person has a mobility issue. Omit if unknown."
          },
          waterIntrusion: {
            type: "boolean",
            description: "Whether water has entered the premises. Omit if unknown."
          },
          immediateDanger: {
            type: "boolean",
            description: "Whether there is immediate danger to life. Omit if unknown."
          },
          need: {
            type: "string",
            description: "The primary need (e.g. evacuation, medical, supplies). Omit if unknown."
          },
          equipmentRequired: {
            type: "array",
            items: { type: "string" },
            description: "Required equipment like 'boat', 'ambulance'. Return empty array if unknown."
          },
          location: {
            type: "object",
            properties: {
              latitude: { type: "number" },
              longitude: { type: "number" },
              address: { type: "string" }
            },
            description: "Omit if the location cannot be accurately determined from the report."
          },
          missingInformation: {
            type: "array",
            items: { type: "string" },
            description: "List of critical fields that were missing from the citizen report, e.g. ['people', 'location', 'need']"
          }
        },
        required: ["equipmentRequired", "missingInformation"]
      }
    }
  }
};

async function invokeBedrock(report: string): Promise<EmergencyFacts> {
  const prompt = `
You are an AI assistant designed to extract emergency facts from a citizen's report.
Extract the facts exactly as requested using the extract_emergency_facts tool.

CRITICAL RULES:
- DO NOT GUESS missing information.
- If a value is not explicitly stated or strongly implied by the text, OMIT the field entirely.
- Do NOT use default locations or default numbers of people.
- Populate the 'missingInformation' array with the names of critical fields (like 'people', 'location', 'need') that were NOT provided in the text.

The citizen's report is:
"${report}"
`;

  const command = new ConverseCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    messages: [
      {
        role: "user",
        content: [{ text: prompt }]
      }
    ],
    toolConfig: {
      tools: [extractionTool],
      toolChoice: {
        tool: {
          name: "extract_emergency_facts"
        }
      }
    }
  });

  const response = await client.send(command);
  
  if (response.output?.message?.content) {
    for (const content of response.output.message.content) {
      if (content.toolUse && content.toolUse.name === "extract_emergency_facts") {
        return content.toolUse.input as unknown as EmergencyFacts;
      }
    }
  }
  
  throw new Error("Bedrock did not return the expected tool use.");
}

export async function extractEmergencyFacts(report: string): Promise<EmergencyFacts> {
  let attempt = 0;
  const maxRetries = 1;

  while (attempt <= maxRetries) {
    try {
      const facts = await invokeBedrock(report);
      return facts;
    } catch (error) {
      console.error(`Error invoking Bedrock (Attempt ${attempt + 1}):`, error);
      attempt++;
      if (attempt > maxRetries) {
        throw new Error("Failed to extract emergency facts after retry.");
      }
    }
  }
  throw new Error("Failed to extract emergency facts after retry.");
}
