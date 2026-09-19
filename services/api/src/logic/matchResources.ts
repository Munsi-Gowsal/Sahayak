import { EmergencyFacts, Resource } from '@sahayak/shared';

export interface MatchedResource extends Resource {
  distanceKm: number;
  compatibility: 'HIGH' | 'MEDIUM' | 'LOW';
  matchReasons: string[];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function matchResources(facts: EmergencyFacts, availableResources: Resource[]): MatchedResource[] {
  const candidates: MatchedResource[] = [];

  for (const resource of availableResources) {
    // Hard filter 1: Must be AVAILABLE
    if (resource.status !== 'AVAILABLE') continue;

    // Hard filter 2: Must have enough capacity
    if (resource.capacity < (facts.people || 0)) continue;

    // Hard filter 3: Must have required equipment
    const hasRequiredEquipment = facts.equipmentRequired.every(eq => 
      resource.equipment.some(re => re.toLowerCase() === eq.toLowerCase())
    );
    if (!hasRequiredEquipment) continue;

    // Passed hard filters. Calculate distance.
    const distanceKm = facts.location ? calculateDistance(
      facts.location.latitude,
      facts.location.longitude,
      resource.location.latitude,
      resource.location.longitude
    ) : 0;

    const matchReasons: string[] = [];
    matchReasons.push(`Distance: ${distanceKm.toFixed(1)} km`);
    matchReasons.push(`Capacity: ${resource.capacity} (Needs ${facts.people})`);
    
    if (facts.equipmentRequired.length > 0) {
      matchReasons.push(`Equipment match: ${facts.equipmentRequired.join(', ')}`);
    }

    let compatibility: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (distanceKm < 5) {
      compatibility = 'HIGH';
    } else if (distanceKm < 15) {
      compatibility = 'MEDIUM';
    }

    candidates.push({
      ...resource,
      distanceKm,
      compatibility,
      matchReasons
    });
  }

  // Sort by HIGH compatibility first, then by closest distance
  candidates.sort((a, b) => {
    if (a.compatibility === b.compatibility) {
      return a.distanceKm - b.distanceKm;
    }
    if (a.compatibility === 'HIGH') return -1;
    if (b.compatibility === 'HIGH') return 1;
    if (a.compatibility === 'MEDIUM') return -1;
    return 1;
  });

  return candidates;
}
