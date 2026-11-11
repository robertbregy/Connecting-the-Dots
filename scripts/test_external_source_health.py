#!/usr/bin/env python3
"""Offline regression tests: publication scope, HTTP uncertainty and dated evidence."""
from datetime import datetime, timezone
from io import BytesIO
import json
from pathlib import Path
import socket
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

import check_external_sources as health


class Response:
    def __init__(self, status=200, url="https://example.org/source"):
        self.status, self.url = status, url

    def geturl(self):
        return self.url

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class ProbeTests(unittest.TestCase):
    url = "https://example.org/source"

    def fake_opener(self, outcomes):
        calls = []

        def opener(request, timeout):
            calls.append((request.get_method(), request.get_header("Range"), timeout))
            item = outcomes[len(calls) - 1]
            if isinstance(item, BaseException):
                raise item
            return item

        return opener, calls

    def error(self, status):
        return HTTPError(self.url, status, "fixture", {}, BytesIO())

    def test_success(self):
        opener, calls = self.fake_opener([Response()])
        result = health.probe(self.url, opener=opener)
        self.assertEqual(result["state"], "OK")
        self.assertIsNotNone(result["checkedAtUTC"])
        self.assertEqual(len(calls), 1)
        self.assertFalse(result["hardFailure"])

    def test_followed_redirect_is_not_silently_ok(self):
        opener, _ = self.fake_opener([Response(url="https://example.org/new-source")])
        result = health.probe(self.url, opener=opener)
        self.assertEqual(result["state"], "redirect")
        self.assertTrue(result["redirected"])
        self.assertEqual(result["finalUrl"], "https://example.org/new-source")

    def test_restrictions_do_not_trigger_fallback_or_missing_source(self):
        for status in (401, 403, 407, 429, 451):
            with self.subTest(status=status):
                opener, calls = self.fake_opener([self.error(status)])
                result = health.probe(self.url, opener=opener)
                self.assertEqual(result["state"], "accesso limitato")
                self.assertEqual(result["status"], status)
                self.assertEqual(len(calls), 1)
                self.assertFalse(result["hardFailure"])

    def test_missing_source_requires_get_confirmation(self):
        for status in (404, 410):
            with self.subTest(status=status):
                opener, calls = self.fake_opener([self.error(status), self.error(status)])
                result = health.probe(self.url, opener=opener)
                self.assertEqual(result["state"], "errore")
                self.assertTrue(result["hardFailure"])
                self.assertEqual([method for method, _, _ in calls], ["HEAD", "GET"])
                self.assertEqual(calls[1][1], "bytes=0-1023")

    def test_head_false_negative_does_not_report_missing_source(self):
        opener, _ = self.fake_opener([self.error(404), Response()])
        result = health.probe(self.url, opener=opener)
        self.assertEqual(result["state"], "OK")
        self.assertFalse(result["hardFailure"])

    def test_restricted_get_does_not_confirm_head_404(self):
        opener, _ = self.fake_opener([self.error(404), self.error(403)])
        result = health.probe(self.url, opener=opener)
        self.assertEqual(result["state"], "accesso limitato")
        self.assertFalse(result["hardFailure"])

    def test_method_not_allowed_uses_get(self):
        opener, calls = self.fake_opener([self.error(405), Response()])
        result = health.probe(self.url, opener=opener)
        self.assertEqual(result["state"], "OK")
        self.assertEqual([call[0] for call in calls], ["HEAD", "GET"])

    def test_server_failure_is_error_but_not_confirmed_missing_source(self):
        opener, _ = self.fake_opener([self.error(503)])
        result = health.probe(self.url, opener=opener)
        self.assertEqual(result["state"], "errore")
        self.assertFalse(result["hardFailure"])

    def test_timeouts_and_transport_failures_remain_unverified(self):
        for exc in (socket.timeout("slow"), URLError(socket.timeout("slow")), URLError("DNS lookup failed")):
            with self.subTest(error=type(exc).__name__):
                opener, _ = self.fake_opener([exc])
                result = health.probe(self.url, opener=opener)
                self.assertEqual(result["state"], "da rivedere")
                self.assertIsNone(result["status"])
                self.assertFalse(result["hardFailure"])
                self.assertIsNotNone(result["checkedAtUTC"])

    def test_credentials_are_never_sent(self):
        opener, calls = self.fake_opener([])
        result = health.probe("https://user:secret@example.org/source", opener=opener)
        self.assertEqual(result["state"], "da rivedere")
        self.assertIsNone(result["checkedAtUTC"])
        self.assertEqual(calls, [])


class InventoryTests(unittest.TestCase):
    def test_published_allowlist_deduplicates_anchors_and_keeps_referrers(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for folder in ("src", "prototype", "guides"):
                (root / folder).mkdir()
            (root / "index.html").write_text('''
                <link rel="canonical" href="https://metadata.example/canonical">
                <a href="https://example.org/source?a=1&amp;b=2#one">source</a>
                <a href="/Connecting-the-Dots/guides/">internal</a>
                <a href="//robertbregy.github.io/another-project/">other project</a>
                <a href="mailto:reader@example.org">mail</a>
            ''')
            (root / "guides/index.html").write_text('<a href="https://example.org/source?a=1&amp;b=2#two">source</a>')
            (root / "src/index.html").write_text('<a href="https://unpublished.example/src">source</a>')
            (root / "prototype/index.html").write_text('<a href="https://unpublished.example/prototype">source</a>')
            inventory, pages = health.collect_sources(root, "https://robertbregy.github.io/Connecting-the-Dots/", [root / "index.html", root / "guides/index.html"])
            self.assertEqual(len(pages), 2)
            self.assertEqual(set(inventory), {"https://example.org/source?a=1&b=2", "https://robertbregy.github.io/another-project/"})
            self.assertEqual(inventory["https://example.org/source?a=1&b=2"], ["guides/index.html", "index.html"])

    def test_budget_does_not_invent_checks(self):
        inventory = {"https://example.org/a": ["index.html"], "https://example.org/b": ["index.html"]}
        with patch.object(health, "probe") as probe:
            rows = health.check_inventory(inventory, budget_seconds=-1)
        probe.assert_not_called()
        self.assertTrue(all(row["checkedAtUTC"] is None for row in rows))
        self.assertTrue(all(row["state"] == "da rivedere" for row in rows))
        self.assertTrue(all(row["referringPages"] == ["index.html"] for row in rows))

    def test_url_budget_retains_unattempted_urls(self):
        inventory = {"https://example.org/a": ["index.html"], "https://example.org/b": ["index.html"]}
        with patch.object(health, "probe", side_effect=lambda url, **kwargs: dict(health.unchecked(url, "fixture"), checkedAtUTC="2026-11-10T00:00:00Z")) as probe:
            rows = health.check_inventory(inventory, max_urls=1)
        self.assertEqual(probe.call_count, 1)
        self.assertEqual(len(rows), 2)
        self.assertIsNotNone(rows[0]["checkedAtUTC"])
        self.assertIsNone(rows[1]["checkedAtUTC"])


    def test_url_budget_gives_other_hosts_a_turn(self):
        inventory = {"https://a.example/1": ["index.html"], "https://a.example/2": ["index.html"],
                     "https://z.example/1": ["index.html"]}
        with patch.object(health, "probe", side_effect=lambda url, **kwargs: dict(health.unchecked(url, "fixture"), checkedAtUTC="2026-11-10T00:00:00Z")):
            rows = health.check_inventory(inventory, max_urls=2)
        checked = {row["url"] for row in rows if row["checkedAtUTC"]}
        self.assertEqual(checked, {"https://a.example/1", "https://z.example/1"})

class URLRoleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "iana.json").write_text(json.dumps({"records": {".example": {"rdapServers": ["https://rdap.example/base/"]}}}))
        self.policy = {"urlRoles": {
            "rdapServiceBases": {"metadataFile": "iana.json", "recordsField": "records", "urlsField": "rdapServers"},
            "excludedActions": [{"origin": "https://github.com", "path": "/owner/project/issues/new", "reason": "Feedback action; no request."}]
        }}

    def test_only_exact_corpus_base_can_reclassify_a_404(self):
        urls = {"https://rdap.example/base/": [], "https://rdap.example/base/domain/missing.example": [],
                "https://rdap.other.example/base/": [], "https://document.example/missing": []}
        roles = health.load_url_roles(self.root, self.policy, urls)
        for url in urls:
            row = dict(health.unchecked(url, "HTTP error"), status=404, state="errore", hardFailure=True,
                       checkedAtUTC="2026-11-10T00:00:00Z", checks=[{"method": "GET", "status": 404}])
            result = health.apply_url_role(row, roles.get(url))
            self.assertEqual(result["url"], url)
            self.assertEqual(result["status"], 404)
            self.assertEqual(result["checks"], [{"method": "GET", "status": 404}])
            self.assertEqual(result["hardFailure"], url != "https://rdap.example/base/")
            if url == "https://rdap.example/base/":
                self.assertEqual(result["state"], "da rivedere")
                self.assertEqual(result["roleEvidence"]["recordIDs"], [".example"])

    def test_prefilled_feedback_actions_are_not_requested_or_normalized(self):
        url = "https://github.com/owner/project/issues/new?title=Signalement+d’une+erreur&body=geändert"
        inventory = {url: ["fr/index.html"]}
        roles = health.load_url_roles(self.root, self.policy, inventory)
        with patch.object(health, "probe") as probe:
            rows = health.check_inventory(inventory, roles=roles)
        probe.assert_not_called()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["url"], url)
        self.assertEqual(rows[0]["checkDisposition"], "excluded-action")
        self.assertIsNone(rows[0]["checkedAtUTC"])
        self.assertEqual(rows[0]["state"], "da rivedere")
        self.assertEqual(rows[0]["referringPages"], ["fr/index.html"])

    def test_feedback_exclusion_does_not_apply_to_other_pages_or_repositories(self):
        urls = {"https://github.com/other/project/issues/new?title=x": [],
                "https://github.com/owner/project/issues/7": [],
                "https://other.example/owner/project/issues/new": []}
        self.assertEqual(health.load_url_roles(self.root, self.policy, urls), {})


class FreshnessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.policy = {"timezone": "Europe/Zurich", "snapshots": [{
            "id": "current", "label": "APS current view", "role": "current-view-from-dated-evidence",
            "metadataFile": "snapshot.json", "dateField": "observed", "reviewAfterDays": 14,
            "nextReview": {"label": "String Confirmation Day", "metadataFile": "publication.json", "dateField": "stringConfirmation"}
        }]}
        (self.root / "publication.json").write_text(json.dumps({"stringConfirmation": "2026-11-17"}))

    def evaluate(self, observed, now):
        (self.root / "snapshot.json").write_text(json.dumps({"observed": observed}))
        return health.evaluate_freshness(self.root, self.policy, datetime.fromisoformat(now).replace(tzinfo=timezone.utc))[0]

    def test_age_threshold_is_inclusive(self):
        before = self.evaluate("2026-10-28", "2026-11-10T12:00:00")
        at = self.evaluate("2026-10-27", "2026-11-10T12:00:00")
        self.assertEqual(before["state"], "within-review-window")
        self.assertEqual(at["state"], "review-due")
        self.assertEqual(at["ageDays"], 14)

    def test_milestone_triggers_even_when_under_age_threshold(self):
        before = self.evaluate("2026-11-15", "2026-11-16T12:00:00")
        at = self.evaluate("2026-11-15", "2026-11-17T12:00:00")
        self.assertEqual(before["milestoneState"], "upcoming")
        self.assertFalse(before["reviewRequired"])
        self.assertEqual(at["milestoneState"], "review-due")
        self.assertTrue(at["reviewRequired"])

    def test_future_milestone_does_not_relabel_observation_as_current(self):
        row = self.evaluate("2026-10-11", "2026-11-10T12:00:00")
        self.assertEqual(row["observedOn"], "2026-10-11")
        self.assertEqual(row["nextReviewOn"], "2026-11-17")
        self.assertEqual(row["milestoneState"], "upcoming")
        self.assertTrue(row["reviewRequired"])

    def test_recent_editorial_review_can_acknowledge_old_dated_evidence_before_milestone(self):
        self.policy["snapshots"][0]["lastReviewedOn"] = "2026-11-10"
        self.policy["snapshots"][0]["reviewOutcome"] = "Reviewed; intentionally retain dated evidence."
        row = self.evaluate("2026-10-11", "2026-11-10T12:00:00")
        self.assertEqual(row["state"], "reviewed-dated-evidence")
        self.assertFalse(row["reviewRequired"])
        self.assertEqual(row["lastReviewedOn"], "2026-11-10")
        self.assertEqual(row["reviewAgeDays"], 0)
        self.assertEqual(row["milestoneState"], "upcoming")

    def test_milestone_still_forces_refresh_after_a_pre_milestone_review(self):
        self.policy["snapshots"][0]["lastReviewedOn"] = "2026-11-10"
        row = self.evaluate("2026-10-11", "2026-11-17T12:00:00")
        self.assertTrue(row["reviewRequired"])
        self.assertEqual(row["milestoneState"], "review-due")

    def test_milestone_boundary_uses_switzerland_date(self):
        row = self.evaluate("2026-11-15", "2026-11-16T23:01:00")
        self.assertEqual(row["milestoneState"], "review-due")

    def test_observation_after_milestone_is_recorded_without_inventing_approval(self):
        row = self.evaluate("2026-11-17", "2026-11-17T12:00:00")
        self.assertEqual(row["milestoneState"], "observation-on-or-after-milestone")
        self.assertFalse(row["reviewRequired"])
        self.assertIn("not a claim of live data", row["reason"])

    def test_frozen_archives_never_expire(self):
        self.policy["snapshots"][0]["role"] = "frozen-evidence"
        row = self.evaluate("2000-01-01", "2026-11-17T12:00:00")
        self.assertEqual(row["state"], "frozen-evidence")
        self.assertFalse(row["reviewRequired"])
        self.assertNotIn("milestoneState", row)

    def test_missing_or_future_observation_requires_metadata_review(self):
        for observed in ("not-a-date", "2026-11-18"):
            with self.subTest(observed=observed):
                row = self.evaluate(observed, "2026-11-17T12:00:00")
                self.assertEqual(row["state"], "metadata-error")
                self.assertTrue(row["reviewRequired"])

    def test_frozen_release_is_selected_by_identity_after_next_release(self):
        manifest = {"currentResearchRelease": {"id": "RR3", "dataSnapshot": {"publicationAsOf": "2026-11-17"}},
                    "previousResearchReleases": [{"id": "RR2", "dataSnapshot": {"publicationAsOf": "2026-10-10"}},
                                                 {"id": "RR1", "dataSnapshot": {"publicationAsOf": "2026-10-09"}}]}
        (self.root / "manifest.json").write_text(json.dumps(manifest))
        self.policy["snapshots"] = [{"id": "archive", "label": "RR2", "role": "frozen-evidence", "releaseId": "RR2",
                                      "metadataFile": "manifest.json", "dateField": "dataSnapshot.publicationAsOf"}]
        row = health.evaluate_freshness(self.root, self.policy, datetime(2026, 11, 18, tzinfo=timezone.utc))[0]
        self.assertEqual(row["observedOn"], "2026-10-10")
        self.assertEqual(row["state"], "frozen-evidence")
        self.assertFalse(row["reviewRequired"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
