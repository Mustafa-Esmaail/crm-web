import { toNumber } from '@/lib/utils/number';
import { emptyToNull, idOrNull } from '@/lib/utils/strings';

import type { DealFormValues } from '../schemas';
import type { Deal, DealStage } from '../types';

export const EMPTY_DEAL_FORM: DealFormValues = {
  title: '',
  value: undefined,
  lead_id: '',
  owner_id: '',
  expected_close_date: '',
  notes: '',
};

/** API resource -> form values (nulls become '' because inputs are always strings). */
export function toDealFormValues(deal: Deal): DealFormValues {
  return {
    title: deal.title,
    value: toNumber(deal.value) ?? undefined,
    lead_id: deal.lead_id === null ? '' : String(deal.lead_id),
    owner_id: deal.owner ? String(deal.owner.id) : '',
    // The API may send a full timestamp; the date picker only holds the day.
    expected_close_date: deal.expected_close_date?.slice(0, 10) ?? '',
    notes: deal.notes ?? '',
  };
}

/** Form values -> request body, the inverse of the mapper above. */
export function toDealPayload(values: DealFormValues) {
  return {
    title: values.title.trim(),
    value: values.value ?? null,
    lead_id: idOrNull(values.lead_id),
    owner_id: idOrNull(values.owner_id),
    expected_close_date: emptyToNull(values.expected_close_date),
    notes: emptyToNull(values.notes),
  };
}

/** Moving to a "lost" stage may carry a reason; any other move sends none. */
export function toDealStagePayload(
  values: { stage_id: string; lost_reason: string },
  stages: DealStage[],
) {
  const stage = stages.find((candidate) => String(candidate.id) === values.stage_id);

  return {
    stage_id: Number(values.stage_id),
    lost_reason: stage?.is_lost ? emptyToNull(values.lost_reason) : null,
  };
}

/** Stages a deal can move to: every stage except the one it is already in. */
export function getDealMoveTargets(deal: Deal, stages: DealStage[]): DealStage[] {
  return stages.filter((stage) => stage.id !== deal.stage?.id);
}

/** Deals grouped under their stage, in stage order, for the board. Deals with no stage are dropped. */
export function groupByStage(deals: Deal[], stages: DealStage[]): Map<number, Deal[]> {
  const columns = new Map<number, Deal[]>(stages.map((stage) => [stage.id, []]));
  for (const deal of deals) {
    if (deal.stage) columns.get(deal.stage.id)?.push(deal);
  }
  return columns;
}
