type TocItem = {
  id: string;
  label: string;
};

type DocsTocProps = {
  items: TocItem[];
};

export function DocsToc({ items }: DocsTocProps) {
  if (!items.length) return null;

  return (
    <nav className="docs-toc" aria-label="On this page">
      <h4>Contents</h4>
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
