#!/usr/bin/env python3
"""Reconcile Reveal Day and String Confirmation Day contention evidence.

Offline only. This script compares the two official ICANN contention CSVs with
one post-String-Confirmation APS export. It distinguishes observed public-file
facts from official aggregate values supplied by ICANN's 17 November 2026
announcement.
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path


def rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def groups(items: list[dict[str, str]]) -> dict[str, list[dict[str, str]]]:
    out: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in items:
        out[row["#"]].append(row)
    return dict(out)


def by_string(items: list[dict[str, str]]) -> dict[str, set[str]]:
    out: dict[str, set[str]] = defaultdict(set)
    for row in items:
        out[row["Applied-for string(s)"]].add(row["Application ID"])
    return dict(out)


def proceeding_families(aps: list[dict[str, str]]) -> list[dict[str, str]]:
    by_id = {r["Application ID"]: r for r in aps}
    base = [r for r in aps if not r["Application ID"].endswith("-R")]
    out = []
    for original in base:
        replacement = by_id.get(original["Application ID"] + "-R")
        chosen = (
            replacement
            if replacement
            and original["Application Status"] == "Deactivated"
            and replacement["Application Status"] == "Active"
            else original
        )
        if chosen["Application Status"] == "Active":
            out.append(chosen)
    return out


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--reveal", type=Path, required=True)
    p.add_argument("--confirmed", type=Path, required=True)
    p.add_argument("--aps", type=Path, required=True)
    p.add_argument("--output", type=Path)
    args = p.parse_args()

    reveal = rows(args.reveal)
    confirmed = rows(args.confirmed)
    aps = rows(args.aps)
    aps_by_id = {r["Application ID"]: r for r in aps}

    withdrawn = {
        r["Application ID"]: r
        for r in aps
        if not r["Application ID"].endswith("-R")
        and r["Application Status"] == "Withdrawn"
    }

    reveal_groups = groups(reveal)
    reveal_without_withdrawn = [
        r for r in reveal if r["Application ID"] not in withdrawn
    ]
    visible_pre_groups = {
        key: value
        for key, value in groups(reveal_without_withdrawn).items()
        if len(value) >= 2
    }
    visible_pre = [r for value in visible_pre_groups.values() for r in value]

    lost_by_withdrawal = []
    for key, value in reveal_groups.items():
        remaining = [r for r in value if r["Application ID"] not in withdrawn]
        if len(value) >= 2 and len(remaining) < 2:
            lost_by_withdrawal.append(
                {
                    "reveal_set": key,
                    "string": value[0]["Applied-for string(s)"],
                    "before_ids": [r["Application ID"] for r in value],
                    "remaining_ids": [r["Application ID"] for r in remaining],
                }
            )

    pre_strings = by_string(visible_pre)
    confirmed_strings = by_string(confirmed)
    vanished_strings = sorted(set(pre_strings) - set(confirmed_strings))

    retained_changes = []
    for string in sorted(set(pre_strings) & set(confirmed_strings)):
        removed = sorted(pre_strings[string] - confirmed_strings[string])
        added = sorted(confirmed_strings[string] - pre_strings[string])
        if removed or added:
            retained_changes.append(
                {
                    "string": string,
                    "before": len(pre_strings[string]),
                    "after": len(confirmed_strings[string]),
                    "removed_ids": removed,
                    "added_ids": added,
                }
            )

    selected = {}
    for r in aps:
        if (
            r["Application ID"].endswith("-R")
            and r["Application Status"] == "Active"
            and r["Application Type"] in ("New gTLD", "New gTLD with Variants")
        ):
            selected[r["Application ID"][:-2]] = r

    pre_ids = {r["Application ID"] for r in visible_pre}
    selected_from_visible_contention = sorted(set(selected) & pre_ids)

    proceeding = proceeding_families(aps)
    region_counts = Counter(r["Region"] for r in proceeding)

    official = {
        "proceeding_applications": 1610,
        "pre_replacement_contention_sets": 262,
        "pre_replacement_applications_in_contention": 885,
        "confirmed_contention_sets": 226,
        "confirmed_applications_in_contention": 709,
        "applicant_support_applications": 50,
        "ap_region_applications": 215,
    }

    visible = {
        "proceeding_application_families": len(proceeding),
        "pre_replacement_contention_sets_after_withdrawals": len(visible_pre_groups),
        "pre_replacement_applications_in_contention_after_withdrawals": len(visible_pre),
        "confirmed_contention_sets": len(groups(confirmed)),
        "confirmed_applications_in_contention": len(confirmed),
        "applicant_support_proceeding": sum(
            r["Label: Applicant Support"] == "TRUE" for r in proceeding
        ),
        "ap_region_proceeding": region_counts["AP"],
    }

    gap = {
        "proceeding_vs_public_aps": official["proceeding_applications"] - visible["proceeding_application_families"],
        "pre_replacement_contention_membership": official["pre_replacement_applications_in_contention"] - visible["pre_replacement_applications_in_contention_after_withdrawals"],
        "confirmed_contention_membership": official["confirmed_applications_in_contention"] - visible["confirmed_applications_in_contention"],
        "applicant_support": official["applicant_support_applications"] - visible["applicant_support_proceeding"],
        "ap_region_before_wdo_adjustment": official["ap_region_applications"] - visible["ap_region_proceeding"],
    }

    result = {
        "method": "Exact comparison of official ICANN Reveal Day and String Confirmation Day contention CSVs, reconciled against the post-confirmation APS export.",
        "observed_public_files": {
            "reveal": {"sets": len(reveal_groups), "rows": len(reveal)},
            "withdrawn_application_ids": sorted(withdrawn),
            "withdrawn_in_reveal_contention": sorted(
                r["Application ID"] for r in reveal if r["Application ID"] in withdrawn
            ),
            "sets_lost_due_to_withdrawal": lost_by_withdrawal,
            "visible_pre_replacement_after_withdrawals": {
                "sets": len(visible_pre_groups),
                "rows": len(visible_pre),
            },
            "confirmed": {"sets": len(groups(confirmed)), "rows": len(confirmed)},
            "sets_removed_after_withdrawal_adjustment": len(vanished_strings),
            "removed_set_strings": vanished_strings,
            "retained_sets_with_membership_changes": len(retained_changes),
            "retained_set_changes": retained_changes,
        },
        "replacement_effect": {
            "selected_replacements": len(selected),
            "selected_originals_in_visible_pre_replacement_contention": len(selected_from_visible_contention),
            "selected_original_ids_in_visible_pre_replacement_contention": selected_from_visible_contention,
        },
        "public_aps_proceeding": visible,
        "official_announcement_aggregates": official,
        "aggregate_minus_public_gaps": gap,
        "interpretation": [
            "The public Reveal Day contention CSV remains 263 sets / 891 rows.",
            "All nine applications later marked Withdrawn were members of that Reveal Day contention CSV.",
            "Removing those nine rows and dropping the resulting singleton .src group yields 262 visible sets / 881 visible contention memberships.",
            "The String Confirmation Day contention CSV has 226 sets / 705 rows.",
            "ICANN's announcement instead uses 262 / 885 before replacement and 226 / 709 after replacement: a constant +4 membership gap relative to the reconciled public files.",
            "The four-record gap must remain an unresolved aggregate/publication discrepancy until the missing application identities are publicly verifiable.",
        ],
    }

    text = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    print(text, end="")


if __name__ == "__main__":
    main()
