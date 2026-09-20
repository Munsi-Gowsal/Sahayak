import { EmergencyFacts, Priority, PriorityLevel, PRIORITY_WEIGHTS, PRIORITY_BANDS } from '@sahayak/shared';

export function calculatePriority(facts: EmergencyFacts): Priority {
  let score = 0;
  const reasons: string[] = [];

  if (facts.immediateDanger) {
    score += PRIORITY_WEIGHTS.immediateDanger;
    reasons.push('Immediate danger to life reported');
  }

  if (facts.vulnerablePeople !== undefined && facts.vulnerablePeople > 0) {
    score += 40;
    reasons.push(`${facts.vulnerablePeople} vulnerable people involved`);
  }

  if (facts.people !== undefined && facts.people > 1) {
    score += 20;
    reasons.push(`Multiple people (${facts.people}) affected`);
  }

  if (facts.need !== undefined && facts.need.toLowerCase().includes('evacuation')) {
    score += 30;
    reasons.push('Evacuation required');
  }

  if (facts.mobilityIssue) {
    score += PRIORITY_WEIGHTS.mobilityIssue;
    reasons.push('Mobility issues reported');
  }

  let level: PriorityLevel = 'NORMAL';
  if (score >= PRIORITY_BANDS.CRITICAL.min) {
    level = 'CRITICAL';
  } else if (score >= PRIORITY_BANDS.HIGH.min) {
    level = 'HIGH';
  } else if (score > PRIORITY_BANDS.NORMAL.min) {
    // Note: The UI mentions a MEDIUM tier, but deterministic rules only specify NORMAL/HIGH/CRITICAL.
    // For now we map strictly as specified.
    level = 'NORMAL';
  }

  return {
    score,
    level,
    reasons,
  };
}
