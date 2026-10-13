#!/usr/bin/env python3
"""Read-only A->B content continuity audit: run in checkout 'current', A in '../baseline'."""
import csv, hashlib, html, json, re, sys, zipfile
from pathlib import Path
A=Path('../baseline')
B=Path('.')
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
def sourcepaths(root):
    return {p.relative_to(root).as_posix():p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts}
a,b=sourcepaths(A),sourcepaths(B)
orig={k:v for k,v in a.items() if not k.startswith('.git/')}
missing_paths=sorted(set(orig)-set(b))
identical=sorted(k for k in orig if k in b and sha(orig[k])==sha(b[k]))
changed=sorted(set(orig)&set(b)-set(identical))
added=sorted(set(b)-set(orig))
translations={}
ta=json.loads((A/'data/translations.json').read_text())
tb=json.loads((B/'data/translations.json').read_text())
for lang in ('it','en','de','fr'):
    ak,bk=set(ta[lang]),set(tb[lang])
    translations[lang]=dict(before=len(ak),after=len(bk),
        missing=sorted(ak-bk),added=sorted(bk-ak),
        changed={k:{'A':ta[lang][k],'B':tb[lang][k]} for k in sorted(ak&bk) if ta[lang][k]!=tb[lang][k]})
srcA=(A/'src/index.web.html').read_text()
srcB=(B/'src/index.web.html').read_text()
patternSections=r'<section\b[^>]*\bclass="[^"]*\bsection\b[^"]*"[^>]*\bid="([^"]+)"'
patternI18n=r'data-i18n="([^"]+)"'
patternIDs=r'\bid="([^"]+)"'
patternLinks=r'\bhref="([^"]+)"'
def extract(pattern,s):
    return set(re.findall(pattern,s))
srcMetrics={}
for name,pat in [('sections',patternSections),('i18n_references',patternI18n),('ids',patternIDs),('hrefs',patternLinks)]:
    aa,bb=extract(pat,srcA),extract(pat,srcB)
    srcMetrics[name]=dict(A=len(aa),B=len(bb),removed=sorted(aa-bb),added=sorted(bb-aa))
articles=[]
for path in sorted(orig):
    if path.endswith('.html') and (path.startswith('applications/') or path.startswith('behind-the-round/') or path.startswith('inside-the-round/')):
        if path not in b:continue
        def body(p):
            s=p.read_text()
            m=re.search(r'<main\b[^>]*>[\s\S]*?</main>',s,re.I)
            return m.group() if m else ''
        am,bm=body(orig[path]),body(b[path])
        articles.append(dict(path=path,exact=(am==bm),old_chars=len(am),new_chars=len(bm),original_main_in_new=bool(am) and am in bm))
caseDatasets=[]
for path in sorted(orig):
    if path.startswith('data/') and re.search(r'(cases|investigations|stories|sanctions_explainer|internet_access_explainer)\.json$',path):
        caseDatasets.append(dict(path=path,same_sha=sha(orig[path])==sha(b[path])))
csvPaths=[p for p in sorted(orig) if p.endswith('.csv') and p.startswith('data/')]
csvChanged=[p for p in csvPaths if sha(orig[p])!=sha(b[p])]
def compare_json_values(x,y,prefix=''):
    diff=[]
    if isinstance(x,dict) and isinstance(y,dict):
        for k in sorted(set(x)|set(y)):
            name=prefix+'.'+str(k) if prefix else str(k)
            if k not in x:diff.append({'key':name,'from':'<absent>','to':y[k]})
            elif k not in y:diff.append({'key':name,'from':x[k],'to':'<absent>'})
            else:diff.extend(compare_json_values(x[k],y[k],name))
    elif x!=y:
        diff.append({'key':prefix,'from':x,'to':y})
    return diff
archives={}
for name in ['connecting-the-dots-data-pack-v0.7.77.zip','connecting-the-dots-data-pack-v0.7.78.zip','connecting-the-dots-data-pack.zip']:
    path='downloads/'+name
    if path not in orig or path not in b:continue
    x,y=orig[path],b[path]
    with zipfile.ZipFile(x) as z1,zipfile.ZipFile(y) as z2:
        za={i.filename:i for i in z1.infolist() if not i.is_dir()}
        zb={i.filename:i for i in z2.infolist() if not i.is_dir()}
        gone=sorted(set(za)-set(zb))
        new=sorted(set(zb)-set(za))
        changes=[]
        for f in sorted(set(za)&set(zb)):
            if za[f].CRC!=zb[f].CRC or za[f].file_size!=zb[f].file_size:
                # SHA-256 of decompressed payload to eliminate CRC collision ambiguity.
                aa=hashlib.sha256(z1.read(f)).hexdigest()
                bb=hashlib.sha256(z2.read(f)).hexdigest()
                if aa!=bb:changes.append(dict(name=f,old_size=za[f].file_size,new_size=zb[f].file_size,old_sha256=aa,new_sha256=bb))
        sameData=not(gone or new or changes)
        manifest_differences=compare_json_values(json.loads(z1.read('manifest.json')),json.loads(z2.read('manifest.json'))) if 'manifest.json' in za and 'manifest.json' in zb else []
        metadata=[f for f in sorted(set(za)&set(zb)) if
          (za[f].date_time,za[f].compress_size,za[f].external_attr,za[f].flag_bits)!=
          (zb[f].date_time,zb[f].compress_size,zb[f].external_attr,zb[f].flag_bits)]
        archives[name]=dict(A_sha256=sha(x),B_sha256=sha(y),
            bytes_identical=sha(x)==sha(y),payload_identical=sameData,
            original_entries=len(za),new_entries=len(zb),
            removed_entries=gone,added_entries=new,modified_entries=changes,
            manifest_differences=manifest_differences[:25],manifest_differences_count=len(manifest_differences),
            metadata_differences=metadata[:35],metadata_differences_count=len(metadata))
report=dict(
 baseline='safety/main-v0.7.78-before-b2-switch-20261013',
 current='main v0.7.80 / audit branch',
 tree=dict(A=len(orig),B=len(b),missing=missing_paths,identical=len(identical),
   changed=len(changed),added=added),
 source_model=srcMetrics,
 translations=translations,
 html_articles=dict(count=len(articles),all_exact=all(x['exact'] for x in articles),not_exact=[x for x in articles if not x['exact']]),
 case_datasets=caseDatasets,
 csv=dict(count=len(csvPaths),changed=csvChanged),
 archives=archives,
 sitemap_sha_equal=sha(A/'sitemap.xml')==sha(B/'sitemap.xml')
)
routes_a=set(re.findall(r'<loc>([^<]+)</loc>',(A/'sitemap.xml').read_text()))
routes_b=set(re.findall(r'<loc>([^<]+)</loc>',(B/'sitemap.xml').read_text()))
report['sitemap_routes']={'before':len(routes_a),'after':len(routes_b),
    'removed':sorted(routes_a-routes_b),'added':sorted(routes_b-routes_a)}
Path('content-continuity-audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
summary=dict(tree=report['tree'],article_count=report['html_articles']['count'],
 nonidentical_articles=report['html_articles']['not_exact'],
 source_losses={k:v['removed'] for k,v in srcMetrics.items()},
 translations={k:dict(missing=v['missing'],changed=list(v['changed']),added_count=len(v['added'])) for k,v in translations.items()},
 case_datasets_modified=[x['path'] for x in caseDatasets if not x['same_sha']],
 csv_changed=csvChanged,
 archives=archives,
 sitemap_identical=report['sitemap_sha_equal'],sitemap_routes=report['sitemap_routes'])
print('AB_CONTENT_PARITY_RESULT '+json.dumps(summary,ensure_ascii=False))
# Fail on actual content loss or rewriting an historical technical ZIP.
bad=bool(missing_paths or report['html_articles']['not_exact'] or report['sitemap_routes']['removed'] or
    any(v['missing'] for v in translations.values()) or
    any(srcMetrics[k]['removed'] for k in ('sections','i18n_references','ids')) or
    report['sitemap_routes']['removed'] or
    any(not v['same_sha'] for v in caseDatasets) or
    any(not z['bytes_identical'] for z in archives.values()))
if bad:
    print('AB_CONTENT_PARITY_REVIEW_REQUIRED: audit found differences requiring human review')
    sys.exit(2)
print('AB_CONTENT_PARITY_PASS')
