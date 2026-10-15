#!/usr/bin/env python3
"""Auditable, OFFLINE comparison of two public ICANN 2026 APS CSV observations.

This tool never fetches ICANN data, rewrites the production listing, or assumes
that an absent record is withdrawn. Application IDs ending in -R are replacement
records, not second applications. Derived exact matches are not ICANN decisions.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "data/applications_2026_aps_official_listing.csv"
PROVENANCE = ROOT / "data/applications_2026_aps_official_provenance.json"
ARCHIVE = ROOT / "data/evidence/aps-2026"
APS_URL = "https://newgtldprogram-aps.icann.org/aps/applications/export/csv"
REQUIRED = ("Application ID", "Primary String", "Applicant Name",
            "Application Type", "Application Status", "Application Processing Stage")
FIELDS = ("Primary String", "Primary String Unicode Label", "Applicant Name",
          "Application Type", "Application Status", "Application Processing Stage",
          "TLD Variants")


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def json_text(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def base_id(record_id: str) -> str:
    return record_id[:-2] if record_id.endswith("-R") else record_id


def load(path: Path, expected_columns: list[str] | None = None) -> dict:
    raw = path.read_bytes()
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig"), newline=""))
    columns = reader.fieldnames
    if not columns or not set(REQUIRED).issubset(columns):
        raise ValueError("Missing required official APS columns in " + str(path))
    if expected_columns is not None and columns != expected_columns:
        raise ValueError("APS column schema changed; review before interpreting a diff")
    rows = list(reader)
    if not rows or any(None in row for row in rows):
        raise ValueError("Empty or structurally invalid APS CSV")
    ids = [row["Application ID"].strip() for row in rows]
    if any(not ident for ident in ids) or len(ids) != len(set(ids)):
        raise ValueError("Empty or duplicate APS record IDs")
    original = {row["Application ID"]: row for row in rows
                if not row["Application ID"].endswith("-R")}
    replacement = {base_id(row["Application ID"]): row for row in rows
                   if row["Application ID"].endswith("-R")}
    if not set(replacement).issubset(original):
        raise ValueError("Orphan replacement -R record; stop and inspect the export")
    return {"sha256": sha256(raw), "columns": columns, "rows": len(rows),
            "original": original, "replacement": replacement}


def summary(observation: dict) -> dict:
    originals = observation["original"]
    primary_groups: dict[str, list[str]] = defaultdict(list)
    for ident, row in originals.items():
        if row["Application Type"] != "Existing gTLD with Variants":
            primary_groups[row["Primary String"].strip().lower().lstrip(".")].append(ident)
    overlaps = [ids for ids in primary_groups.values() if len(ids) > 1]
    return {
        "source_sha256": observation["sha256"],
        "public_records": observation["rows"],
        "base_application_ids": len(originals),
        "replacement_records_not_applications": len(observation["replacement"]),
        "distinct_original_primary_labels_excluding_existing_tld_variant_only": len(primary_groups),
        "derived_exact_primary_groups_not_official_contention_sets": len(overlaps),
        "applications_in_derived_exact_primary_groups": sum(map(len, overlaps)),
        "observed_base_application_statuses": dict(sorted(Counter(
            x["Application Status"] for x in originals.values()).items())),
    }


def compare(before: dict, after: dict) -> dict:
    if before["columns"] != after["columns"]:
        raise ValueError("Snapshots have different APS column schemas")
    changes = []
    old, new = before["original"], after["original"]
    for ident in sorted(set(old) | set(new)):
        if ident not in old:
            changes.append({"application_id": ident, "kind": "newly_observed_public_id",
                            "after": new[ident]["Primary String"]})
            continue
        if ident not in new:
            changes.append({"application_id": ident, "kind": "no_longer_in_public_export",
                            "before": old[ident]["Primary String"],
                            "interpretation": "absence does not establish withdrawal or rejection"})
            continue
        for field in FIELDS:
            if field not in before["columns"]:
                continue
            a, b = old[ident][field].strip(), new[ident][field].strip()
            if a != b:
                changes.append({"application_id": ident, "kind": "base_record_field_changed",
                                "field": field, "before": a, "after": b})
        a, b = before["replacement"].get(ident), after["replacement"].get(ident)
        if a is None and b is not None:
            changes.append({"application_id": ident, "kind": "replacement_record_newly_observed",
                            "after": b["Primary String"]})
        elif a is not None and b is None:
            changes.append({"application_id": ident, "kind": "replacement_record_no_longer_visible",
                            "before": a["Primary String"]})
        elif a is not None and b is not None:
            for field in FIELDS:
                if field not in before["columns"]:
                    continue
                old_value, new_value = a[field].strip(), b[field].strip()
                if old_value != new_value:
                    changes.append({"application_id": ident, "kind": "replacement_record_field_changed",
                                    "field": field, "before": old_value, "after": new_value})
    return {
        "method": "Exact public APS record comparison by stable base Application ID",
        "evidence_class": "observed_changes_not_adjudicated_outcomes",
        "caveats": [
            "Missing from a later export does not establish withdrawal or rejection.",
            "A -R row is a replacement record, not another application; no switch is inferred.",
            "Primary-label exact matches are analytical groups, not official ICANN contention sets.",
            "Each snapshot is an observation, not a reconstruction of unobserved events.",
        ],
        "previous": summary(before), "current": summary(after),
        "changes": changes,
        "change_counts": dict(sorted(Counter(c["kind"] for c in changes).items())),
    }


def captured_utc(text: str) -> str:
    try:
        stamp = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("Invalid --captured-at ISO timestamp") from exc
    if stamp.tzinfo is None:
        raise ValueError("--captured-at needs an explicit time zone")
    return stamp.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def stage(source: Path, output_dir: Path, captured_at: str, source_url: str) -> dict:
    if source_url != APS_URL:
        raise ValueError("Only the official ICANN APS export URL may be labelled as APS provenance")
    baseline_provenance = json.loads(PROVENANCE.read_text(encoding="utf-8"))
    observation = load(source, baseline_provenance["csvColumns"])
    stamp = captured_utc(captured_at)
    name = stamp.replace("-", "").replace(":", "") + "-" + observation["sha256"][:16]
    dest = output_dir / (name + ".csv")
    manifest = output_dir / (name + ".json")
    metadata = {
        "snapshot_id": name, "source_url": source_url,
        "captured_at_utc": stamp, "source_sha256": observation["sha256"],
        "csv_columns": observation["columns"], "source_file": dest.name,
        "summary": summary(observation),
        "method": "Offline staging only; no automatic publication or alteration to frozen research releases",
    }
    expected_manifest = json_text(metadata)
    if dest.exists() and dest.read_bytes() != source.read_bytes():
        raise ValueError("Archive file already exists with different bytes")
    if manifest.exists() and manifest.read_text(encoding="utf-8") != expected_manifest:
        raise ValueError("Snapshot manifest already exists with different content")
    output_dir.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        dest.write_bytes(source.read_bytes())
    if not manifest.exists():
        manifest.write_text(expected_manifest, encoding="utf-8")
    return metadata


def verify_baseline() -> dict:
    pinned = json.loads(PROVENANCE.read_text(encoding="utf-8"))
    observed = load(BASELINE, pinned["csvColumns"])
    if observed["sha256"] != pinned["normalizedCSVSHA256"]:
        raise ValueError("Pinned official baseline source hash changed")
    stats = summary(observed)
    if (stats["public_records"] != pinned["totalOfficialListingRows"] or
        stats["base_application_ids"] != pinned["uniquePublishedApplicationRecords"] or
        stats["replacement_records_not_applications"] != pinned["replacementStringRecords"]):
        raise ValueError("Pinned official baseline cardinalities changed")
    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("verify-baseline")
    stage_parser = sub.add_parser("stage")
    stage_parser.add_argument("--csv", type=Path, required=True)
    stage_parser.add_argument("--captured-at", required=True)
    stage_parser.add_argument("--source-url", default=APS_URL)
    stage_parser.add_argument("--archive-dir", type=Path, default=ARCHIVE)
    compare_parser = sub.add_parser("compare")
    compare_parser.add_argument("--before", type=Path, default=BASELINE)
    compare_parser.add_argument("--after", type=Path, required=True)
    compare_parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.command == "verify-baseline":
        result = verify_baseline()
    elif args.command == "stage":
        result = stage(args.csv, args.archive_dir, args.captured_at, args.source_url)
    else:
        result = compare(load(args.before), load(args.after))
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(json_text(result), encoding="utf-8")
    print(json_text(result))


if __name__ == "__main__":
    main()
