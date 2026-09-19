import { ResponderStatus, IncidentStatus } from '../types';

export function mapResponderStatusToCitizenStatus(responderStatus: ResponderStatus): IncidentStatus {
  switch (responderStatus) {
    case 'ASSIGNED':
    case 'ACCEPTED':
      return 'RESPONDER_ASSIGNED';
    case 'TRAVELLING':
      return 'HELP_ON_THE_WAY';
    case 'ARRIVED':
    case 'HELP_IN_PROGRESS':
      return 'HELP_IN_PROGRESS';
    case 'RESOLVED':
      return 'RESOLVED';
    default:
      // Fallback
      return 'UNDER_REVIEW';
  }
}
