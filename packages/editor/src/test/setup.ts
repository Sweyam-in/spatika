import "@testing-library/jest-dom/vitest";

const mockRect = (): DOMRect =>
  ({
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    top: 0,
    left: 0,
    right: 100,
    bottom: 20,
    toJSON: () => ({}),
  }) as DOMRect;

if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

if (!Element.prototype.getBoundingClientRect) {
  Element.prototype.getBoundingClientRect = mockRect;
}

if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = mockRect;
}

if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = function getClientRects() {
    return {
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    } as unknown as DOMRectList;
  };
}

if (!Element.prototype.getClientRects) {
  Element.prototype.getClientRects = function getClientRects() {
    return {
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    } as unknown as DOMRectList;
  };
}
