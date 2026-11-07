export type PageItem = number | 'gap';

/**
 * Page buttons for the pager: always the first and last page, the current page and one either
 * side, with a gap marker where pages are skipped. e.g. 1 … 4 5 6 … 20
 */
export function getPageItems(current: number, last: number): PageItem[] {
  if (last <= 1) return [1];

  const wanted = new Set([1, last, current - 1, current, current + 1]);
  const pages = [...wanted].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);

  const items: PageItem[] = [];
  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && page - previous > 1) items.push('gap');
    items.push(page);
  });
  return items;
}
