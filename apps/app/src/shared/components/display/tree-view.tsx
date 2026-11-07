'use client';

import { cn } from '@crm/ui';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

type TreeId = number | string;

/** Self-referential so a node's children keep the caller's own node type. */
export interface TreeNode<TNode> {
  id: TreeId;
  children?: TNode[];
}

interface TreeViewProps<TNode extends TreeNode<TNode>> {
  nodes: TNode[];
  renderNode: (node: TNode, state: { depth: number; isExpanded: boolean }) => ReactNode;
  /** Expand every branch on first render; otherwise only the roots are open. */
  isInitiallyExpanded?: boolean;
  className?: string;
}

function collectBranchIds<TNode extends TreeNode<TNode>>(nodes: TNode[]): TreeId[] {
  return nodes.flatMap((node) =>
    node.children?.length ? [node.id, ...collectBranchIds(node.children)] : [],
  );
}

export function TreeView<TNode extends TreeNode<TNode>>({
  nodes,
  renderNode,
  isInitiallyExpanded = true,
  className,
}: TreeViewProps<TNode>) {
  const t = useTranslations('tree');
  const [collapsed, setCollapsed] = useState<Set<TreeId>>(
    () => new Set(isInitiallyExpanded ? [] : collectBranchIds(nodes)),
  );

  const toggle = (id: TreeId) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const renderBranch = (branch: TNode[], depth: number): ReactNode => (
    <ul role={depth === 0 ? 'tree' : 'group'} className={cn(depth > 0 && 'ms-5 border-s ps-2')}>
      {branch.map((node) => {
        const children = node.children?.length ? node.children : undefined;
        const isExpanded = !collapsed.has(node.id);

        return (
          <li
            key={node.id}
            role="treeitem"
            aria-expanded={children ? isExpanded : undefined}
            aria-selected={false}
          >
            <div className="flex items-center gap-1">
              {children ? (
                <button
                  type="button"
                  onClick={() => toggle(node.id)}
                  aria-label={isExpanded ? t('collapse') : t('expand')}
                  className="text-muted-foreground hover:bg-muted flex size-6 shrink-0 items-center justify-center rounded-sm"
                >
                  <ChevronRight
                    className={cn(
                      'size-4 transition-transform rtl:rotate-180',
                      isExpanded && 'rotate-90 rtl:rotate-90',
                    )}
                    aria-hidden
                  />
                </button>
              ) : (
                <span className="size-6 shrink-0" aria-hidden />
              )}
              <div className="min-w-0 flex-1">{renderNode(node, { depth, isExpanded })}</div>
            </div>
            {children && isExpanded && renderBranch(children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return <div className={className}>{renderBranch(nodes, 0)}</div>;
}
