#!/usr/bin/env python3
"""Reproducible analytical graph from the public ICANN 2026 APS Applications CSV.

One base ID = one application; terminal -R = related replacement RECORD.
Exact primary-label overlap is an analytical grouping, NOT adjudicated contention.
"""
from __future__ import annotations
import csv, hashlib, io, json, re
from collections import Counter, defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
D=ROOT/"data"
SOURCE=D/"applications_2026_aps_official_listing.csv"
PROV=D/"applications_2026_aps_official_provenance.json"
GRAPH=D/"aps_2026_application_graph.json"
BROWSER=D/"aps_2026_application_graph.js"
EDGES=D/"aps_2026_application_edges.csv"
HISTORY=D/"aps_2026_record_observations.csv"
REPORT=D/"aps_2026_application_graph_manifest.json"
URL="https://newgtldprogram-aps.icann.org/applications/"
TYPES=["TLD Type: Brand","TLD Type: Community","TLD Type: Geo (Self-Designated)",
       "TLD Type: Geo (String Review Confirmed)","TLD Type: IDN"]
LABELS=["Label: GAC Early Warning","Label: GAC Advice","Label: High Risk String",
        "Label: Objection","Label: Safeguard","Label: In Contention",
        "Label: Clarifying Questions","Label: Change Request",
        "Label: Open Comment Period","Label: Comments","Label: RVC",
        "Label: Applicant Support","Label: Variant Only (Existing TLD)",
        "Label: Variant Included","Label: CoC Exemption","Label: Reserved Name",
        "Label: CPE","Label: Singular/Plural"]
EDGE_COLS=["application_id","aps_record_id","string_ascii","string_unicode","relationship",
           "record_status","source_observed_utc","source_sha256"]
EVENT_COLS=["application_id","aps_record_id","observed_utc","primary_string",
            "application_type","application_status","processing_stage","source_sha256"]

def norm(x):
    return str(x or "").strip().lower().lstrip(".")
def digest(contents):
    return hashlib.sha256(contents).hexdigest()
def write(path,contents):
    path.write_text(contents,encoding="utf-8",newline="\n")
def csv_document(rows,columns):
    stream=io.StringIO(newline="")
    writer=csv.DictWriter(stream,fieldnames=columns,lineterminator="\n",extrasaction="ignore")
    writer.writeheader();writer.writerows(rows)
    return stream.getvalue()
def base_id(record_id):
    return record_id[:-2] if record_id.endswith("-R") else record_id
def public_link(record_id,section="summary"):
    if not re.fullmatch(r"[A-Za-z0-9-]{8,80}",record_id):
        raise ValueError("Invalid official public APS record ID "+record_id)
    return URL+record_id+"/"+section
def variants(cell):
    found=[{"ascii":norm(a),"unicode":u.strip()} for a,u in
           re.findall(r"(xn--[a-z0-9-]+)(?:\s*\(([^)]*)\))?",cell or "",re.I)]
    if cell and not found: raise ValueError("Unknown APS variant syntax: "+cell)
    return found
def flags(row):
    return [k.replace("TLD Type: ","").replace("Label: ","") for k in TYPES+LABELS if row.get(k)=="TRUE"]

def maintain_events(rows,provenance,source_sha):
    older=[]
    if HISTORY.exists():
        with HISTORY.open(encoding="utf-8",newline="") as file:
            reader=csv.DictReader(file)
            if reader.fieldnames!=EVENT_COLS: raise ValueError("APS historical event schema mismatch")
            older=list(reader)
    seen={(x["aps_record_id"],x["source_sha256"]):x for x in older}
    if len(seen)!=len(older): raise ValueError("Duplicate event identity in history")
    additional=[]
    for row in sorted(rows,key=lambda a:a["Application ID"]):
        rid=row["Application ID"]
        current=dict(application_id=base_id(rid),aps_record_id=rid,
                     observed_utc=provenance["retrievedAtUTC"],
                     primary_string=norm(row["Primary String"]),
                     application_type=row["Application Type"],
                     application_status=row["Application Status"],
                     processing_stage=row["Application Processing Stage"],
                     source_sha256=source_sha)
        old=seen.get((rid,source_sha))
        if old and old!=current: raise ValueError("Altered state for immutable source digest "+rid)
        if not old: additional.append(current)
    all_events=sorted(older+additional,
                      key=lambda a:(a["observed_utc"],a["application_id"],a["aps_record_id"]))
    write(HISTORY,csv_document(all_events,EVENT_COLS))
    return {"events":len(all_events),"added":len(additional),
            "sourceSnapshots":len({x["source_sha256"] for x in all_events})}

def build():
    provenance=json.loads(PROV.read_text(encoding="utf-8"))
    original=SOURCE.read_bytes()
    source_sha=digest(original)
    if source_sha!=provenance["normalizedCSVSHA256"]:
        raise ValueError("Pinned official APS digest did not match source")
    reader=csv.DictReader(io.StringIO(original.decode("utf-8-sig"),newline=""))
    if reader.fieldnames!=provenance["csvColumns"]: raise ValueError("APS source columns changed")
    rows=list(reader)
    if len(rows)!=2783 or len(rows)!=provenance["totalOfficialListingRows"]:
        raise ValueError("Incorrect official listing row count")
    ids=[x["Application ID"] for x in rows]
    if any(not x for x in ids) or len(set(ids))!=2783:
        raise ValueError("Missing or duplicated official APS IDs")
    originals={x["Application ID"]:x for x in rows if not x["Application ID"].endswith("-R")}
    alternatives={base_id(x["Application ID"]):x for x in rows if x["Application ID"].endswith("-R")}
    if len(originals)!=1614 or len(alternatives)!=1169 or not set(alternatives).issubset(originals):
        raise ValueError("Official APS 1614/1169 record identity reconciliation failed")
    if provenance["pendingAdministrativeCheckApplicationID"] in originals:
        raise ValueError("Withheld administrative-check record is not part of the listing")
    if any(originals[k]["Applicant Name"]!=v["Applicant Name"] for k,v in alternatives.items()):
        raise ValueError("Original/replacement applicant changed")
    primary=defaultdict(list)
    for key,row in originals.items():
        if row["Application Type"]!="Existing gTLD with Variants":
            primary[norm(row["Primary String"])].append(key)
    exact={k:sorted(v) for k,v in primary.items() if len(v)>1}
    if len(primary)!=980 or len(exact)!=263 or sum(map(len,exact.values()))!=891:
        raise ValueError("APS primary-string analytical baseline changed")
    if dict(Counter(x["Application Status"] for x in rows))!=provenance["statusCounts"]:
        raise ValueError("APS published status counts changed")
    edges=[];apps=[]
    for aid,row in sorted(originals.items(),key=lambda a:(norm(a[1]["Primary String"]),a[0])):
        primary_string=norm(row["Primary String"])
        alternative=alternatives.get(aid)
        only_variant=row["Application Type"]=="Existing gTLD with Variants"
        original_variants=variants(row["TLD Variants"])
        app={
          "id":aid,"primary":primary_string,
          "primaryUnicode":row["Primary String Unicode Label"].strip(),
          "applicant":row["Applicant Name"].strip(),
          "location":row["Location"],"region":row["Region"],"type":row["Application Type"],
          "status":row["Application Status"],"stage":row["Application Processing Stage"],
          "types":[t.replace("TLD Type: ","") for t in TYPES if row[t]=="TRUE"],
          "flags":flags(row),"variants":original_variants,
          "variantOnlyExistingTld":only_variant,
          "primarySameStringCount":0 if only_variant else len(primary[primary_string]),
          "exactPrimaryGroup":primary_string if not only_variant and len(primary[primary_string])>1 else None,
          "replacement":None,"detailUrl":public_link(aid)
        }
        def edge(record_id,string,unicode,relation,status):
            edges.append({"application_id":aid,"aps_record_id":record_id,
                 "string_ascii":norm(string),"string_unicode":unicode.strip(),
                 "relationship":relation,"record_status":status,
                 "source_observed_utc":provenance["retrievedAtUTC"],"source_sha256":source_sha})
        edge(aid,primary_string,row["Primary String Unicode Label"],
             "variant-existing-tld-primary" if only_variant else "primary",row["Application Status"])
        for var in original_variants:
            edge(aid,var["ascii"],var["unicode"],"variant",row["Application Status"])
        if alternative:
            rid=alternative["Application ID"]
            app["replacement"]={
              "id":rid,"string":norm(alternative["Primary String"]),
              "unicode":alternative["Primary String Unicode Label"].strip(),
              "status":alternative["Application Status"],
              "stage":alternative["Application Processing Stage"],
              "flags":flags(alternative),
              "detailUrl":public_link(rid)
            }
            edge(rid,alternative["Primary String"],alternative["Primary String Unicode Label"],
                 "replacement",alternative["Application Status"])
            for var in variants(alternative["TLD Variants"]):
                app["variants"].append({**var,"recordId":rid})
                edge(rid,var["ascii"],var["unicode"],"variant",alternative["Application Status"])
        apps.append(app)
    variant_edges=sum(x["relationship"]=="variant" for x in edges)
    if variant_edges!=13 or len(edges)!=1614+1169+13 or sum(x["variantOnlyExistingTld"] for x in apps)!=6:
        raise ValueError("APS variant and relational-edge census changed")
    if len({a["id"] for a in apps})!=1614 or sum(bool(a["replacement"]) for a in apps)!=1169:
        raise ValueError("Orphan or duplicate application-relationship graph")
    counts={
       "officialReportedApplications":provenance["officialStatisticsTotalApplications"],
       "officialPublishedApplications":1614,"officialListingRows":2783,
       "replacementRecords":1169,
       "replacementActive":sum(x["Application Status"]=="Active" for x in alternatives.values()),
       "replacementDeactivated":sum(x["Application Status"]=="Deactivated" for x in alternatives.values()),
       "newPrimaryStringApplications":1608,"newPrimaryStrings":980,
       "variantOnlyExistingTldApplications":6,"variantRelationships":variant_edges,
       "derivedExactPrimaryMatchGroups":263,"applicationsInExactPrimaryMatches":891,
       "officialUnpublishedApplications":1
    }
    event=maintain_events(rows,provenance,source_sha)
    graph={
       "schemaVersion":1,
       "scope":"published-official-APS-listing-not-local-copies-of-full-dossiers",
       "sourceURL":provenance["sourcePage"],"officialCSVURL":provenance["sourceExportURL"],
       "sourceSHA256":source_sha,
       "retrievedAtUTC":provenance["retrievedAtUTC"],
       "statisticsPublishedAtUTC":provenance["sourceStatisticsLastPublished"],
       "counts":counts,
       "notPublishedApplication":{
          "id":provenance["pendingAdministrativeCheckApplicationID"],
          "status":"administrative-check","detailUrl":public_link(provenance["pendingAdministrativeCheckApplicationID"])
       },
       "contention":{
          "classification":"derived-exact-initial-primary-string-overlap-not-official-confirmed-contention",
          "officialRevealListURL":"https://newgtldprogram.icann.org/en/application-rounds/round2/reveal-day-contention-sets.csv",
          "APSInContentionFalseIsNotAuthoritative":True,
          "officialFormalContentionUnavailableBeforeStringEvaluation":True
       },
       "coverage":{
          "APSListing":True,"applicationSummaryPages":"linked-only",
          "questionnairePDFsDownloaded":False,"questionnaireFullTextVendored":False,
          "confidentialPortions":"not included",
          "recordHistory":"source-dated observed statuses only; does not infer future outcomes"
       },
       "apps":apps
    }
    write(GRAPH,json.dumps(graph,ensure_ascii=False,indent=2)+"\n")
    write(BROWSER,"/* generated: public official ICANN APS snapshot */\nwindow.CTD_APS_2026="+
          json.dumps(graph,ensure_ascii=False,separators=(",",":"))+";\n")
    edges.sort(key=lambda x:(x["application_id"],x["relationship"],x["string_ascii"]))
    write(EDGES,csv_document(edges,EDGE_COLS))
    report={
      "schemaVersion":1,"sourceSha256":source_sha,
      "sourceURL":provenance["sourceExportURL"],"retrievedAtUTC":provenance["retrievedAtUTC"],
      "counts":counts,"eventHistory":{"events":event["events"],"sourceSnapshots":event["sourceSnapshots"]},
      "files":{path.name:{"sha256":digest(path.read_bytes()),"bytes":path.stat().st_size}
               for path in (GRAPH,BROWSER,EDGES,HISTORY)},
      "limitations":[
         "Public APS application-listing completeness excludes the under-administrative-check .wdo dossier.",
         "A -R record is an alternative label linked to its base application, not an additional application.",
         "13 variant links are string relationships, not 13 additional applications.",
         "Exact same-primary-string sets are analytical candidates, not final ICANN contention sets.",
         "Before ICANN String Evaluation, a false APS contention label does not establish no contention.",
         "Application status/processing stage and replacement status are independently observed fields.",
         "Application detail/response/documents pages are linked at their official APS routes but not mirrored or individually checked in full.",
         "The application observation log is append-only by source digest; disappearance from listing is not automatically a withdrawal."
      ]
    }
    write(REPORT,json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("APS_GRAPH_VERIFIED "+json.dumps({"apps":len(apps),"replacements":len(alternatives),
          "variantEdges":variant_edges,"stringEdges":len(edges),
          "exactPrimaryGroups":len(exact),"observations":event["events"]},sort_keys=True))
    return counts

if __name__=="__main__":
    build()
