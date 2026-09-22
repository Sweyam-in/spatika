export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export type ApiSection = {
  name: string;
  description?: string;
  extends?: string;
  props: PropDoc[];
};

export type UsageSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type ExampleMeta = {
  id: string;
  title: string;
  description?: string;
  code: string;
};

export type SlotDoc = {
  name: string;
  className: string;
  defaultComponent: string;
  description: string;
  exportName?: string;
};

export type ClassDoc = {
  className: string;
  ruleName: string;
  description: string;
};

export type ComponentDoc = {
  intro: string;
  examples: ExampleMeta[];
  usage: UsageSection[];
  accessibility: string[];
  api: ApiSection[];
  slots: SlotDoc[];
  classes: ClassDoc[];
  related: string[];
};
