/** A tiny CSS AST: utilities emit it, variants wrap it, the printer flattens it. */

export type Decl = { kind: "decl"; property: string; value: string; important?: boolean };
/** A nested rule; `&` in the selector stands for the utility's own selector. */
export type Rule = { kind: "rule"; selector: string; nodes: Node[] };
export type AtRule = { kind: "at"; name: string; params: string; nodes: Node[] };
export type Node = Decl | Rule | AtRule;

export const decl = (property: string, value: string): Decl => ({ kind: "decl", property, value });
export const rule = (selector: string, nodes: Node[]): Rule => ({ kind: "rule", selector, nodes });
export const atRule = (name: string, params: string, nodes: Node[]): AtRule => ({ kind: "at", name, params, nodes });

/** Custom properties registered with `@property` so composed utilities have initial values. */
export type PropertyDef = { syntax: string; inherits: boolean; initial?: string };

/** What a utility produces for one candidate. */
export type Output = {
  nodes: Node[];
  /** `@property` names (keys of PROPERTIES) the rule relies on. */
  properties?: string[];
  /** Complete `@keyframes` blocks the rule relies on. */
  keyframes?: string[];
};
