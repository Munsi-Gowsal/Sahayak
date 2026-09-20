import { z } from 'zod';

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

export const EmergencyFactsSchema = z.object({
  people: z.number().int().nonnegative().optional().describe("Number of people involved. Omit if unknown."),
  vulnerablePeople: z.number().int().nonnegative().optional().describe("Number of vulnerable people (elderly, infants, sick). Omit if unknown."),
  mobilityIssue: z.boolean().optional().describe("Whether any person has a mobility issue. Omit if unknown."),
  waterIntrusion: z.boolean().optional().describe("Whether water has entered the premises. Omit if unknown."),
  immediateDanger: z.boolean().optional().describe("Whether there is immediate danger to life. Omit if unknown."),
  need: z.string().optional().describe("The primary need (e.g. evacuation, medical, supplies). Omit if unknown."),
  equipmentRequired: z.array(z.string()).describe("Required equipment like 'boat', 'ambulance'. Return empty array if unknown."),
  location: LocationSchema.optional().describe("Omit if the location cannot be accurately determined from the report."),
  missingInformation: z.array(z.string()).describe("List of critical fields that were missing from the citizen report, e.g. ['people', 'location', 'need']")
});
