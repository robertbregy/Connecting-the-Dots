#!/usr/bin/env python3
"""Recompute the dated root-membership comparison from preserved list bytes."""

import base64
import gzip
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def sha256(content):
    return hashlib.sha256(content).hexdigest()


def labels(content):
    header, *lines = content.decode("ascii").splitlines()
    assert re.fullmatch(r"# Version \d+, Last Updated .+ UTC", header), "Unexpected IANA list header"
    assert all(re.fullmatch(r"[A-Z0-9-]+", line) for line in lines), "Invalid delegated label"
    assert len(set(lines)) == len(lines), "Duplicated delegated label"
    return header, {line.lower() for line in lines}


def main():
    review = json.loads((DATA / "iana_root_revalidation_20261118.json").read_text())
    baseline = review["baseline"]
    observation = review["observation"]
    snapshot = json.loads((DATA / "iana_snapshot.json").read_text())
    archive = (DATA / baseline["archive"]).read_bytes()
    assert sha256(archive) == baseline["archiveSha256"] == snapshot["archive_sha256"]
    assert baseline["observedOn"] == snapshot["asOf"]
    evidence = json.loads(gzip.decompress(archive))["files"]
    baseline_path, = [key for key in evidence if key.endswith("/tlds-alpha-by-domain.txt")]
    historic_list = base64.b64decode(evidence[baseline_path])
    review_list = observation["listText"].encode("ascii")
    assert sha256(historic_list) == baseline["listSha256"]
    assert sha256(review_list) == observation["listSha256"]
    historic_header, historic = labels(historic_list)
    review_header, current = labels(review_list)
    assert historic_header == baseline["listHeader"]
    assert review_header == observation["listHeader"]
    assert observation["listSource"] == snapshot["listSource"]
    assert len(historic) == baseline["delegatedCount"] == snapshot["rootListCount"]
    assert len(current) == observation["delegatedCount"] == observation["registryActiveCount"]
    assert observation["activeMembershipAgrees"] is True
    assert sorted(current - historic) == review["added"]
    assert sorted(historic - current) == [change["label"] for change in review["removed"]]
    print(f"IANA_ROOT_MEMBERSHIP_REVIEW_VERIFIED {len(historic)} -> {len(current)}; removed: {', '.join(sorted(historic - current))}")


if __name__ == "__main__":
    main()
