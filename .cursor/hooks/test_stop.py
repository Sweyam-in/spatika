import io
import json
import unittest
from pathlib import Path
from unittest.mock import patch

import stop


class StopHook(unittest.TestCase):
    def test_aborted_status_skips_evaluation(self):
        stdout = io.StringIO()
        with patch("sys.stdin", io.StringIO(json.dumps({"status": "aborted"}))), patch(
            "sys.stdout", stdout
        ):
            self.assertEqual(stop.main(), 0)
        self.assertEqual(json.loads(stdout.getvalue()), {})

    def test_high_loop_count_skips_evaluation(self):
        stdout = io.StringIO()
        with patch("sys.stdin", io.StringIO(json.dumps({"loop_count": 3}))), patch(
            "sys.stdout", stdout
        ):
            self.assertEqual(stop.main(), 0)
        self.assertEqual(json.loads(stdout.getvalue()), {})

    def test_evaluate_reports_missing_tests_for_uncovered_sources(self):
        root = Path("/tmp/spatika-stop-hook-test")
        with patch.object(stop, "changed_files", return_value=["src/Foo.tsx"]), patch.object(
            stop, "existing_files", return_value=["src/Foo.tsx"]
        ), patch.object(stop, "read_file", return_value='export const Foo = () => null;\n'):
            payload = stop.evaluate(root)
        self.assertIn("followup_message", payload)
        self.assertIn("src/Foo.tsx", payload["followup_message"])
        self.assertIn("missing test", payload["followup_message"].lower())


if __name__ == "__main__":
    unittest.main()
