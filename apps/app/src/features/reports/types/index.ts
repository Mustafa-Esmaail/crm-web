import { z } from 'zod';

const count = z.number();

export const overviewSchema = z.object({
  data: z.object({
    period: z.object({ from: z.string().nullable(), to: z.string().nullable() }),
    leads: z.object({
      summary: z.object({
        total: count,
        open: count,
        won: count,
        lost: count,
        conversion_rate: z.number(),
      }),
      by_stage: z.array(
        z.object({ stage_id: z.number(), key: z.string(), name: z.string().nullable(), count }),
      ),
      by_source: z.array(
        z.object({ source_id: z.number().nullable(), name: z.string().nullable(), count }),
      ),
      per_day: z.array(z.object({ date: z.string(), count })),
    }),
    deals: z.object({
      total: count,
      open: count,
      won: count,
      lost: count,
      open_value: z.union([z.string(), z.number()]),
      won_value: z.union([z.string(), z.number()]),
      commission: z.union([z.string(), z.number()]),
    }),
  }),
});

export type Overview = z.infer<typeof overviewSchema>['data'];

const money = z.union([z.string(), z.number()]);

// ReportService::agentPerformance; the spec documents it only as `array`, so it is not in the
// contract test. Rows come sorted by won value, then leads.
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
    }),
  ),
});

export type AgentPerformanceRow = z.infer<typeof agentPerformanceSchema>['data'][number];
