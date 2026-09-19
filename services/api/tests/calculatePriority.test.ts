import { calculatePriority } from '../src/logic/calculatePriority';
import { EmergencyFacts } from '@sahayak/shared';

describe('calculatePriority', () => {
  it('should correctly calculate priority for the demo scenario', () => {
    const facts: EmergencyFacts = {
      people: 4,
      vulnerablePeople: 1,
      mobilityIssue: true,
      waterIntrusion: true,
      immediateDanger: true,
      need: 'evacuation',
      equipmentRequired: ['boat'],
      location: { latitude: 12.9716, longitude: 77.5946 }
    };

    const result = calculatePriority(facts);

    // 5 (danger) + 40 (vulnerable) + 20 (multiple) + 30 (evacuation) + 2 (mobility) = 97
    expect(result.score).toBe(97);
    expect(result.level).toBe('CRITICAL');
    expect(result.reasons.length).toBe(5);
  });

  it('should return NORMAL for a low severity incident', () => {
    const facts: EmergencyFacts = {
      people: 1,
      vulnerablePeople: 0,
      mobilityIssue: false,
      waterIntrusion: true,
      immediateDanger: false,
      need: 'supplies',
      equipmentRequired: [],
      location: { latitude: 12.9716, longitude: 77.5946 }
    };

    const result = calculatePriority(facts);

    expect(result.score).toBe(0);
    expect(result.level).toBe('NORMAL');
    expect(result.reasons.length).toBe(0);
  });
});
