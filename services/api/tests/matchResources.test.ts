import { matchResources } from '../src/logic/matchResources';
import { EmergencyFacts, Resource } from '@sahayak/shared';

describe('matchResources', () => {
  const incidentLocation = { latitude: 12.9716, longitude: 77.5946 }; // Bangalore

  const facts: EmergencyFacts = {
    people: 4,
    vulnerablePeople: 1,
    mobilityIssue: true,
    waterIntrusion: true,
    immediateDanger: true,
    need: 'evacuation',
    equipmentRequired: ['boat'],
    location: incidentLocation
  };

  it('should match the correct resource based on hard filters', () => {
    const availableResources: Resource[] = [
      {
        id: 'res-1',
        name: 'Rescue Team A',
        type: 'Rescue',
        status: 'AVAILABLE',
        capacity: 6,
        equipment: ['boat', 'ropes'],
        location: { latitude: 12.9800, longitude: 77.6000 }, // Close (approx 1-2 km)
        updatedAt: new Date().toISOString()
      },
      {
        id: 'res-2',
        name: 'Rescue Team B',
        type: 'Rescue',
        status: 'AVAILABLE',
        capacity: 2, // Fails capacity
        equipment: ['boat'],
        location: { latitude: 12.9800, longitude: 77.6000 },
        updatedAt: new Date().toISOString()
      },
      {
        id: 'res-3',
        name: 'Rescue Team C',
        type: 'Rescue',
        status: 'AVAILABLE',
        capacity: 10,
        equipment: ['ambulance'], // Fails equipment
        location: { latitude: 12.9800, longitude: 77.6000 },
        updatedAt: new Date().toISOString()
      },
      {
        id: 'res-4',
        name: 'Rescue Team D',
        type: 'Rescue',
        status: 'DISPATCHED', // Fails status
        capacity: 10,
        equipment: ['boat'],
        location: { latitude: 12.9800, longitude: 77.6000 },
        updatedAt: new Date().toISOString()
      }
    ];

    const matches = matchResources(facts, availableResources);

    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe('res-1');
    expect(matches[0].name).toBe('Rescue Team A');
    expect(matches[0].compatibility).toBe('HIGH');
  });

  it('should rank HIGH compatibility higher than MEDIUM compatibility', () => {
    const availableResources: Resource[] = [
      {
        id: 'res-far',
        name: 'Rescue Team Far',
        type: 'Rescue',
        status: 'AVAILABLE',
        capacity: 10,
        equipment: ['boat'],
        location: { latitude: 12.9000, longitude: 77.5000 }, // approx 13km away
        updatedAt: new Date().toISOString()
      },
      {
        id: 'res-close',
        name: 'Rescue Team Close',
        type: 'Rescue',
        status: 'AVAILABLE',
        capacity: 10,
        equipment: ['boat'],
        location: { latitude: 12.9750, longitude: 77.5900 }, // approx 0.6km away
        updatedAt: new Date().toISOString()
      }
    ];

    const matches = matchResources(facts, availableResources);

    expect(matches.length).toBe(2);
    expect(matches[0].id).toBe('res-close');
    expect(matches[0].compatibility).toBe('HIGH');
    expect(matches[1].id).toBe('res-far');
    expect(matches[1].compatibility).toBe('MEDIUM');
  });
});
