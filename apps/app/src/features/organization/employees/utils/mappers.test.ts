import { describe, expect, it } from 'vitest';

import type { Employee } from '../types';
import {
  canChangeStatus,
  EMPTY_EMPLOYEE_FORM,
  toEmployeeFormValues,
  toEmployeePayload,
  toOffboardPayload,
} from './mappers';

const employee: Employee = {
  id: 11,
  employee_code: 'EMP-011',
  name: 'Mohamed Hassan',
  email: 'm.hassan@demo.test',
  phone: '+20100',
  job_title: 'Sales rep',
  status: 'active',
  is_owner: false,
  locale: 'en',
  hired_at: '2025-03-03',
  commission_rate: '2.50',
  branch: { id: 1, name: 'Cairo' },
  department: { id: 2, name: 'Sales' },
  team: { id: 3, name: 'Team A' },
  manager: { id: 4, name: 'Sara' },
};

describe('toEmployeePayload', () => {
  it('lower-cases the email because the API rejects capitals', () => {
    const payload = toEmployeePayload({
      ...EMPTY_EMPLOYEE_FORM,
      name: 'A',
      email: ' A@Demo.TEST ',
    });

    expect(payload.email).toBe('a@demo.test');
  });

  it('leaves a blank password out so editing keeps the current one', () => {
    const payload = toEmployeePayload({ ...EMPTY_EMPLOYEE_FORM, name: 'A', email: 'a@b.co' });

    expect(payload).not.toHaveProperty('password');
  });

  it('sends a typed password', () => {
    const payload = toEmployeePayload({
      ...EMPTY_EMPLOYEE_FORM,
      name: 'A',
      email: 'a@b.co',
      password: 'secret-pass',
    });

    expect(payload.password).toBe('secret-pass');
  });

  it('turns picker strings into integers and empties into null', () => {
    const payload = toEmployeePayload({
      ...EMPTY_EMPLOYEE_FORM,
      name: 'A',
      email: 'a@b.co',
      branch_id: '1',
      team_id: '3',
    });

    expect(payload).toMatchObject({
      branch_id: 1,
      team_id: 3,
      department_id: null,
      manager_id: null,
      hired_at: null,
      commission_rate: null,
    });
  });

  it('keeps a commission of 0 instead of treating it as empty', () => {
    const payload = toEmployeePayload({
      ...EMPTY_EMPLOYEE_FORM,
      name: 'A',
      email: 'a@b.co',
      commission_rate: 0,
    });

    expect(payload.commission_rate).toBe(0);
  });
});

describe('toEmployeeFormValues', () => {
  it('turns relations into picker strings and a decimal string into a number', () => {
    expect(toEmployeeFormValues(employee)).toMatchObject({
      branch_id: '1',
      department_id: '2',
      team_id: '3',
      manager_id: '4',
      commission_rate: 2.5,
      locale: 'en',
      password: '',
    });
  });

  it('handles an employee with no relations, rate or code', () => {
    const values = toEmployeeFormValues({
      ...employee,
      employee_code: null,
      commission_rate: null,
      branch: null,
      team: null,
      manager: null,
    });

    expect(values).toMatchObject({
      employee_code: '',
      commission_rate: undefined,
      branch_id: '',
      team_id: '',
      manager_id: '',
    });
  });
});

describe('toOffboardPayload', () => {
  it('sends the new owner as an integer and a blank reason as null', () => {
    expect(toOffboardPayload({ reassign_to: '7', reason: '  ' })).toEqual({
      reassign_to: 7,
      reason: null,
    });
    expect(toOffboardPayload({ reassign_to: '', reason: 'resigned' })).toEqual({
      reassign_to: null,
      reason: 'resigned',
    });
  });
});

describe('canChangeStatus', () => {
  it('protects the company owner', () => {
    expect(canChangeStatus(employee)).toBe(true);
    expect(canChangeStatus({ ...employee, is_owner: true })).toBe(false);
  });
});
