import io
import json
import unittest
from unittest.mock import patch

import after_file_edit


class AfterFileEditHook(unittest.TestCase):
    def test_production_source_asks_for_a_colocated_test(self):
        event = {
            "file_path": "apps/website/src/pages/GuidesPage.tsx",
            "edits": [{"new_string": "export function GuidesPage() { return null; }"}],
        }
        stdout = io.StringIO()
        with patch("sys.stdin", io.StringIO(json.dumps(event))), patch("sys.stdout", stdout):
            self.assertEqual(after_file_edit.main(), 0)
        payload = json.loads(stdout.getvalue())
        self.assertIn("additional_context", payload)
        self.assertIn("colocated test", payload["additional_context"])

    def test_test_file_edit_does_not_ask_for_another_test(self):
        event = {
            "file_path": "src/Button.test.tsx",
            "edits": [{"new_string": "it('renders', () => {})"}],
        }
        stdout = io.StringIO()
        with patch("sys.stdin", io.StringIO(json.dumps(event))), patch("sys.stdout", stdout):
            self.assertEqual(after_file_edit.main(), 0)
        payload = json.loads(stdout.getvalue())
        self.assertNotIn("colocated test", payload.get("additional_context", ""))

    def test_invalid_json_is_ignored(self):
        stdout = io.StringIO()
        with patch("sys.stdin", io.StringIO("{not-json")), patch("sys.stdout", stdout):
            self.assertEqual(after_file_edit.main(), 0)
        self.assertEqual(json.loads(stdout.getvalue()), {})


if __name__ == "__main__":
    unittest.main()
