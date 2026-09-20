import { mapResponderStatusToCitizenStatus } from '@sahayak/shared';

describe('statusMapping', () => {
  it('should map ASSIGNED and ACCEPTED to RESPONDER_ASSIGNED', () => {
    expect(mapResponderStatusToCitizenStatus('ASSIGNED')).toBe('RESPONDER_ASSIGNED');
    expect(mapResponderStatusToCitizenStatus('ACCEPTED')).toBe('RESPONDER_ASSIGNED');
  });

  it('should map TRAVELLING to HELP_ON_THE_WAY', () => {
    expect(mapResponderStatusToCitizenStatus('TRAVELLING')).toBe('HELP_ON_THE_WAY');
  });

  it('should map ARRIVED and HELP_IN_PROGRESS to HELP_IN_PROGRESS', () => {
    expect(mapResponderStatusToCitizenStatus('ARRIVED')).toBe('HELP_IN_PROGRESS');
    expect(mapResponderStatusToCitizenStatus('HELP_IN_PROGRESS')).toBe('HELP_IN_PROGRESS');
  });

  it('should map RESOLVED to RESOLVED', () => {
    expect(mapResponderStatusToCitizenStatus('RESOLVED')).toBe('RESOLVED');
  });
});
