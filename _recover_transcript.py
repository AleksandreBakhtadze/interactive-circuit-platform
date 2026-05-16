#!/usr/bin/env python3
import json
from pathlib import Path

transcript = Path(
    "/mnt/c/Users/lela/.cursor/projects/wsl-localhost-Ubuntu-24-04-home-lela-interactive-circuit-platform"
    "/agent-transcripts/c95ba361-8c79-4049-9417-da539971e944/c95ba361-8c79-4049-9417-da539971e944.jsonl"
)
base_out = Path("/home/lela/interactive-circuit-platform/frontend/src")

target_rels = [
    "components/CircuitBoard/CircuitWorkbench.jsx",
    "components/CircuitBoard/CircuitWorkbench.module.css",
    "components/CircuitBoard/boardPlacement.js",
    "components/CircuitBoard/CircuitBoard.jsx",
    "components/CircuitBoard/CircuitBoard.module.css",
    "constants/componentArt.js",
    "constants/componentAssets.js",
]


def norm_path(p):
    if not p:
        return ""
    p = p.replace("\\", "/")
    prefixes = [
        "//wsl.localhost/Ubuntu-24.04/home/lela/interactive-circuit-platform/",
        "/home/lela/interactive-circuit-platform/",
    ]
    low = p.lower()
    for prefix in prefixes:
        if low.startswith(prefix.lower()):
            p = p[len(prefix) :]
            break
    if p.startswith("/"):
        p = p[1:]
    return p


def rel_from_frontend_src(p):
    p = norm_path(p)
    if p.startswith("frontend/src/"):
        return p[len("frontend/src/") :]
    if p.startswith("src/"):
        return p[len("src/") :]
    return None


def apply_str_replace(content, old, new, replace_all):
    if old is None:
        return content, False
    if replace_all:
        if old not in content:
            return content, False
        return content.replace(old, new), True
    if old not in content:
        return content, False
    return content.replace(old, new, 1), True


files = {}
write_counts = {r: 0 for r in target_rels}
str_replace_log = []
catalog_snippets = []
utils_snippets = []

line_num = 0
with transcript.open(encoding="utf-8") as f:
    for line in f:
        line_num += 1
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError as e:
            print(f"JSON error line {line_num}: {e}")
            continue
        if obj.get("role") != "assistant":
            continue
        content = obj.get("message", {}).get("content", [])
        if not isinstance(content, list):
            continue
        for item in content:
            if not isinstance(item, dict) or item.get("type") != "tool_use":
                continue
            name = item.get("name")
            inp = item.get("input") or {}
            path_norm = norm_path(inp.get("path", ""))

            if name == "Write":
                rel = rel_from_frontend_src(path_norm)
                if rel in target_rels:
                    files[rel] = inp.get("contents", "")
                    write_counts[rel] += 1
                if rel and "componentCatalog" in path_norm:
                    files["_componentCatalog.js"] = inp.get("contents", "")
                if rel and "circuitUtils" in path_norm:
                    files["_circuitUtils.js"] = inp.get("contents", "")

            elif name == "StrReplace":
                rel = rel_from_frontend_src(path_norm)
                old = inp.get("old_string")
                new = inp.get("new_string", "")
                replace_all = inp.get("replace_all", False)

                if rel in target_rels and rel in files:
                    files[rel], ok = apply_str_replace(files[rel], old, new, replace_all)
                    if not ok:
                        str_replace_log.append(
                            (line_num, rel, "FAILED", (old or "")[:60])
                        )

                if "componentCatalog.js" in path_norm:
                    key = "utils/componentCatalog.js"
                    if key in files:
                        files[key], ok = apply_str_replace(
                            files[key], old, new, replace_all
                        )
                    if "getSnapOffsets" in (old or "") + (new or ""):
                        catalog_snippets.append(
                            {
                                "line": line_num,
                                "ok": key in files,
                                "old": old,
                                "new": new,
                            }
                        )

                if "circuitUtils.js" in path_norm:
                    key = "utils/circuitUtils.js"
                    if key in files:
                        files[key], ok = apply_str_replace(
                            files[key], old, new, replace_all
                        )
                    if "canPlaceAt" in (old or "") + (new or ""):
                        utils_snippets.append(
                            {
                                "line": line_num,
                                "ok": key in files,
                                "old": old,
                                "new": new,
                            }
                        )

print("=== Write counts ===")
for r in target_rels:
    print(f"{r}: writes={write_counts[r]}, recovered={r in files}")

# Rescan all writes for debugging
print("\n=== All relevant Write paths ===")
with transcript.open(encoding="utf-8") as f:
    for ln, line in enumerate(f, 1):
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("role") != "assistant":
            continue
        for item in obj.get("message", {}).get("content", []):
            if (
                isinstance(item, dict)
                and item.get("type") == "tool_use"
                and item.get("name") == "Write"
            ):
                p = norm_path(item.get("input", {}).get("path", ""))
                keywords = [
                    "CircuitBoard",
                    "componentArt",
                    "componentAssets",
                    "boardPlacement",
                    "CircuitWorkbench",
                ]
                if any(k in p for k in keywords):
                    print(f"  L{ln}: {p}")

# Write recovered files
written = []
not_recovered = []
for rel in target_rels:
    if rel not in files:
        not_recovered.append(rel)
        continue
    out = base_out / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(files[rel], encoding="utf-8")
    written.append(str(out))
    print(f"\nWrote {out} ({len(files[rel])} chars)")

print("\n=== StrReplace failures ===")
for entry in str_replace_log:
    print(entry)

print("\n=== componentCatalog getSnapOffsets changes ===")
for s in catalog_snippets:
    print(f"Line {s['line']}, ok={s['ok']}")
    if s.get("old"):
        print("OLD:", s["old"][:500])
    if s.get("new"):
        print("NEW:", s["new"][:500])

print("\n=== circuitUtils canPlaceAt changes ===")
for s in utils_snippets:
    print(f"Line {s['line']}, ok={s['ok']}")
    if s.get("old"):
        print("OLD:", s["old"][:500])
    if s.get("new"):
        print("NEW:", s["new"][:500])

print("\n=== SUMMARY ===")
print("Written:", written)
print("Not recovered:", not_recovered)
