import { z } from 'zod';

const count = z.number();
const money = z.union([z.string(), z.number()]);
const period = z.object({ from: z.string().nullable(), to: z.string().nullable() });

const leadSummary = z.object({
  total: count,
  open: count,
  won: count,
  lost: count,
  conversion_rate: z.number(),
});

const dealSummary = z.object({
  total: count,
  open: count,
  won: count,
  lost: count,
  open_value: money,
  won_value: money,
  commission: money,
});

const taskSummary = z.object({
  assigned: count,
  completed: count,
  completed_on_time: count,
  on_time_rate: z.number(),
  open: count,
  overdue: count,
});

// PHP encodes an empty associative array as [], so an empty "by type" map arrives as a list.
const countsByKey = z
  .union([z.record(z.string(), count), z.array(z.never())])
  .transform((value) => (Array.isArray(value) ? {} : value));

const activityTotals = z.object({ total: count, by_type: countsByKey });

const firstResponse = z.object({
  leads: count,
  responded: count,
  avg_hours: z.number().nullable(),
});

const headline = z.object({
  leads: leadSummary,
  deals: dealSummary,
  tasks: taskSummary,
  activities: activityTotals,
});

const byStage = z.array(
  z.object({ stage_id: z.number(), key: z.string(), name: z.string().nullable(), count }),
);

const perDay = z.array(z.object({ date: z.string(), count }));

const activitiesPerDay = z.array(
  z.object({ date: z.string(), total: count, by_type: countsByKey }),
);

const lostReasons = z.array(z.object({ reason: z.string().nullable(), count }));

const revenue = z.object({
  per_month: z.array(z.object({ month: z.string(), count, value: money })),
  won_count: count,
  won_value: money,
  avg_deal_value: money.nullable(),
  avg_cycle_days: z.number().nullable(),
  win_rate: z.number(),
});

export const overviewSchema = z.object({
  data: z.object({
    period,
    leads: z.object({
      summary: leadSummary,
      open_now: count,
      stale: count,
      stale_after_days: count,
      first_response: firstResponse,
      by_stage: byStage,
      by_source: z.array(
        z.object({ source_id: z.number().nullable(), name: z.string().nullable(), count }),
      ),
      per_day: perDay,
    }),
    deals: dealSummary,
    tasks: taskSummary,
    activities: activityTotals,
    previous: headline.nullable(),
  }),
});

export type Overview = z.infer<typeof overviewSchema>['data'];
export type Headline = z.infer<typeof headline>;

export const salesSchema = z.object({
  data: z.object({
    period,
    by_stage: z.array(
      z.object({
        stage_id: z.number(),
        key: z.string(),
        name: z.string().nullable(),
        color: z.string().nullable(),
        is_won: z.boolean(),
        is_lost: z.boolean(),
        count,
        value: money,
      }),
    ),
    revenue,
    forecast: z.record(z.string(), z.object({ count, value: money })),
    lost_reasons: z.object({
      leads: lostReasons,
      deals: z.array(z.object({ reason: z.string().nullable(), count, value: money })),
    }),
  }),
});

export type Sales = z.infer<typeof salesSchema>['data'];

export const activitiesSchema = z.object({
  data: z.object({
    period,
    totals: activityTotals,
    per_day: activitiesPerDay,
    by_employee: z.array(
      z.object({
        employee_id: z.number(),
        name: z.string().nullable(),
        total: count,
        by_type: countsByKey,
      }),
    ),
  }),
});

export type Activities = z.infer<typeof activitiesSchema>['data'];

export const agentPerformanceSchema = z.object({
  data: z.array(
    z.object({
      employee_id: z.number(),
      name: z.string().nullable(),
      leads: count,
      leads_won: count,
      conversion_rate: z.number(),
      deals: count,
      deals_won: count,
      won_value: money,
      commission: money,
      activities: count,
      calls: count,
      meetings: count,
      open_leads: count,
      stale_leads: count,
      avg_first_response_hours: z.number().nullable(),
      tasks_completed: count,
      tasks_overdue: count,
      tasks_on_time_rate: z.number(),
    }),
  ),
});

export type AgentPerformanceRow = z.infer<typeof agentPerformanceSchema>['data'][number];

export const teamsSchema = z.object({
  data: z.array(
    z.object({
      team_id: z.number().nullable(),
      name: z.string().nullable(),
      leads: count,
      leads_won: count,
      leads_lost: count,
      conversion_rate: z.number(),
      deals: count,
      deals_won: count,
      won_value: money,
    }),
  ),
});

export type TeamRow = z.infer<typeof teamsSchema>['data'][number];

export const scorecardSchema = z.object({
  data: z.object({
    employee: z.object({ id: z.number(), name: z.string().nullable() }),
    period,
    leads: z.object({
      summary: leadSummary,
      open_now: count,
      stale: count,
      stale_after_days: count,
      first_response: firstResponse,
      by_stage: byStage,
      per_day: perDay,
      lost_reasons: lostReasons,
    }),
    deals: z.object({ summary: dealSummary, revenue }),
    tasks: taskSummary,
    activities: activityTotals.extend({ per_day: activitiesPerDay }),
    previous: headline.nullable(),
  }),
});

export type Scorecard = z.infer<typeof scorecardSchema>['data'];
