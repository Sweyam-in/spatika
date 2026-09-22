import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { createImageNodeView } from "./resizable-image-view";

export type ImageAlign = "left" | "center" | "right";

/** Image node with drag-resize handles, width, and float alignment attributes. */
export const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => {
          const fromData = element.getAttribute("data-width");
          if (fromData) return fromData;
          const styleWidth = element.style.width;
          return styleWidth || "100%";
        },
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
          style: `width: ${attributes.width}`,
        }),
      },
      align: {
        default: "center" as ImageAlign,
        parseHTML: (element) => {
          const parent = element.parentElement;
          const fromParent = parent?.getAttribute("data-align") as ImageAlign | null;
          return fromParent ?? ((element.getAttribute("data-align") as ImageAlign) ?? "center");
        },
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
          class: `spk-editor-image spk-editor-image--${attributes.align}`,
        }),
      },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) =>
      createImageNodeView({
        node,
        getPos,
        editor,
        selected: false,
      });
  },

  renderHTML({ HTMLAttributes }) {
    const align = (HTMLAttributes["data-align"] as ImageAlign | undefined) ?? "center";
    return [
      "div",
      {
        class: `spk-editor-image-wrap spk-editor-image-wrap--${align}`,
        "data-align": align,
        contenteditable: "false",
      },
      ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
    ];
  },

  parseHTML() {
    return [
      {
        tag: "div.spk-editor-image-wrap img",
      },
      {
        tag: "img[src]",
      },
    ];
  },
});
