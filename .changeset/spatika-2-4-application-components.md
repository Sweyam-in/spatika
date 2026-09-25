---
"@spatika/tokens": minor
"@spatika/react": minor
"@spatika/charts": minor
"@spatika/editor": minor
---

Fix the 2.3.0 stylesheet regression, meet WCAG 2.2 AA contrast in every theme, repair keyboard and focus behaviour across overlays, and add application components. No export was removed and no prop was renamed; see the 2.3 → 2.4 migration guide for the behaviour changes and visual token changes to review.

**Fixed — stylesheet (2.3.0 regression).** 2.3.0 shipped without ~200 utility classes the components use (integer spacing steps, every z-index layer, `min-w-0`, `max-h-*`, `line-clamp-*`, `tabular-nums`, `animate-spin`, `rotate-180`, `peer-disabled:` and `group-data-` label states …). They are restored, `bg-gradient-to-*` honours direction and colour stops again, and `dark:` utilities apply in Neelam and Sandhya. A test now fails when a component uses a utility without a rule.

**Accessibility.** Tertiary text reaches 4.5:1 on every surface; control boundaries (inputs, checkboxes, radios, switch track) reach 3:1 through a new derived `--spk-control-border`; the focus ring uses full-strength `--spk-accent-text` (≥ 3:1 in all themes); white labels on dark-theme danger buttons reach 4.5:1; hover and pressed fills darken instead of lightening in dark themes. Contrast for every theme is checked by the test suite.

**Overlays.** One dismissable-layer stack: Escape closes only the topmost overlay and an outside press only the layers above it. DropdownMenu gains the full WAI-ARIA menu keyboard model (its items were unreachable by keyboard), plus submenus with ArrowRight / ArrowLeft. Popover moves focus into its content and back, with Tab bridging to the portaled content. Select gains type-ahead and focus return. Tooltips are hoverable (WCAG 1.4.13), dismiss with Escape from anywhere, ignore touch hovers and implement `skipDelayDuration`. Nested dialogs keep focus in the innermost one; scroll locking no longer shifts the page. Dialog, Sheet and AlertDialog accept `onEscapeKeyDown` / `onInteractOutside`. Tooltips stack above dialogs and toasts above modals, from one z-index scale shared by `--spk-z-*` and `OVERLAY_Z_INDEX`.

**Forms.** Loading buttons keep keyboard focus while blocking duplicate submits. FormField generates and wires the control id (now optional), names radio groups with `aria-labelledby`, and announces errors politely instead of with `role="alert"`.

**New components.** NumberInput, TagInput, OtpInput, FileUpload, Calendar, DatePicker, DateRangePicker, TreeView, DescriptionList, VirtualList, ResizablePanels, ContextMenu, ScrollArea, AspectRatio, FormErrorSummary, ResultState (and `EmptyState tone`), DataTable `hiddenColumns` with `DataTableColumnsMenu`, and a `filter` prop on CommandPalette.
