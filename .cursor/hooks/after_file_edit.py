#!/usr/bin/env python3
"""afterFileEdit hook: remind the agent when a UI or source file needs tests/Spatika."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from steering_check import (  # noqa: E402
    is_production_source,
    is_test_path,
    spatika_violations,
)


def main() -> int:
    raw = sys.stdin.read()
    try:
        event = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        print("{}")
        return 0

    file_path = event.get("file_path") or ""
    edits = event.get("edits") or []
    new_bits = "\n".join(str(edit.get("new_string") or "") for edit in edits)

    notes: list[str] = []
    if file_path and is_production_source(file_path) and not is_test_path(file_path):
        notes.append(
            f"Add a colocated test for {file_path} before finishing (see write-tests skill)."
        )

    if file_path:
        try:
            content = Path(file_path).read_text(encoding="utf-8")
        except OSError:
            content = new_bits
        notes.extend(spatika_violations(file_path, content or new_bits))

    payload: dict = {}
    if notes:
        payload["additional_context"] = "\n".join(notes)
    print(json.dumps(payload))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
