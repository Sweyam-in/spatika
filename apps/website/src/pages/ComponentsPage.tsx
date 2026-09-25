import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PanelsTopLeft } from "lucide-react";
import { componentCategories, components } from "@/data/navigation";
import { ComponentDemo } from "@/demos/ComponentDemo";

export function ComponentsPage() {
  return (
    <article>
      <h1 className="page-title">Components</h1>
      <p className="page-lead">
        Primitives, composites and patterns from <code>@spatika/react</code> — surfaces, forms, data
        tables, an application shell and charts. Each card below is a live preview you can click through to props and
        snippets.
      </p>

      {componentCategories.map((category) => {
        const items = components.filter((c) => c.category === category);
        if (!items.length) return null;
        return (
          <section key={category} id={category.toLowerCase()}>
            <h2 className="section-title">{category}</h2>
            <div className="component-grid">
              {items.map((item) => (
                <article key={item.slug} className="component-link">
                  <GalleryPreview slug={item.slug} />
                  <Link
                    to={`/components/${item.slug}`}
                    className="component-link-hit"
                    aria-label={`${item.name}. ${item.description}`}
                  >
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </article>
  );
}

/** Width the gallery lays each demo out at before scaling it into the card. */
const STAGE_WIDTH = 440;

/**
 * Full-width page bands. They respond to the viewport (their columns only stack on a phone), so
 * no card-sized preview does them justice — the card says what they are instead.
 */
const PAGE_BANDS = new Set(["stat-band", "cta-band", "pricing-table", "comparison-table", "bento-grid"]);

/**
 * A card-sized thumbnail of a component's compact demo. The demo lays out at a comfortable
 * width (STAGE_WIDTH) and the stage is scaled to the card, so tables, charts and forms keep
 * their real proportions instead of being squeezed into ~300px. The preview is inert and hidden
 * from assistive tech; the card's link carries the name and description.
 */
function GalleryPreview({ slug }: { slug: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    // React 18 has no inert prop; set it on the node.
    node.inert = true;
    node.setAttribute("inert", "");
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // No layout yet (or none at all, as in tests): render unscaled.
  const scale = box && box.width > 0 ? Math.min(1, box.width / STAGE_WIDTH) : 1;
  if (PAGE_BANDS.has(slug)) {
    return (
      <div className="component-preview" ref={boxRef} aria-hidden="true">
        <div className="component-preview-placeholder">
          <PanelsTopLeft aria-hidden />
          <strong>Full-width page section</strong>
          <span>Open the component for the live preview</span>
        </div>
      </div>
    );
  }
  return (
    <div className="component-preview" ref={boxRef} aria-hidden="true">
      {box ? (
        <div
          className="component-preview-stage"
          style={
            box.width > 0
              ? { width: box.width / scale, height: box.height / scale, transform: `scale(${scale})` }
              : undefined
          }
        >
          <ComponentDemo slug={slug} compact />
        </div>
      ) : null}
    </div>
  );
}
