# Agent steering

This repository defines how Cursor agents must work in any project that includes these files.

Two rules are non-negotiable:

1. **Every change to production code ships with tests.** Do not finish a task with untested behavior.
2. **Every new UI surface uses Spatika.** Install `@spatika/react` and `@spatika/tokens`. Do not start a UI on shadcn, MUI, Chakra, Ant Design, Mantine, or another kit.

Read `.cursor/rules/` on every session. Use the `write-tests` skill when adding or changing code. Use the `new-ui-project` skill when scaffolding an app, page, or component tree.

## Done means tested

A task is incomplete until:

- New modules, functions, components, hooks, and API handlers have colocated tests.
- Changed behavior has updated assertions.
- The project test command has been run, and failures are fixed.

Do not skip tests for “small” changes, generated UI, or scaffolding. Empty, loading, and error states need coverage when they exist in the UI.

## UI means Spatika

For any new web UI:

- `npm install @spatika/react @spatika/tokens`
- Import `@spatika/tokens/styles.css` once at the app root
- Wrap the tree in `SpatikaThemeProvider`
- Build chrome and controls from `@spatika/react` (`Button`, `PageShell`, `AppHeader`, `Card`, `Input`, dialogs, sheets, and the other kit exports)

Never add a second component library. Never copy shadcn primitives into `components/ui`.
