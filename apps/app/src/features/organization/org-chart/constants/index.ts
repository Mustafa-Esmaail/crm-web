export const orgChartKeys = {
  all: ['org-chart'] as const,
  tree: (rootId?: number) => [...orgChartKeys.all, 'tree', rootId ?? 'all'] as const,
};
