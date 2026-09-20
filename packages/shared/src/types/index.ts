export type PriorityLevel = 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Priority {
  score: number;
  level: PriorityLevel;
  reasons: string[];
}

export type IncidentStatus = 
  | 'SUBMITTED' 
  | 'INCOMPLETE'
  | 'UNDER_REVIEW' 
  | 'RESPONDER_ASSIGNED' 
  | 'HELP_ON_THE_WAY' 
  | 'HELP_IN_PROGRESS' 
  | 'RESOLVED';

export interface EmergencyFacts {
  people?: number;
  vulnerablePeople?: number;
  mobilityIssue?: boolean;
  waterIntrusion?: boolean;
  immediateDanger?: boolean;
  need?: string;
  equipmentRequired: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  missingInformation: string[];
}

export interface Incident {
  id: string;
  originalReport: string;
  facts: EmergencyFacts;
  priority: Priority;
  status: IncidentStatus;
  recommendedResources: string[];
  assignedResource?: string;
  evidence: string[];
  missingInformation: string[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type ResourceStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'DISPATCHED' | 'MAINTENANCE';

export interface Resource {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  capacity: number;
  equipment: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  assignedIncidentId?: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: string;
  actorId: string;
  actorRole: 'CITIZEN' | 'OPERATOR' | 'RESPONDER' | 'SYSTEM';
  timestamp: string;
  metadata?: Record<string, any>;
}

export type ResponderStatus = 
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'TRAVELLING'
  | 'ARRIVED'
  | 'HELP_IN_PROGRESS'
  | 'RESOLVED';
