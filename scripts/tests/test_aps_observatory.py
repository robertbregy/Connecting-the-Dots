import csv
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from sys import path as pythonpath
pythonpath.insert(0, str(Path(__file__).resolve().parents[1]))
import aps_observatory as obs

C = ["Application ID","Primary String","Applicant Name","Application Type","Application Status","Application Processing Stage","TLD Variants"]
def row(i,s,status="Active"):
    return dict(zip(C,[i,s,"Applicant","Standard",status,"Pre-evaluation",""]))
def write(p,rows):
    with p.open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=C); w.writeheader(); w.writerows(rows)

class APSObservationTests(unittest.TestCase):
    def setUp(self):
        t=tempfile.TemporaryDirectory(); self.addCleanup(t.cleanup)
        self.root=Path(t.name);self.a=self.root/"a.csv";self.b=self.root/"b.csv"
    def test_replacement_not_application(self):
        write(self.a,[row("A01","alpha"),row("A01-R","beta","Deactivated")])
        write(self.b,[row("A01","alpha","Deactivated"),row("A01-R","beta"),row("B01","alpha")])
        r=obs.compare(obs.load(self.a),obs.load(self.b))
        self.assertEqual(r["previous"]["base_application_ids"],1)
        self.assertEqual(r["current"]["base_application_ids"],2)
        self.assertEqual(r["current"]["replacement_records_not_applications"],1)
        self.assertEqual(r["current"]["derived_exact_primary_groups_not_official_contention_sets"],1)
        self.assertEqual(r["change_counts"]["newly_observed_public_id"],1)
        self.assertEqual(r["change_counts"]["base_record_field_changed"],1)
        self.assertEqual(r["change_counts"]["replacement_record_field_changed"],1)
        self.assertEqual(obs.json_text(r),obs.json_text(obs.compare(obs.load(self.a),obs.load(self.b))))
    def test_absence_not_withdrawal(self):
        write(self.a,[row("A01","alpha"),row("B01","beta")]);write(self.b,[row("A01","alpha")])
        self.assertIn("does not establish withdrawal",obs.compare(obs.load(self.a),obs.load(self.b))["changes"][0]["interpretation"])
    def test_replacement_absence_not_selection(self):
        write(self.a,[row("A01","alpha"),row("A01-R","beta")]);write(self.b,[row("A01","alpha")])
        self.assertEqual(obs.compare(obs.load(self.a),obs.load(self.b))["change_counts"],{"replacement_record_no_longer_visible":1})
    def test_fail_closed(self):
        write(self.a,[row("A01-R","beta")])
        with self.assertRaisesRegex(ValueError,"Orphan"):obs.load(self.a)
        write(self.a,[row("A01","a"),row("A01","b")])
        with self.assertRaisesRegex(ValueError,"duplicate"):obs.load(self.a)
        write(self.a,[row("A01","a")])
        with self.assertRaisesRegex(ValueError,"schema"):obs.load(self.a,C[:-1])
    def test_time_zone_required(self):
        with self.assertRaisesRegex(ValueError,"time zone"):obs.captured_utc("2026-10-22T10:00:00")
        self.assertEqual(obs.captured_utc("2026-10-22T12:00:00+02:00"),"2026-10-22T10:00:00Z")
    def test_false_provenance_blocked(self):
        write(self.a,[row("A01","a")])
        with self.assertRaisesRegex(ValueError,"official ICANN"):obs.stage(self.a,self.root/"out","2026-10-22T10:00:00Z","https://example.com/")
    def test_official_baseline(self):
        result=obs.verify_baseline()
        self.assertEqual((result["public_records"],result["base_application_ids"],result["replacement_records_not_applications"]),(2783,1614,1169))
if __name__=="__main__":unittest.main()
