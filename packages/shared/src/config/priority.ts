export const PRIORITY_WEIGHTS = {
  immediateDanger: 5,
  vulnerablePerson: 4,
  multiplePeople: 3,
  evacuation: 3,
  mobilityIssue: 2
} as const;

export const PRIORITY_BANDS = {
  NORMAL: { min: 0, max: 5 },
  HIGH: { min: 6, max: 10 },
  CRITICAL: { min: 11, max: Infinity }
} as const;
