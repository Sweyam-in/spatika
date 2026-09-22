import { Link } from "react-router-dom";
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
                  <div
                    className="component-preview"
                    ref={(node) => {
                      if (!node) return;
                      node.inert = true;
                      node.setAttribute("inert", "");
                    }}
                  >
                    <ComponentDemo slug={item.slug} compact />
                  </div>
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
