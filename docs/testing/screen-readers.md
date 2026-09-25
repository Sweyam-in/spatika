# Screen-reader testing

Spatika checks screen-reader output in two layers.

| Layer | What it proves | Where |
|---|---|---|
| Automated | Accessible names, roles, states, descriptions, reading order and live-region announcements are what the ARIA specs say a screen reader should speak | `packages/react/src/a11y/screen-reader.test.tsx` (virtual screen reader, runs in `npm test`); chart announcements in `packages/charts/src/composites/chart-keyboard.test.tsx` |
| Manual | How real screen readers (with their own heuristics, verbosity settings and browser pairings) actually behave | This document |

The automated layer runs on every change. It uses
[`@guidepup/virtual-screen-reader`](https://github.com/guidepup/virtual-screen-reader), which
follows the specs rather than any one product, so it catches regressions such as a label that
stops being associated or a live region that runs two sentences together. It can't tell you that
VoiceOver skips a live region, or that NVDA's focus mode swallows arrow keys. Only the manual pass
can.

## When to run the manual pass

- Before a minor or major release, for every component in the matrix below that the release
  changed.
- When a component's keyboard model, focus handling or live regions change.
- When a user reports a screen-reader barrier (reproduce it with the same pairing first).

## Pairings

| Screen reader | Browser | Platform | Why |
|---|---|---|---|
| NVDA (latest) | Firefox and Chrome | Windows | Most-used free screen reader; browse/focus mode switching |
| JAWS (latest) | Chrome | Windows | Enterprise users |
| VoiceOver | Safari | macOS | Default on Mac; strict about live regions |
| VoiceOver | Safari | iOS | Touch exploration, rotor, on-screen keyboard |
| TalkBack | Chrome | Android | Touch exploration on Android |

## Scripts

Run each script on the component's docs page (`/components/<slug>`), using the first demo. "Hear"
is what the screen reader should convey. Exact wording differs between products, but every item
must be present.

| Component | Do | Hear |
|---|---|---|
| FormField + Input | Tab into a field with an error | Label, "edit"/"text field", the error text, "invalid", "required" |
| DateInput / DatePicker | Tab into the month segment; type 0 7; press ↑ | "month, Due date", "spin button", the value after each key; focus moves on to day after two digits |
| DatePicker | Tab to "Open calendar", press Enter, arrow to a day, Enter | Button name with the field label; the grid's month and full day names ("Tuesday, March 10, 2026"); focus returns to the button |
| TimeInput | Type 2 3 0 P | Hour, minute and AM/PM values as they change; "PM" |
| Select | Focus, press Enter, arrow, Enter | "combo box"/"pop-up button" with label and value; options with position; new value on close |
| Dialog / AlertDialog | Open from its trigger | "dialog", the title, the description; focus inside; Escape returns focus to the trigger |
| DropdownMenu | Open with Enter, move with arrows, open a submenu with → | "menu", item names with position; submenu items; Escape closes one level |
| Tabs | Tab to the tab list, press → | "tab", name, "selected", position ("2 of 3"); the panel follows |
| TreeView | Focus the tree, press → on a folder, ↓ | "tree view", item, level, "collapsed"/"expanded", position |
| Toast | Trigger a toast | Title and description spoken once, as separate phrases, without moving focus |
| TagInput | Type a tag and press Enter; press Backspace | "added"/"removed" announcements with the tag text |
| FileUpload | Choose two files | The count or names announced; the Remove buttons named per file |
| Charts (BarChart, PieChart) | Tab to "Data points", press → twice, Enter | "Data points" group with the hint; each point's category and value with position ("2 of 6") |
| DataTable | Browse the table with the table-navigation keys | Column headers read with cells; sort state on sortable headers |
| FormErrorSummary | Submit the demo form empty | The summary is announced and focused; each link moves to its field |

## Recording results

Record each run in the table below, one row per pairing and release. Keep failures open as
issues and link them, rather than editing the expectation.

| Release | Pairing | Tester | Date | Result | Issues |
|---|---|---|---|---|---|
| 2.4.0 | — | — | — | Not yet run | — |

No manual screen-reader pass has been recorded for any release so far. The first entry belongs
to the 2.4.0 release.
