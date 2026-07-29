#!/usr/bin/env python3
"""Force Draw.io component SVGs to stay light regardless of OS dark mode."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "components"
STYLE_BLOCK = (
    "<style type=\"text/css\"><![CDATA["
    "svg{color-scheme:only light!important}"
    "*{color-scheme:only light!important}"
    "]]></style>"
)


def patch(text: str) -> str:
    text = text.replace("color-scheme: light dark", "color-scheme: only light")
    text = text.replace("color-scheme:light dark", "color-scheme: only light")

    # Ensure root svg style includes only light
    if 'color-scheme: only light' not in text and "<svg" in text:
        text = text.replace(
            "<svg ",
            '<svg style="color-scheme: only light;" ',
            1,
        )

    # Inject / refresh embedded style once after <svg ...>
    if "color-scheme:only light!important" not in text:
        idx = text.find("<svg")
        if idx >= 0:
            gt = text.find(">", idx)
            if gt >= 0:
                text = text[: gt + 1] + STYLE_BLOCK + text[gt + 1 :]

    return text


def main() -> None:
    changed = 0
    for path in sorted(ROOT.glob("*.svg")):
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated = patch(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"updated {path.name}")
    print(f"done, {changed} files changed")


if __name__ == "__main__":
    main()
