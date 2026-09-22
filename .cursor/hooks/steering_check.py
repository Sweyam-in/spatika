"""Policy checks for Cursor steering: required tests and Spatika UI."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable

SOURCE_SUFFIXES = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".swift",
}

TEST_SUFFIX_TOKENS = (".test.", ".spec.", "_test.", ".tests.")

SKIP_DIR_NAMES = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    "coverage",
    "__pycache__",
    ".venv",
    "venv",
    "agent-tools",
}

SKIP_BASENAME_PREFIXES = (
    "vite.config",
    "vitest.config",
    "next.config",
    "tailwind.config",
    "postcss.config",
    "eslint.config",
    "prettier.config",
    "playwright.config",
)

SKIP_BASENAMES = {
    "setup.ts",
    "setup.js",
    "instrumentation.ts",
    "instrumentation.js",
}

BANNED_IMPORT_PATTERNS = (
    r"""from\s+['"]@mui/""",
    r"""from\s+['"]@chakra-ui/""",
    r"""require\(\s*['"]@mui/""",
    r"""from\s+['"]antd['"]""",
    r"""from\s+['"]antd/""",
    r"""from\s+['"]@mantine/""",
    r"""from\s+['"]@nextui-org/""",
    r"""from\s+['"]@heroui/""",
    r"""from\s+['"]react-bootstrap['"]""",
    r"""from\s+['"]react-bootstrap/""",
    r"""from\s+['"]@radix-ui/themes['"]""",
    r"""from\s+['"]spartak-ui['"]""",
    r"""from\s+['"]@shadcn/""",
)

BANNED_DEPENDENCIES = {
    "@mui/material",
    "@mui/icons-material",
    "@chakra-ui/react",
    "antd",
    "@mantine/core",
    "@nextui-org/react",
    "@heroui/react",
    "react-bootstrap",
    "daisyui",
    "spartak-ui",
    "shadcn",
    "@shadcn/ui",
}

SHADCN_MARKERS = (
    '"$schema": "https://ui.shadcn.com/schema.json"',
    "npx shadcn",
    "npx shadcn@latest",
)

UI_SUFFIXES = {".tsx", ".jsx"}


def posix(path: str | Path) -> str:
    return Path(path).as_posix()


def is_skipped_path(path: str | Path) -> bool:
    parts = Path(path).parts
    if any(part in SKIP_DIR_NAMES for part in parts):
        return True
    name = Path(path).name
    if name.endswith(".d.ts"):
        return True
    if name in SKIP_BASENAMES:
        return True
    if name.startswith(SKIP_BASENAME_PREFIXES):
        return True
    if name in {"hooks.json"}:
        return True
    return False


def is_test_path(path: str | Path) -> bool:
    normalized = posix(path)
    name = Path(path).name
    if name.startswith("test_") and name.endswith(".py"):
        return True
    if name.endswith("_test.py"):
        return True
    if any(token in name for token in TEST_SUFFIX_TOKENS):
        return True
    parts = Path(normalized).parts
    return "__tests__" in parts or "tests" in parts


def is_production_source(path: str | Path) -> bool:
    if is_skipped_path(path) or is_test_path(path):
        return False
    suffix = Path(path).suffix
    return suffix in SOURCE_SUFFIXES


def paired_test_paths(source_path: str | Path) -> list[str]:
    """Likely test file locations for a production source file."""
    path = Path(source_path)
    stem = path.stem
    parent = path.parent
    suffix = path.suffix

    candidates: list[Path] = []
    if suffix == ".py":
        candidates.extend(
            [
                parent / f"test_{stem}.py",
                parent / f"{stem}_test.py",
                parent / "tests" / f"test_{stem}.py",
                Path("tests") / f"test_{stem}.py",
                Path("tests") / path.with_name(f"test_{stem}.py"),
            ]
        )
        # Mirror under tests/ keeping relative directories after src/
        if "src" in path.parts:
            after_src = Path(*path.parts[path.parts.index("src") + 1 : -1])
            candidates.append(Path("tests") / after_src / f"test_{stem}.py")
    else:
        test_suffixes = [f".test{suffix}", f".spec{suffix}"]
        if suffix in {".ts", ".js"}:
            test_suffixes.extend([f".test{suffix}x", f".spec{suffix}x"])
        if suffix in {".tsx", ".jsx"}:
            test_suffixes.extend(
                [f".test{suffix[:3]}", f".spec{suffix[:3]}"]
            )  # .test.ts / .spec.ts
        for extra in test_suffixes:
            candidates.append(parent / f"{stem}{extra}")
            candidates.append(parent / "__tests__" / f"{stem}{extra}")
        if "src" in path.parts:
            after_src = Path(*path.parts[path.parts.index("src") + 1 : -1])
            for extra in test_suffixes:
                candidates.append(Path("tests") / after_src / f"{stem}{extra}")

    unique: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        key = posix(candidate)
        if key not in seen:
            seen.add(key)
            unique.append(key)
    return unique


def _test_name_covers_stem(test_path: str | Path, stem: str) -> bool:
    name = Path(test_path).name.lower()
    stem_l = stem.lower()
    prefixes = (
        f"test_{stem_l}.",
        f"test_{stem_l}_",
        f"{stem_l}_test.",
        f"{stem_l}.test.",
        f"{stem_l}.spec.",
    )
    return name.startswith(prefixes)


def has_test_coverage(source_path: str | Path, existing_paths: Iterable[str | Path]) -> bool:
    existing = {posix(p) for p in existing_paths}
    source = posix(source_path)
    if source in existing and is_test_path(source):
        return True
    for candidate in paired_test_paths(source_path):
        if candidate in existing:
            return True
    stem = Path(source_path).stem
    parent = posix(Path(source_path).parent)
    for path in existing:
        if not is_test_path(path):
            continue
        if posix(Path(path).parent) == parent and stem in Path(path).name:
            return True
        if _test_name_covers_stem(path, stem):
            return True
    return False


def missing_tests(
    changed_paths: Iterable[str | Path],
    existing_paths: Iterable[str | Path],
) -> list[str]:
    existing = list(existing_paths)
    missing: list[str] = []
    for path in changed_paths:
        if not is_production_source(path):
            continue
        if not has_test_coverage(path, existing):
            missing.append(posix(path))
    return sorted(set(missing))


def banned_ui_hits_in_source(content: str) -> list[str]:
    hits: list[str] = []
    for pattern in BANNED_IMPORT_PATTERNS:
        if re.search(pattern, content):
            hits.append(pattern)
    for marker in SHADCN_MARKERS:
        if marker in content:
            hits.append(marker)
    if re.search(r"""from\s+['"]@/components/ui/""", content) and (
        "shadcn" in content.lower() or "radix-ui" in content or "@radix-ui" in content
    ):
        hits.append("@/components/ui (shadcn copy)")
    return hits


def banned_dependencies_in_package_json(content: str) -> list[str]:
    found: list[str] = []
    for name in sorted(BANNED_DEPENDENCIES):
        if f'"{name}"' in content:
            found.append(name)
    if '"components.json"' in content:
        pass
    return found


def is_ui_source(path: str | Path, content: str | None = None) -> bool:
    suffix = Path(path).suffix
    if suffix in UI_SUFFIXES:
        return True
    name = Path(path).name
    if name in {"components.json", "package.json"}:
        return True
    if content and ("@spatika/react" in content or "SpatikaThemeProvider" in content):
        return True
    return False


UI_SCAN_SUFFIXES = {".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs", ".css", ".json"}


def spatika_violations(
    path: str | Path,
    content: str,
) -> list[str]:
    normalized = posix(path)
    name = Path(path).name
    suffix = Path(path).suffix
    hits: list[str] = []

    if name == "components.json" and (
        "ui.shadcn.com" in content or "shadcn" in content.lower()
    ):
        hits.append("shadcn components.json")

    if name == "package.json":
        hits.extend(banned_dependencies_in_package_json(content))

    # Only scan UI/app sources. Policy scripts and docs may mention banned kits.
    if suffix in UI_SCAN_SUFFIXES and not is_test_path(path) and not is_skipped_path(path):
        if name != "package.json":
            hits.extend(banned_ui_hits_in_source(content))

    return [f"{normalized}: {hit}" for hit in hits]


def is_spatika_library_package_json(path: str | Path) -> bool:
    """Workspace libraries under packages/ are not consumer UI apps."""
    normalized = posix(path)
    return normalized.startswith("packages/") and normalized.endswith("/package.json")


def new_ui_project_missing_spatika(
    changed_paths: Iterable[str | Path],
    file_contents: dict[str, str],
) -> list[str]:
    """If a React UI app is being added, require @spatika/react."""
    contents_by_posix = {posix(k): v for k, v in file_contents.items()}
    package_paths = sorted(
        {
            posix(path)
            for path in list(changed_paths) + list(contents_by_posix)
            if Path(path).name == "package.json"
        }
    )

    violations: list[str] = []
    for path in package_paths:
        package_json = contents_by_posix.get(path)
        if not package_json or is_spatika_library_package_json(path):
            continue

        is_react_app = '"react"' in package_json and (
            '"next"' in package_json
            or '"vite"' in package_json
            or '"react-dom"' in package_json
        )
        if not is_react_app:
            continue

        if '"@spatika/react"' not in package_json:
            violations.append(
                f"{path}: React UI project is missing @spatika/react. "
                "Install @spatika/react and @spatika/tokens."
            )
        elif '"@spatika/tokens"' not in package_json:
            violations.append(
                f"{path}: React UI project is missing @spatika/tokens. "
                "Install @spatika/react and @spatika/tokens."
            )
    return violations


def format_followup(missing: list[str], spatika: list[str]) -> str | None:
    if not missing and not spatika:
        return None
    lines = [
        "Steering check failed. Do not stop until this is fixed.",
        "",
    ]
    if missing:
        lines.append("Production files are missing test cases:")
        lines.extend(f"- {path}" for path in missing)
        lines.append(
            "Add colocated tests (Foo.tsx → Foo.test.tsx, foo.py → test_foo.py) and run them."
        )
        lines.append("")
    if spatika:
        lines.append("UI must use Spatika (@spatika/react, @spatika/tokens):")
        lines.extend(f"- {item}" for item in spatika)
        lines.append(
            "Remove the other UI kit and build with Spatika components, tokens CSS, and SpatikaThemeProvider."
        )
    return "\n".join(lines).strip() + "\n"
