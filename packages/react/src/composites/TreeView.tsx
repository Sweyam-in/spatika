import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";

export type TreeViewNode = {
  id: string;
  label: React.ReactNode;
  /** Plain text for type-ahead when `label` is not a string. */
  textValue?: string;
  icon?: React.ReactNode;
  /** Trailing content — a count, size or status. */
  meta?: React.ReactNode;
  children?: TreeViewNode[];
  disabled?: boolean;
};

export type TreeViewProps = {
  items: TreeViewNode[];
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** Enter or double-click on a node (open a file, navigate). */
  onActivate?: (node: TreeViewNode) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

type Visible = { node: TreeViewNode; level: number; parent: TreeViewNode | null };

function flatten(items: TreeViewNode[], expanded: Set<string>, level = 1, parent: TreeViewNode | null = null): Visible[] {
  return items.flatMap((node) => [
    { node, level, parent },
    ...(node.children?.length && expanded.has(node.id) ? flatten(node.children, expanded, level + 1, node) : []),
  ]);
}

function textOf(node: TreeViewNode) {
  return (node.textValue ?? (typeof node.label === "string" ? node.label : "")).toLowerCase();
}

/**
 * Hierarchical list (file browsers, org charts, nested navigation) following the WAI-ARIA
 * tree pattern: one tab stop, ArrowUp / ArrowDown between visible nodes, ArrowRight expands or
 * enters, ArrowLeft collapses or goes to the parent, Home / End, `*` expands siblings, type-ahead.
 */
export function TreeView({
  items,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  onActivate,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  className,
}: TreeViewProps) {
  const [expandedState, setExpanded] = useControllableState<string[]>({
    prop: expandedProp,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });
  const [selected, setSelected] = useControllableState<string | null>({
    prop: selectedProp,
    defaultProp: defaultSelected,
    onChange: onSelectedChange,
  });
  const expanded = React.useMemo(() => new Set(expandedState ?? []), [expandedState]);
  const visible = React.useMemo(() => flatten(items, expanded), [items, expanded]);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLUListElement | null>(null);
  const typeahead = React.useRef({ query: "", timer: 0 });

  // The single tab stop: the focused node, else the selection, else the first node.
  const activeId =
    (focusedId && visible.some((v) => v.node.id === focusedId) ? focusedId : null) ??
    (selected && visible.some((v) => v.node.id === selected) ? selected : null) ??
    visible[0]?.node.id ??
    null;

  const focusNode = (id: string) => {
    setFocusedId(id);
    requestAnimationFrame(() =>
      Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-tree-id]") ?? [])
        .find((element) => element.dataset.treeId === id)
        ?.focus(),
    );
  };

  const toggle = (id: string, open?: boolean) => {
    const next = new Set(expanded);
    if (open ?? !next.has(id)) next.add(id);
    else next.delete(id);
    setExpanded([...next]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const index = visible.findIndex((v) => v.node.id === activeId);
    const current = visible[index];
    if (!current) return;
    const { node, parent } = current;
    const hasChildren = Boolean(node.children?.length);
    const isOpen = expanded.has(node.id);
    let handled = true;

    switch (event.key) {
      case "ArrowDown":
        if (visible[index + 1]) focusNode(visible[index + 1].node.id);
        break;
      case "ArrowUp":
        if (visible[index - 1]) focusNode(visible[index - 1].node.id);
        break;
      case "ArrowRight":
        if (hasChildren && !isOpen) toggle(node.id, true);
        else if (hasChildren && isOpen) focusNode(node.children![0].id);
        break;
      case "ArrowLeft":
        if (hasChildren && isOpen) toggle(node.id, false);
        else if (parent) focusNode(parent.id);
        break;
      case "Home":
        focusNode(visible[0].node.id);
        break;
      case "End":
        focusNode(visible[visible.length - 1].node.id);
        break;
      case "Enter":
        if (!node.disabled) {
          setSelected(node.id);
          onActivate?.(node);
        }
        break;
      case " ":
        if (!node.disabled) setSelected(node.id);
        break;
      case "*": {
        const siblings = parent?.children ?? items;
        setExpanded([...new Set([...expanded, ...siblings.filter((s) => s.children?.length).map((s) => s.id)])]);
        break;
      }
      default:
        handled = false;
    }

    if (!handled && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const state = typeahead.current;
      window.clearTimeout(state.timer);
      state.query += event.key.toLowerCase();
      state.timer = window.setTimeout(() => {
        state.query = "";
      }, 500);
      const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
      const match = ordered.find((v) => textOf(v.node).startsWith(state.query));
      if (match) focusNode(match.node.id);
      handled = true;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const renderNodes = (nodes: TreeViewNode[], level: number): React.ReactNode =>
    nodes.map((node, position) => {
      const hasChildren = Boolean(node.children?.length);
      const isOpen = expanded.has(node.id);
      return (
        <li
          key={node.id}
          role="treeitem"
          data-tree-id={node.id}
          className="spk-tree-item"
          tabIndex={node.id === activeId ? 0 : -1}
          aria-level={level}
          aria-setsize={nodes.length}
          aria-posinset={position + 1}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={selected === node.id}
          aria-disabled={node.disabled || undefined}
          onFocus={(event) => {
            if (event.target === event.currentTarget) setFocusedId(node.id);
          }}
        >
          <div
            className="spk-tree-row"
            style={{ ["--spk-tree-level" as string]: level - 1 }}
            onClick={() => {
              focusNode(node.id);
              if (hasChildren) toggle(node.id);
              if (!node.disabled) setSelected(node.id);
            }}
            onDoubleClick={() => {
              if (!node.disabled) onActivate?.(node);
            }}
          >
            <span className="spk-tree-chevron" aria-hidden>
              {hasChildren ? <ChevronRight className="size-4" /> : null}
            </span>
            {node.icon ? (
              <span className="spk-tree-icon" aria-hidden>
                {node.icon}
              </span>
            ) : null}
            <span className="spk-tree-label">{node.label}</span>
            {node.meta != null ? <span className="spk-tree-meta">{node.meta}</span> : null}
          </div>
          {hasChildren && isOpen ? (
            <ul role="group" className="spk-tree-group">
              {renderNodes(node.children!, level + 1)}
            </ul>
          ) : null}
        </li>
      );
    });

  return (
    <ul
      ref={rootRef}
      role="tree"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      data-slot="tree-view"
      className={cn("spk-tree", className)}
      onKeyDown={onKeyDown}
    >
      {renderNodes(items, 1)}
    </ul>
  );
}
