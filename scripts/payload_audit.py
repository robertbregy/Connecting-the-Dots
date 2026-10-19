#!/usr/bin/env python3
"""Static artifact sizes only: not a browser transfer or Core Web Vitals metric."""
import argparse
import gzip
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FILES=("index.html","assets/app.js","data/site_bundle.js","data/applications_2026_strings_reveal.js","assets/aps-lazy.js")
def report():
    rows=[]
    for name in FILES:
        raw=(ROOT/name).read_bytes()
        rows.append({"file":name,"raw_bytes":len(raw),"gzip_bytes_estimate":len(gzip.compress(raw,compresslevel=9,mtime=0))})
    return {"scope":"Selected browser delivery artifacts, not measured transfers or Core Web Vitals. Inline locale data are included in HTML; optional graph and detail shards load only in Explorer.","files":rows}
if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--output",type=Path)
    args=parser.parse_args();data=json.dumps(report(),indent=2,sort_keys=True)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(data,encoding="utf-8")
    print(data)
