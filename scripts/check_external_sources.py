#!/usr/bin/env python3
"""Weekly, read-only health check for external sources linked by the published site."""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urldefrag, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import json, os, re, socket, time

ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get("CTD_LINK_REPORT",ROOT/"external-source-health.json"))
OWN="robertbregy.github.io"
UA="Connecting-the-Dots-Source-Health/0.7.108 (+https://github.com/robertbregy/Connecting-the-Dots)"
href=re.compile(r'href=["\\\'](https?://[^"\\\']+)["\\\']',re.I)
urls=set()
for p in ROOT.rglob("*.html"):
    rel=p.relative_to(ROOT).as_posix()
    if rel.startswith(("src/","prototype/",".git/","node_modules/")): continue
    for raw in href.findall(p.read_text(encoding="utf-8",errors="ignore")):
        u=urldefrag(raw)[0]
        if urlparse(u).hostname!=OWN: urls.add(u)

def probe(url):
    started=time.time()
    def call(method):
        req=Request(url,method=method,headers={"User-Agent":UA,"Accept":"*/*"})
        if method=="GET": req.add_header("Range","bytes=0-1023")
        with urlopen(req,timeout=15) as res: return int(res.status),res.geturl()
    try:
        try: status,final=call("HEAD")
        except HTTPError as e:
            if e.code in (400,403,405,406,429,501):
                try: status,final=call("GET")
                except HTTPError as g: status,final=g.code,g.geturl()
            else: status,final=e.code,e.geturl()
        if status in (404,410): kind="hard-failure"
        elif status in (401,403,407,429,451): kind="restricted-or-rate-limited"
        elif 200<=status<400: kind="ok"
        else: kind="other-http"
        return {"url":url,"status":status,"finalUrl":final,"kind":kind,"seconds":round(time.time()-started,3)}
    except (URLError,socket.timeout,TimeoutError,OSError) as e:
        return {"url":url,"status":None,"finalUrl":None,"kind":"network-error","error":str(e)[:240],"seconds":round(time.time()-started,3)}

rows=[]
with ThreadPoolExecutor(max_workers=16) as pool:
    futures=[pool.submit(probe,u) for u in sorted(urls)]
    for f in as_completed(futures): rows.append(f.result())
rows.sort(key=lambda x:x["url"])
summary={k:sum(r["kind"]==k for r in rows) for k in sorted({r["kind"] for r in rows})}
report={"checkedAtUTC":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"total":len(rows),"summary":summary,"results":rows}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"total":len(rows),"summary":summary,"report":str(OUT)},indent=2))
for r in rows:
    if r["kind"]=="hard-failure": print(f"::error title=Broken external source::{r['status']} {r['url']}")
    elif r["kind"] in ("network-error","restricted-or-rate-limited"): print(f"::warning title=External source not fully verifiable::{r.get('status')} {r['url']}")
raise SystemExit(1 if any(r["kind"]=="hard-failure" for r in rows) else 0)
