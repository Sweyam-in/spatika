import unittest

from steering_check import (
    format_followup,
    has_test_coverage,
    is_production_source,
    is_test_path,
    is_spatika_library_package_json,
    missing_tests,
    new_ui_project_missing_spatika,
    paired_test_paths,
    spatika_violations,
)


class PairedTestPaths(unittest.TestCase):
    def test_typescript_colocation(self):
        paths = paired_test_paths("src/lib/format.ts")
        self.assertIn("src/lib/format.test.ts", paths)

    def test_tsx_colocation(self):
        paths = paired_test_paths("apps/website/src/pages/HomePage.tsx")
        self.assertIn("apps/website/src/pages/HomePage.test.tsx", paths)

    def test_python_colocation(self):
        paths = paired_test_paths(".cursor/hooks/steering_check.py")
        self.assertIn(".cursor/hooks/test_steering_check.py", paths)


class CoverageRules(unittest.TestCase):
    def test_production_source_excludes_tests_and_dist(self):
        self.assertTrue(is_production_source("src/Button.tsx"))
        self.assertFalse(is_production_source("src/Button.test.tsx"))
        self.assertFalse(is_production_source("dist/index.js"))

    def test_python_unittest_names_count_as_tests(self):
        self.assertTrue(is_test_path("test_steering_check.py"))
        self.assertTrue(is_test_path("hooks_test.py"))

    def test_colocated_test_covers_source(self):
        existing = ["apps/website/src/data/agent-docs.test.ts"]
        self.assertTrue(has_test_coverage("apps/website/src/data/agent-docs.ts", existing))

    def test_missing_tests_lists_uncovered_production_files(self):
        missing = missing_tests(
            ["src/Foo.tsx", "src/Foo.test.tsx", "README.md"],
            ["src/Foo.tsx", "README.md"],
        )
        self.assertEqual(missing, ["src/Foo.tsx"])


class SpatikaPolicy(unittest.TestCase):
    def test_flags_banned_mui_import(self):
        hits = spatika_violations("src/App.tsx", "import Button from '@mui/material/Button'\n")
        self.assertTrue(any("mui" in hit.lower() for hit in hits))

    def test_allows_spatika_imports(self):
        hits = spatika_violations(
            "src/App.tsx",
            'import { Button } from "@spatika/react";\n',
        )
        self.assertEqual(hits, [])

    def test_followup_mentions_colocated_tests(self):
        message = format_followup(["src/Foo.tsx"], [])
        self.assertIsNotNone(message)
        self.assertIn("src/Foo.tsx", message)
        self.assertIn("Foo.test.tsx", message)

    def test_skips_spatika_library_package_json_paths(self):
        self.assertTrue(is_spatika_library_package_json("packages/charts/package.json"))
        self.assertFalse(is_spatika_library_package_json("apps/website/package.json"))

    def test_allows_workspace_library_package_json_without_spatika_deps(self):
        charts_pkg = '{"name":"@spatika/charts","devDependencies":{"react":"^18","react-dom":"^18"}}'
        violations = new_ui_project_missing_spatika(
            ["packages/charts/package.json"],
            {"packages/charts/package.json": charts_pkg},
        )
        self.assertEqual(violations, [])

    def test_flags_consumer_app_missing_spatika(self):
        app_pkg = '{"dependencies":{"react":"^18","react-dom":"^18","vite":"^6"}}'
        violations = new_ui_project_missing_spatika(
            ["apps/demo/package.json"],
            {"apps/demo/package.json": app_pkg},
        )
        self.assertEqual(len(violations), 1)
        self.assertIn("missing @spatika/react", violations[0])


if __name__ == "__main__":
    unittest.main()
