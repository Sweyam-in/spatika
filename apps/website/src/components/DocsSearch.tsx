import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { CommandPalette, SearchTrigger, type CommandPaletteGroup } from "@spatika/react";
import { buildSearchIndex, scoreSearch, type SearchEntry } from "@/data/search-index";

const GROUP_ORDER: SearchEntry["group"][] = ["Components", "Foundations", "Guides", "Customize", "Showcase", "Resources"];

/**
 * ⌘K / Ctrl+K (or "/") search across components, guides and resources. The index is built
 * into each documentation build, so a versioned snapshot only finds what its version ships.
 */
export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const index = useMemo(buildSearchIndex, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const groups: CommandPaletteGroup[] = GROUP_ORDER.map((group) => ({
    heading: group,
    items: index
      .filter((entry) => entry.group === group)
      .map((entry) => ({
        id: entry.id,
        label: entry.title,
        description: entry.description,
        keywords: entry.keywords,
        onSelect: () => {
          setOpen(false);
          navigate(entry.to);
        },
      })),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <SearchTrigger
        className="docs-search-trigger"
        placeholder="Search docs…"
        onOpen={() => setOpen(true)}
      />
      <button
        type="button"
        className="icon-link docs-search-icon"
        aria-label="Search documentation"
        onClick={() => setOpen(true)}
      >
        <Search size={18} />
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        placeholder="Search components, guides and patterns…"
        groups={groups}
        filter={scoreSearch}
      />
    </>
  );
}
