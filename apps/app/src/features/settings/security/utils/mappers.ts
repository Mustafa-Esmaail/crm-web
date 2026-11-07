import type { SecurityFormValues } from '../schemas';
import type { SecurityPolicy } from '../types';

export function toSecurityFormValues(policy: SecurityPolicy): SecurityFormValues {
  const hours = policy.login_hours;
  return {
    ip_whitelist: policy.ip_whitelist.join('\n'),
    hours_enabled: hours !== null,
    // Stored as "H:i"; trim seconds in case an older row kept them.
    hours_from: hours?.from.slice(0, 5) ?? '',
    hours_to: hours?.to.slice(0, 5) ?? '',
    hours_days: [...(hours?.days ?? [])].sort((a, b) => a - b),
    require_two_factor: policy.require_two_factor,
    export_requires_approval: policy.export_requires_approval,
  };
}

/** One entry per line (commas also accepted), blanks and repeats dropped, order kept. */
export function parseIpList(text: string): string[] {
  const entries = text
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return [...new Set(entries)];
}

export function toSecurityPayload(values: SecurityFormValues) {
  return {
    ip_whitelist: parseIpList(values.ip_whitelist),
    login_hours: values.hours_enabled
      ? {
          from: values.hours_from,
          to: values.hours_to,
          // An empty list means every day, which the API stores as null.
          days: values.hours_days.length > 0 ? [...values.hours_days].sort((a, b) => a - b) : null,
        }
      : null,
    require_two_factor: values.require_two_factor,
    export_requires_approval: values.export_requires_approval,
  };
}

type FormField = keyof SecurityFormValues;

/**
 * Laravel reports `ip_whitelist.3` or `login_hours.from`; the form has one textarea and flat
 * time fields, so each key is moved onto the field that shows it. A bad IP names its line.
 */
export function mapSecurityErrors(
  fieldErrors: Record<string, string[]>,
  ipEntries: string[],
): { fields: Partial<Record<FormField, string>>; unmapped: string[] } {
  const fields: Partial<Record<FormField, string>> = {};
  const unmapped: string[] = [];
  const put = (field: FormField, message: string) => {
    fields[field] = fields[field] ? `${fields[field]} ${message}` : message;
  };

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages[0];
    if (!message) continue;
    const [root, child] = key.split('.');

    if (root === 'ip_whitelist') {
      const entry = child === undefined ? undefined : ipEntries[Number(child)];
      put('ip_whitelist', entry ? `${entry}: ${message}` : message);
    } else if (root === 'login_hours') {
      if (child === 'to') put('hours_to', message);
      else if (child === 'days') put('hours_days', message);
      else put('hours_from', message);
    } else if (root === 'require_two_factor' || root === 'export_requires_approval') {
      put(root, message);
    } else {
      unmapped.push(message);
    }
  }

  return { fields, unmapped };
}
