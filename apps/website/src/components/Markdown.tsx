import type { ReactNode } from "react";
import { Prose } from "@spatika/react";
import { CodeBlock } from "./CodeBlock";

/**
 * Renders the Markdown the repository already keeps — changelogs and migration guides — so
 * release pages are written once. Supports the subset those files use: ATX headings, fenced
 * code, pipe tables, nested bullet and numbered lists, paragraphs, and inline code, bold,
 * emphasis and links.
 */
export function Markdown({ source, headingOffset = 0 }: { source: string; headingOffset?: number }) {
  return <Prose>{renderBlocks(source.replace(/\r\n/g, "\n"), headingOffset)}</Prose>;
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\*[^*\s][^*]*\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${n++}`;
    if (token.startsWith("`")) nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    else if (token.startsWith("**")) nodes.push(<strong key={key}>{renderInline(token.slice(2, -2), key)}</strong>);
    else if (token.startsWith("[")) {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/) ?? [];
      const external = /^https?:/.test(href ?? "");
      nodes.push(
        <a key={key} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {renderInline(label ?? "", key)}
        </a>,
      );
    } else nodes.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>);
    cursor = match.index + token.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

type ListItem = { text: string; children: ListItem[]; ordered: boolean };

function parseList(lines: string[]): ListItem[] {
  const root: ListItem[] = [];
  const stack: { indent: number; items: ListItem[] }[] = [{ indent: -1, items: root }];
  for (const line of lines) {
    const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (!match) {
      // Continuation of the previous item's text.
      const last = stack[stack.length - 1].items.at(-1);
      if (last) last.text += ` ${line.trim()}`;
      continue;
    }
    const indent = match[1].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const item: ListItem = { text: match[3], children: [], ordered: /\d/.test(match[2]) };
    stack[stack.length - 1].items.push(item);
    stack.push({ indent, items: item.children });
  }
  return root;
}

function renderList(items: ListItem[], key: string): ReactNode {
  const Tag = items[0]?.ordered ? "ol" : "ul";
  return (
    <Tag key={key}>
      {items.map((item, index) => (
        <li key={`${key}-${index}`}>
          {renderInline(item.text, `${key}-${index}`)}
          {item.children.length ? renderList(item.children, `${key}-${index}-c`) : null}
        </li>
      ))}
    </Tag>
  );
}

function renderBlocks(source: string, headingOffset: number): ReactNode[] {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i += 1;
      blocks.push(<CodeBlock key={key} language={fence[1] || "text"} code={code.join("\n")} />);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + headingOffset);
      const Tag = `h${level}` as "h2";
      blocks.push(
        <Tag key={key} id={slugifyHeading(heading[2])}>
          {renderInline(heading[2], key)}
        </Tag>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
        if (!cells.every((cell) => /^:?-{2,}:?$/.test(cell))) rows.push(cells);
        i += 1;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={key} className="api-table-wrap" tabIndex={0}>
          <table className="api-table">
            <thead>
              <tr>{head.map((cell, c) => <th key={c}>{renderInline(cell, `${key}-h${c}`)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={r}>{row.map((cell, c) => <td key={c}>{renderInline(cell, `${key}-${r}-${c}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const listLines: string[] = [];
      while (i < lines.length && lines[i].trim() && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        listLines.push(lines[i++]);
      }
      blocks.push(renderList(parseList(listLines), key));
      continue;
    }
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|\||\s*([-*]|\d+\.)\s+)/.test(lines[i])) {
      paragraph.push(lines[i++].trim());
    }
    blocks.push(<p key={key}>{renderInline(paragraph.join(" "), key)}</p>);
  }
  return blocks;
}
