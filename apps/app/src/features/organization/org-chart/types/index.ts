import { z } from 'zod';

/** Written out because the node refers to itself through `children`. */
export interface OrgChartNode {
  id: number;
  name: string;
  job_title?: string | null;
  department?: string | null;
  team?: string | null;
  children: OrgChartNode[];
}

export const orgChartNodeSchema: z.ZodType<OrgChartNode> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    job_title: z.string().nullish(),
    department: z.string().nullish(),
    team: z.string().nullish(),
    children: z.array(orgChartNodeSchema),
  }),
);

export const orgChartResponseSchema = z.object({ data: z.array(orgChartNodeSchema) });
