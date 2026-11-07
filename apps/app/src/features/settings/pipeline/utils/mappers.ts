import { emptyToNull } from '@/lib/utils/strings';

import type { RuleFormValues, SettingFormValues } from '../schemas';
import { type DistributionRule, type Setting, type SettingKind, STAGE_KINDS } from '../types';

export const EMPTY_SETTING_FORM: SettingFormValues = {
  name_ar: '',
  name_en: '',
  key: '',
  position: undefined,
  color: '',
  is_won: false,
  is_lost: false,
  is_active: true,
};

export const EMPTY_RULE_FORM: RuleFormValues = {
  team_id: '',
  strategy: 'round_robin',
  is_active: true,
};

export function toSettingFormValues(setting: Setting): SettingFormValues {
  return {
    name_ar: setting.name_ar,
    name_en: setting.name_en ?? '',
    key: setting.key,
    position: setting.position,
    color: setting.color ?? '',
    is_won: setting.is_won ?? false,
    is_lost: setting.is_lost ?? false,
    is_active: setting.is_active ?? true,
  };
}

/** The API rejects `key` on update (it is permanent) and ignores stage fields for sources. */
export function toSettingPayload(kind: SettingKind, values: SettingFormValues, isCreate: boolean) {
  const base = {
    ...(isCreate ? { key: emptyToNull(values.key) } : {}),
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
  };

  if (!STAGE_KINDS.includes(kind)) return { ...base, is_active: values.is_active };

  return {
    ...base,
    ...(values.position === undefined ? {} : { position: values.position }),
    color: emptyToNull(values.color),
    is_won: values.is_won,
    is_lost: values.is_lost,
  };
}

export function toRuleFormValues(rule: DistributionRule): RuleFormValues {
  return { team_id: String(rule.team_id), strategy: rule.strategy, is_active: rule.is_active };
}

export function toRulePayload(values: RuleFormValues) {
  return {
    team_id: Number(values.team_id),
    strategy: values.strategy,
    is_active: values.is_active,
  };
}
