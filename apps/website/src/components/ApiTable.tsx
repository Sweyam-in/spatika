import type { ApiSection, ClassDoc, SlotDoc } from "@/docs/types";

type ApiTableProps = {
  sections: ApiSection[];
};

export function ApiTable({ sections }: ApiTableProps) {
  return (
    <div className="api-guide">
      {sections.map((section) => (
        <section key={section.name} className="api-section" id={`api-${slugify(section.name)}`}>
          <h3 className="api-heading">
            <code>{section.name}</code>
          </h3>
          {section.extends ? (
            <p className="api-extends">
              Extends native <code>{section.extends}</code> attributes.
            </p>
          ) : null}
          {section.description ? <p className="demo-block-lead">{section.description}</p> : null}
          <div className="api-table-wrap" tabIndex={0}>
            <table className="api-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {section.props.map((prop) => (
                  <tr key={prop.name}>
                    <td>
                      <code>{prop.name}</code>
                    </td>
                    <td>
                      <code>{prop.type}</code>
                    </td>
                    <td>{prop.default ? <code>{prop.default}</code> : "—"}</td>
                    <td>{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

export function SlotTable({ slots }: { slots: SlotDoc[] }) {
  if (!slots.length) return null;

  return (
    <div className="api-table-wrap" tabIndex={0}>
      <table className="api-table">
        <thead>
          <tr>
            <th>Slot name</th>
            <th>Class name</th>
            <th>Default component</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.name}>
              <td>
                <code>{slot.name}</code>
                {slot.exportName ? (
                  <>
                    <br />
                    <code>{slot.exportName}</code>
                  </>
                ) : null}
              </td>
              <td>
                <code>{slot.className}</code>
              </td>
              <td>
                <code>{slot.defaultComponent}</code>
              </td>
              <td>{slot.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ClassTable({ classes }: { classes: ClassDoc[] }) {
  if (!classes.length) return null;

  return (
    <div className="api-table-wrap" tabIndex={0}>
      <table className="api-table">
        <thead>
          <tr>
            <th>Class name</th>
            <th>Rule name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((row) => (
            <tr key={row.className}>
              <td>
                <code>{row.className}</code>
              </td>
              <td>
                <code>{row.ruleName}</code>
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
