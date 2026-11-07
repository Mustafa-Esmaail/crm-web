import { toNumber } from '@/lib/utils/number';
import { emptyToNull, idOrNull } from '@/lib/utils/strings';

import type { LeadFormValues } from '../schemas';
import type { Lead, LeadStage } from '../types';

export const EMPTY_LEAD_FORM: LeadFormValues = {
  name: '',
  phone: '',
  email: '',
  source_id: '',
  budget: undefined,
  notes: '',
  owner_id: '',
  team_id: '',
};

/** API resource -> form values (nulls become '' because inputs are always strings). */
export function toLeadFormValues(lead: Lead): LeadFormValues {
  return {
    name: lead.name,
    phone: lead.phone ?? '',
    email: lead.email ?? '',
    source_id: lead.source ? String(lead.source.id) : '',
    budget: toNumber(lead.budget) ?? undefined,
    notes: lead.notes ?? '',
    owner_id: lead.owner ? String(lead.owner.id) : '',
    team_id: lead.team ? String(lead.team.id) : '',
  };
}

/** Form values -> request body, the inverse of the mapper above. */
export function toLeadPayload(values: LeadFormValues) {
  return {
    name: values.name.trim(),
    phone: emptyToNull(values.phone),
    email: emptyToNull(values.email),
    source_id: idOrNull(values.source_id),
    budget: values.budget ?? null,
    notes: emptyToNull(values.notes),
    owner_id: idOrNull(values.owner_id),
    team_id: idOrNull(values.team_id),
  };
}

/** Moving to a "lost" stage needs a reason; any other move sends none. */
export function toStageChangePayload(
  values: { stage_id: string; lost_reason: string },
  stages: LeadStage[],
) {
  const stage = stages.find((candidate) => String(candidate.id) === values.stage_id);

  return {
    stage_id: Number(values.stage_id),
    lost_reason: stage?.is_lost ? emptyToNull(values.lost_reason) : null,
  };
}

/** Stages a lead can move to: every stage except the one it is already in. */
export function getMoveTargets(lead: Lead, stages: LeadStage[]): LeadStage[] {
  return stages.filter((stage) => stage.id !== lead.stage?.id);
}
