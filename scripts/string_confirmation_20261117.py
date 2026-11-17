#!/usr/bin/env python3
"""Summarize String Confirmation Day APS transitions against the frozen Reveal Day baseline.

Offline only. This script does not fetch data and does not alter frozen evidence.
"""
from __future__ import annotations

import argparse, csv, io, json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "data/applications_2026_aps_official_listing.csv"
WATCHED = {
    "lugano": "CDL2651T-T31516",
    "wdo": "WDO2627T-T45217",
}

def load(path: Path):
    raw = path.read_bytes().decode("utf-8-sig")
    rows = list(csv.DictReader(io.StringIO(raw, newline="")))
    by_id = {r["Application ID"].strip(): r for r in rows}
    return rows, by_id

def base_id(aid: str) -> str:
    return aid[:-2] if aid.endswith("-R") else aid

def summarize(before_path: Path, after_path: Path):
    before_rows, before = load(before_path)
    after_rows, after = load(after_path)

    before_base = {k:v for k,v in before.items() if not k.endswith("-R")}
    after_base = {k:v for k,v in after.items() if not k.endswith("-R")}

    families = sorted(set(map(base_id, before)) | set(map(base_id, after)))
    replacement_events = []
    structural = []

    for aid in families:
        b0, a0 = before.get(aid), after.get(aid)
        br, ar = before.get(aid+"-R"), after.get(aid+"-R")

        if b0 and not a0:
            structural.append({"application_id": aid, "kind": "base_no_longer_visible"})
        if not b0 and a0:
            structural.append({"application_id": aid, "kind": "base_newly_visible",
                               "string": a0.get("Primary String")})

        if not (a0 or ar):
            continue

        event = {
            "application_id": aid,
            "before_primary": b0.get("Primary String") if b0 else None,
            "after_primary": a0.get("Primary String") if a0 else None,
            "before_primary_status": b0.get("Application Status") if b0 else None,
            "after_primary_status": a0.get("Application Status") if a0 else None,
            "before_replacement": br.get("Primary String") if br else None,
            "after_replacement": ar.get("Primary String") if ar else None,
            "before_replacement_status": br.get("Application Status") if br else None,
            "after_replacement_status": ar.get("Application Status") if ar else None,
            "before_replacement_type": br.get("Application Type") if br else None,
            "after_replacement_type": ar.get("Application Type") if ar else None,
        }

        changed = any(event[k] != event[k.replace("after_", "before_")]
                      for k in list(event) if k.startswith("after_")
                      and k.replace("after_", "before_") in event)
        if changed:
            replacement_events.append(event)

    chosen_replacements = []
    for e in replacement_events:
        if e["before_replacement"] and e["after_replacement"]:
            # APS keeps the selected record typed as "Replacement String".
            # Selection is represented by the original record becoming
            # Deactivated while the replacement record remains Active.
            selected_transition = (
                e["before_primary_status"] == "Active"
                and e["before_replacement_status"] == "Active"
                and e["after_primary_status"] == "Deactivated"
                and e["after_replacement_status"] == "Active"
                and e["after_replacement_type"] == "Replacement String"
            )
            if selected_transition:
                chosen_replacements.append(e)

    watched = {}
    for label, aid in WATCHED.items():
        row = after.get(aid)
        watched[label] = {
            "application_id": aid,
            "visible_in_export": row is not None,
            "primary_string": row.get("Primary String") if row else None,
            "status": row.get("Application Status") if row else None,
            "stage": row.get("Application Processing Stage") if row else None,
        }

    return {
        "before": {
            "rows": len(before_rows),
            "base_ids": len(before_base),
            "statuses": dict(Counter(r["Application Status"] for r in before_base.values())),
        },
        "after": {
            "rows": len(after_rows),
            "base_ids": len(after_base),
            "statuses": dict(Counter(r["Application Status"] for r in after_base.values())),
        },
        "structural_changes": structural,
        "replacement_family_changes": replacement_events,
        "selected_replacements_detected": chosen_replacements,
        "selected_replacements_count": len(chosen_replacements),
        "watched": watched,
        "caveats": [
            "A missing record does not by itself establish withdrawal or rejection.",
            "A replacement is counted as selected only when the baseline showed both original and replacement Active, and the later APS state shows the original Deactivated while the replacement remains Active and typed Replacement String.",
            "Official contention-set files must be compared separately.",
        ],
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--before", type=Path, default=BASELINE)
    p.add_argument("--after", type=Path, required=True)
    p.add_argument("--output", type=Path)
    args = p.parse_args()
    out = summarize(args.before, args.after)
    txt = json.dumps(out, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(txt, encoding="utf-8")
    print(txt, end="")

if __name__ == "__main__":
    main()
