---
name: write-tests
description: Write and run test cases for new or changed production code. Use whenever adding features, fixing bugs, scaffolding modules, or before finishing a task.
---

# Write tests

Every production change in this workspace needs tests in the same change. Follow this skill before marking work done.

## 1. Identify what changed

List new or edited modules (functions, components, handlers, hooks). Config, lockfiles, and prose-only docs are exempt. Everything else is not.

## 2. Choose the runner

- React / TypeScript / Spatika: Vitest + Testing Library. Add them if missing (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`).
- Python: `python3 -m unittest` unless the repo already uses pytest.

Colocate: `Foo.tsx` → `Foo.test.tsx`; `foo.py` → `test_foo.py` or `foo_test.py`.

## 3. Write the cases

For each unit of behavior:

1. Happy path with a real assertion (role, return value, thrown error, HTTP status).
2. At least one edge: empty input, disabled control, error payload, or unauthorized.
3. For a bug fix: a test that fails on the old code and passes on the new code.

UI tests wrap Spatika trees in `SpatikaThemeProvider` when they use theme context. Query `getByRole` / accessible name. Do not assert on hashed class names.

## 4. Run them

Run the project test script (`npm test`, `npx vitest run`, `python3 -m unittest discover -s tests -v`). Fix failures. Do not delete or skip failing tests to finish.

## 5. Stop if tests are missing

If you cannot write a meaningful test, the design is wrong or the change is incomplete. Do not ship it.
