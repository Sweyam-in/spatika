#!/usr/bin/env python3
"""Cursor stop hook: require tests and Spatika UI before the agent finishes."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

HOOKS_DIR = Path(__file__).resolve().parent
if str(HOOKS_DIR) not in sys.path:
    sys.path.insert(0, str(HOOKS_DIR))

from steering_check import (  # noqa: E402
    format_followup,
    is_skipped_path,
    missing_tests,
    new_ui_project_missing_spatika,
    spatika_violations,
)


def _git(args: list[str], cwd: Path) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip()


def repo_root(start: Path | None = None) -> Path:
    here = start or Path.cwd()
    output = _git(["rev-parse", "--show-toplevel"], here)
    return Path(output) if output else here


def changed_files(root: Path) -> list[str]:
    names: list[str] = []
    names.extend(_git(["diff", "--name-only"], root).splitlines())
    names.extend(_git(["diff", "--cached", "--name-only"], root).splitlines())
    names.extend(
        _git(["ls-files", "--others", "--exclude-standard"], root).splitlines()
    )
    names = [n for n in names if n]
    if not names:
        names.extend(_git(["diff", "--name-only", "HEAD~1"], root).splitlines())
    unique: list[str] = []
    seen: set[str] = set()
    for name in names:
        if name and name not in seen and not is_skipped_path(name):
            seen.add(name)
            unique.append(name)
    return unique


def existing_files(root: Path) -> list[str]:
    tracked = _git(["ls-files"], root).splitlines()
    untracked = _git(
        ["ls-files", "--others", "--exclude-standard"], root
    ).splitlines()
    return [p for p in tracked + untracked if p]


def read_file(root: Path, relative: str) -> str:
    path = root / relative
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def evaluate(root: Path) -> dict:
    changed = changed_files(root)
    existing = existing_files(root)
    missing = missing_tests(changed, existing)

    contents = {path: read_file(root, path) for path in changed}
    spatika: list[str] = []
    for path, content in contents.items():
        spatika.extend(spatika_violations(path, content))
    spatika.extend(new_ui_project_missing_spatika(changed, contents))

    followup = format_followup(missing, spatika)
    payload: dict = {}
    if followup:
        payload["followup_message"] = followup
    return payload


def main() -> int:
    raw = sys.stdin.read()
    try:
        event = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        event = {}

    if event.get("status") in {"aborted", "error"}:
        print("{}")
        return 0

    if int(event.get("loop_count") or 0) >= 3:
        print("{}")
        return 0

    payload = evaluate(repo_root())
    print(json.dumps(payload))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
