export type EditorColorSwatch = {
  id: string;
  label: string;
  value: string | null;
};

/** Preset text colors for the formatting toolbar. */
export const EDITOR_TEXT_COLORS: EditorColorSwatch[] = [
  { id: "default", label: "Default text color", value: null },
  { id: "red", label: "Red text", value: "#dc2626" },
  { id: "orange", label: "Orange text", value: "#ea580c" },
  { id: "amber", label: "Amber text", value: "#d97706" },
  { id: "green", label: "Green text", value: "#16a34a" },
  { id: "teal", label: "Teal text", value: "#0d9488" },
  { id: "blue", label: "Blue text", value: "#2563eb" },
  { id: "violet", label: "Violet text", value: "#7c3aed" },
  { id: "pink", label: "Pink text", value: "#db2777" },
  { id: "gray", label: "Gray text", value: "#64748b" },
];

/** Preset highlight colors for the formatting toolbar. */
export const EDITOR_HIGHLIGHT_COLORS: EditorColorSwatch[] = [
  { id: "none", label: "Remove highlight", value: null },
  { id: "yellow", label: "Yellow highlight", value: "#fef08a" },
  { id: "lime", label: "Lime highlight", value: "#d9f99d" },
  { id: "cyan", label: "Cyan highlight", value: "#a5f3fc" },
  { id: "blue", label: "Blue highlight", value: "#bfdbfe" },
  { id: "violet", label: "Violet highlight", value: "#ddd6fe" },
  { id: "pink", label: "Pink highlight", value: "#fbcfe8" },
  { id: "orange", label: "Orange highlight", value: "#fed7aa" },
];
