#!/usr/bin/env python3
"""Focused integrity regressions for the current official-APS analytical layer."""
from __future__ import annotations

import csv
import importlib.util
import io
import json
import shutil
import tempfile
import unittest
from collections import Counter
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("aps_current", Path(__file__).with_name("build_aps_current_analytics.py"))
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)


class CurrentAnalyticsIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.outputs, cls.summary = builder.generate()
        cls.rows = list(csv.DictReader(io.StringIO(cls.outputs["aps_2026_current_analytics.csv"])))

    def test_official_identity_and_unit_weights(self):
        source = builder.csv_rows(builder.DATA / builder.SOURCE_NAME)
        originals = {r["Application ID"]: r for r in source if not r["Application ID"].endswith("-R")}
        self.assertEqual(set(originals), {r["application_id"] for r in self.rows})
        self.assertEqual({r["application_weight"] for r in self.rows}, {"1"})
        for row in self.rows:
            self.assertEqual(row["applicant_name"], originals[row["application_id"]]["Applicant Name"])
        self.assertEqual(sum(r["comparable_scope"] == "true" for r in self.rows), 1608)

    def test_classifications_do_not_propagate_between_variables(self):
        agent = [r for r in self.rows if r["primary_string"] == "agent"]
        self.assertEqual(len(agent), 13)
        self.assertEqual({r["string_theme"] for r in agent}, {"AI & automation"})
        self.assertEqual(Counter(r["applicant_sector"] for r in agent),
                         {"": 8, "Registry & domain industry": 4, "AI & automation": 1})
        self.assertTrue(all(not r["corporate_group"] for r in self.rows))
        self.assertTrue(all(not r["string_theme"] for r in self.rows if r["comparable_scope"] == "false"))

    def test_derived_distributions_keep_scope_and_denominator(self):
        for rows in self.summary["distributions"].values():
            for scope, expected in (("all_published", 1614), ("new_primary", 1608)):
                selected = [r for r in rows if r["scope"] == scope]
                self.assertEqual(sum(r["applications"] for r in selected), expected)
                self.assertEqual({r["denominator"] for r in selected}, {expected})
        self.assertEqual(self.summary["coverage"]["all_published"]["distinctApplicantNames"], 480)
        self.assertEqual(self.summary["coverage"]["new_primary"]["distinctApplicantNames"], 477)
        self.assertEqual(self.summary["coverage"]["new_primary"]["officialFlagCounts"]["brand"], 333)
        designations = {r["category"]: r["applications"] for r in self.summary["distributions"]["namingDesignations"]
                        if r["scope"] == "new_primary"}
        self.assertEqual(designations["brand"] + designations["brand|geo-self-designated"], 333)

    def test_generation_is_deterministic_and_legacy_is_frozen(self):
        outputs, summary = builder.generate()
        self.assertEqual(outputs, self.outputs)
        self.assertEqual(builder.sha((builder.DATA / builder.LEGACY_NAME).read_bytes()), builder.LEGACY_SHA256)
        for name, content in outputs.items():
            self.assertEqual((builder.DATA / name).read_bytes(), content.encode("utf-8"), name)

    def test_amazon_and_missing_group_are_explicit(self):
        rows = list(csv.DictReader(io.StringIO(self.outputs["registry_concentration.csv"])))
        corpus = [r for r in rows if r["Layer"] == "Local 2012 corpus applications"]
        historical = [r for r in rows if r["Layer"] == "Historical contextual statement"]
        missing = [r for r in rows if r["Layer"] == "Corporate-group ranking coverage"]
        self.assertEqual([r["Value"] for r in corpus], ["76"])
        self.assertEqual([r["Value"] for r in historical], ["78"])
        self.assertEqual([r["Value"] for r in missing], [""])
        self.assertFalse(any(r["Entity"] == "[official dataset]" for r in rows))

    def test_mutated_source_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            data = Path(directory)
            for name in (builder.SOURCE_NAME, builder.PROVENANCE_NAME):
                shutil.copyfile(builder.DATA / name, data / name)
            with (data / builder.SOURCE_NAME).open("a") as file:
                file.write("\n")
            with self.assertRaisesRegex(ValueError, "digest mismatch"):
                builder.source_inputs(data)

    def test_duplicate_official_record_is_rejected_even_with_new_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            data = Path(directory)
            records = builder.csv_rows(builder.DATA / builder.SOURCE_NAME)
            records[1] = records[0].copy()
            contents = builder.csv_text(records, list(records[0]))
            (data / builder.SOURCE_NAME).write_text(contents, encoding="utf-8")
            provenance = json.loads((builder.DATA / builder.PROVENANCE_NAME).read_text())
            provenance["normalizedCSVSHA256"] = builder.sha(contents.encode("utf-8"))
            (data / builder.PROVENANCE_NAME).write_text(json.dumps(provenance))
            with self.assertRaisesRegex(ValueError, "row identity failure"):
                builder.source_inputs(data)


if __name__ == "__main__":
    unittest.main()
