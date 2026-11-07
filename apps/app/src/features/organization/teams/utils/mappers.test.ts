import { describe, expect, it } from 'vitest';

import type { Team } from '../types';
import { EMPTY_TEAM_FORM, getTeamStatus, toTeamFormValues, toTeamPayload } from './mappers';

const team: Team = {
  id: 4,
  name: 'Alpha',
  name_ar: 'ألفا',
  name_en: null,
  is_active: true,
  department: { id: 2, name: 'Sales' },
  leader: { id: 9, name: 'Omar' },
  members_count: 5,
};

describe('toTeamPayload', () => {
  it('sends the department as an integer and a cleared leader as null', () => {
    expect(toTeamPayload({ ...EMPTY_TEAM_FORM, department_id: '2', name_ar: ' ألفا ' })).toEqual({
      department_id: 2,
      name_ar: 'ألفا',
      name_en: null,
      leader_id: null,
      is_active: true,
    });
  });

  it('keeps the leader id as an integer', () => {
    expect(
      toTeamPayload({ ...EMPTY_TEAM_FORM, department_id: '2', name_ar: 'x', leader_id: '9' })
        .leader_id,
    ).toBe(9);
  });
});

describe('toTeamFormValues', () => {
  it('turns relations into picker strings and nulls into empty strings', () => {
    expect(toTeamFormValues(team)).toEqual({
      department_id: '2',
      name_ar: 'ألفا',
      name_en: '',
      leader_id: '9',
      is_active: true,
    });
  });

  it('round-trips into the same payload', () => {
    expect(toTeamPayload(toTeamFormValues(team))).toMatchObject({ department_id: 2, leader_id: 9 });
  });

  it('copes with a team that has no leader', () => {
    expect(toTeamFormValues({ ...team, leader: null }).leader_id).toBe('');
  });
});

describe('getTeamStatus', () => {
  it('maps the flag onto the badge vocabulary', () => {
    expect(getTeamStatus(team)).toBe('active');
    expect(getTeamStatus({ ...team, is_active: false })).toBe('inactive');
  });
});
