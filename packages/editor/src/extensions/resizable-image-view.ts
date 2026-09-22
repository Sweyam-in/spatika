import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { ImageAlign } from "./resizable-image";

type CreateImageNodeViewOptions = {
  node: ProseMirrorNode;
  getPos: () => number | undefined;
  editor: Editor;
  selected: boolean;
};

export function applyImageWrapState(
  wrap: HTMLElement,
  img: HTMLImageElement,
  node: ProseMirrorNode,
  selected: boolean,
) {
  const width = (node.attrs.width as string | undefined) ?? "100%";
  const align = (node.attrs.align as ImageAlign | undefined) ?? "center";

  wrap.dataset.align = align;
  wrap.className = `spk-editor-image-wrap spk-editor-image-wrap--${align}${selected ? " spk-editor-image-wrap--selected" : ""}`;
  img.src = node.attrs.src as string;
  img.alt = (node.attrs.alt as string | undefined) ?? "";
  img.className = "spk-editor-image";
  img.style.width = width;
  img.draggable = false;
}

export function createImageNodeView({ node, getPos, editor, selected }: CreateImageNodeViewOptions) {
  const wrap = document.createElement("div");
  wrap.contentEditable = "false";
  wrap.className = "spk-editor-image-wrap";

  const img = document.createElement("img");
  const handle = document.createElement("span");
  handle.className = "spk-editor-image-resize-handle";
  handle.setAttribute("aria-hidden", "true");
  handle.title = "Drag to resize";

  applyImageWrapState(wrap, img, node, selected);
  wrap.append(img, handle);

  let startX = 0;
  let startWidth = 0;

  const onPointerMove = (event: PointerEvent) => {
    const pos = getPos();
    if (pos === undefined) return;
    const delta = event.clientX - startX;
    const nextWidth = Math.max(120, Math.round(startWidth + delta));
    editor.view.dispatch(
      editor.view.state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        width: `${nextWidth}px`,
      }),
    );
  };

  const onPointerUp = () => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };

  const onPointerDown = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    startX = event.clientX;
    startWidth = img.getBoundingClientRect().width;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };

  handle.addEventListener("pointerdown", onPointerDown);

  return {
    dom: wrap,
    update(updatedNode: ProseMirrorNode) {
      if (updatedNode.type.name !== "image") return false;
      node = updatedNode;
      applyImageWrapState(wrap, img, updatedNode, selected);
      return true;
    },
    selectNode() {
      wrap.classList.add("spk-editor-image-wrap--selected");
    },
    deselectNode() {
      wrap.classList.remove("spk-editor-image-wrap--selected");
    },
    destroy() {
      handle.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    },
  };
}
