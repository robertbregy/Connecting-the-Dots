#!/usr/bin/env python3
"""Read-only A->B content continuity audit: run in checkout 'current', A in '../baseline'."""
import csv, hashlib, html, json, re, subprocess, sys, zipfile
from pathlib import Path
A=Path('../baseline')
B=Path('.')
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
def sourcepaths(root):
    return {p.relative_to(root).as_posix():p for p in root.rglob('*')
        if p.is_file() and not {'.git','node_modules','__pycache__'}.intersection(p.parts)}
if not (A/'src/index.web.html').is_file():
    print('AB_CONTENT_PARITY_REVIEW_REQUIRED: frozen A checkout is missing at ../baseline')
    sys.exit(2)
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
        # Approved 2026-10-14 Atlas shell integration adds only two in-page
        # navigation actions. Ignore this precisely identified wrapper, not
        # any dossier text, filter controls, datasets or original links.
        if path.startswith('applications/'):
            action=re.compile(r'<div class="apsHeroActions"><a class="apsBackAction"[^>]*>[^<]*</a><a class="apsSecondaryAction"[^>]*>[^<]*</a></div>')
            inserts=action.findall(bm)
            if len(inserts)==1:
                bm=action.sub('',bm,count=1)
        articles.append(dict(path=path,exact=(am==bm),old_chars=len(am),new_chars=len(bm),original_main_in_new=bool(am) and am in bm))
caseDatasets=[]
for path in sorted(orig):
    if path.startswith('data/') and re.search(r'(cases|investigations|stories|sanctions_explainer|internet_access_explainer)\.json$',path):
        caseDatasets.append(dict(path=path,same_sha=path in b and sha(orig[path])==sha(b[path])))
csvPaths=[p for p in sorted(orig) if p.endswith('.csv') and p.startswith('data/')]
csvChanged=[p for p in csvPaths if p not in b or sha(orig[p])!=sha(b[p])]
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
publication=json.loads((B/'publication.json').read_text(encoding='utf-8'))
report=dict(
 baseline='safety/main-v0.7.78-before-b2-switch-20261013',
 current='v'+publication['version'],
 publication_released_on=publication['releasedOn'],
 research_snapshot=publication['asOf'],
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
# 17 October reviewed editorial delta: the A snapshot is immutable, while
# the living Field Notes and process timeline deliberately acquire dated facts.
# Whitelist only the exact additive changes validated below. The original
# articles, source IDs, archived ZIPs and old case-history observations remain
# subject to the same fail-closed checks as before.
def verify_reviewed_fieldnotes_delta():
    try:
        pub=json.loads((B/'publication.json').read_text(encoding='utf-8'))
        if pub.get('version') not in ('0.7.82','0.7.83') or pub.get('asOf')!='2026-10-10' or pub.get('releasedOn')!='2026-10-17':
            return []
        old=json.loads((A/'data/field_investigations.json').read_text(encoding='utf-8'))
        new=json.loads((B/'data/field_investigations.json').read_text(encoding='utf-8'))
        if old['lastReviewed']!='2026-10-10' or new['lastReviewed']!='2026-10-17':
            return []
        if [x['id'] for x in old['episodes']]!=['objectors-eoi','replacement-strings'] or [x['id'] for x in new['episodes']]!=['objectors-eoi','replacement-strings','background-screening']:
            return []
        if old['episodes'][0]!=new['episodes'][0]:
            return []
        original,revision=old['episodes'][1],new['episodes'][1]
        additive=('revisedOn','sections','sources','updateTriggers','revisionHistory')
        if any(original[k]!=revision.get(k) for k in original if k not in additive):
            return []
        if (revision['revisedOn']!='2026-10-17' or
            revision['sections'][:len(original['sections'])]!=original['sections'] or
            len(revision['sections'])!=len(original['sections'])+1 or
            revision['sources'][:len(original['sources'])]!=original['sources'] or
            len(revision['sources'])!=len(original['sources'])+2 or
            revision['updateTriggers'][:len(original['updateTriggers'])]!=original['updateTriggers'] or
            revision['revisionHistory'][:len(original['revisionHistory'])]!=original['revisionHistory'] or
            len(revision['revisionHistory'])!=2 or
            revision['revisionHistory'][-1]['date']!='2026-10-17'):
            return []
        fifth=new['episodes'][2]
        if fifth['number']!=5 or fifth['revisedOn']!='2026-10-17' or fifth['publishedOn']!='2026-10-17' or len(fifth['sections'])!=5 or len(fifth['sources'])!=6:
            return []
        if not {'bs-icann-announcement','bs-board-blog','bs-icann-eligibility','bs-aps-wdo'}.issubset({x['id'] for x in fifth['sources']}):
            return []
        oldTimeline=json.loads((A/'data/inside_the_round_events.json').read_text(encoding='utf-8'))
        newTimeline=json.loads((B/'data/inside_the_round_events.json').read_text(encoding='utf-8'))
        oldBy={x['id']:x for x in oldTimeline['events']}
        newBy={x['id']:x for x in newTimeline['events']}
        if (len(oldBy)!=9 or len(newBy)!=11 or
            set(newBy)-set(oldBy)!={'board-auctions-preview','background-screening-provider'} or
            newTimeline['lastReviewed']!='2026-10-17'):
            return []
        for event_id,event in oldBy.items():
            candidate=newBy.get(event_id)
            if not candidate:
                return []
            if event_id=='replacement':
                candidate=dict(candidate);candidate.pop('extraSources',None)
            if candidate!=event:
                return []
        if newBy['board-auctions-preview']['date']!='2026-10-13' or newBy['background-screening-provider']['date']!='2026-10-15':
            return []
        allowed=[]
        for lang in ('it','en','de','fr'):
            for family,detail in [('behind-the-round','index.html'),('behind-the-round','replacement-strings/index.html'),('inside-the-round','index.html')]:
                path=f'{family}/{lang}/{detail}'
                a=orig[path].read_text(encoding='utf-8')
                b=B.joinpath(path).read_text(encoding='utf-8')
                oldMain=re.search(r'<main\b[^>]*>[\s\S]*?</main>',a,re.I).group()
                newMain=re.search(r'<main\b[^>]*>[\s\S]*?</main>',b,re.I).group()
                if family=='inside-the-round':
                    oldEvents=re.findall(r'<li\b[^>]*data-event-id="([^"]+)"[\s\S]*?</li>',oldMain)
                    newEvents=re.findall(r'<li\b[^>]*data-event-id="([^"]+)"[\s\S]*?</li>',newMain)
                    if len(oldEvents)!=9 or len(newEvents)!=11 or set(oldEvents)-set(newEvents) or set(newEvents)-set(oldEvents)!={'board-auctions-preview','background-screening-provider'}:
                        return []
                elif detail=='index.html':
                    oldStories=re.findall(r'<article\b[^>]*data-behind-story="[^"]+"[\s\S]*?</article>',oldMain)
                    if len(oldStories)!=2 or any(x not in newMain for x in oldStories):
                        return []
                    if (newMain.count('data-field-investigation-teaser=')!=3 or
                        'data-field-investigation-teaser="background-screening"' not in newMain):
                        return []
                else:
                    oldParts=re.findall(r'<section class="behindReading" data-referenced-sources="[^"]*">[\s\S]*?</section>',oldMain)
                    if len(oldParts)!=5 or any(x not in newMain for x in oldParts):
                        return []
                    oldNumbers=re.findall(r'data-field-quantity="([^"]+)"',oldMain)
                    newNumbers=re.findall(r'data-field-quantity="([^"]+)"',newMain)
                    if oldNumbers!=newNumbers or len(oldNumbers)!=3:
                        return []
                    if newMain.count('data-editorial-revision=')!=2 or newMain.count('data-referenced-sources=')!=6:
                        return []
                allowed.append(path)
        return allowed
    except (KeyError,IndexError,ValueError,AttributeError,TypeError,FileNotFoundError):
        return []

# The 18 October audit deliberately corrects existing prose as well as adding
# dated observations. Its approval is a list of exact files and exact source
# section SHA-256 fingerprints, not a version/date-based exemption. Reuse the
# source guard so both gates enforce the same protected inventories, DOI
# identifiers, link replacements and immutable research/technical archives.
review_path=B/'docs/editorial-review-2026-10-18.json'
editorial_review={'manifest':review_path.as_posix(),'validated':False,
    'allowed_paths':[],'errors':[]}
review=None
if review_path.is_file():
    try:
        review=json.loads(review_path.read_text(encoding='utf-8'))
        verification=subprocess.run(['node','scripts/verify_ia_b2_parity.cjs'],
            check=False,capture_output=True,text=True,timeout=60)
        proof_lines=[line for line in verification.stdout.splitlines()
            if line.startswith('IA_B2_SOURCE_PARITY_VERIFIED ')]
        if verification.returncode or len(proof_lines)!=1:
            editorial_review['errors'].append((verification.stderr or verification.stdout or
                'Source parity guard returned no proof').strip())
        else:
            proof=json.loads(proof_lines[0].split(' ',1)[1])
            if proof.get('reviewedAgainst')!='65e0fbe2080c2ee841e8abc01e1ddec113a74b8e':
                raise ValueError('The review does not preserve the pre-audit source baseline')
            editorial_review.update(validated=True,allowed_paths=sorted(review['files']),
                review_id=review['reviewId'],reviewed_on=review['reviewedOn'],
                manifest_sha256=sha(review_path),source_verification=proof)
    except (OSError,ValueError,KeyError,TypeError,subprocess.TimeoutExpired) as error:
        editorial_review['errors'].append(str(error))
elif publication.get('version') not in ('0.7.82','0.7.83'):
    editorial_review['errors'].append('An exact-file editorial review is required for this release')

approved_paths=set(editorial_review['allowed_paths']) if editorial_review['validated'] else set()
if editorial_review['validated']:
    approved_pages=sorted(path for path in approved_paths if path.endswith('.html'))
    approved_case_data={item['path'] for item in caseDatasets if item['path'] in approved_paths}
    approved_csv=set(csvChanged)&approved_paths
else:
    # Retain the previous, narrowly structural 17 October review for its own
    # releases. It cannot approve this audit or any later editorial change.
    approved_pages=verify_reviewed_fieldnotes_delta()
    approved_case_data={'data/field_investigations.json'} if len(approved_pages)==12 else set()
    approved_csv=set()

report['editorial_review']=editorial_review
report['reviewed_editorial_additions']={
    'date':'2026-10-17','validated':not editorial_review['validated'] and len(approved_pages)==12,
    'superseded_by':review.get('reviewId') if editorial_review['validated'] else None,
    'allowed_pages':approved_pages if not editorial_review['validated'] else [],
    'allowed_modified_dataset':sorted(approved_case_data) if not editorial_review['validated'] else [],
    'limitations':'The original 17 October additive review applies only to versions 0.7.82 and 0.7.83. Later reviews require exact file and source-section fingerprints; lost content and frozen ZIP modifications still fail.'
}
Path('content-continuity-audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))

summary=dict(tree=report['tree'],article_count=report['html_articles']['count'],
 nonidentical_articles=report['html_articles']['not_exact'],
 source_losses={k:v['removed'] for k,v in srcMetrics.items()},
 translations={k:dict(missing=v['missing'],changed=list(v['changed']),added_count=len(v['added'])) for k,v in translations.items()},
 case_datasets_modified=[x['path'] for x in caseDatasets if not x['same_sha']],
 csv_changed=csvChanged,
 editorial_review=editorial_review,
 archives=archives,
 sitemap_identical=report['sitemap_sha_equal'],sitemap_routes=report['sitemap_routes'])
print('AB_CONTENT_PARITY_RESULT '+json.dumps(summary,ensure_ascii=False))
# Fail on actual content loss or rewriting an historical technical ZIP.
unapproved_articles=[x for x in report['html_articles']['not_exact'] if x['path'] not in approved_pages]
unapproved_case_data=[x for x in caseDatasets if not x['same_sha'] and x['path'] not in approved_case_data]
unapproved_csv=[path for path in csvChanged if path not in approved_csv]
replaced_hrefs={item['from'] for item in review['linkReplacements']} if editorial_review['validated'] else set()
unapproved_hrefs=[href for href in srcMetrics['hrefs']['removed'] if href not in replaced_hrefs]
bad=bool(missing_paths or unapproved_articles or report['sitemap_routes']['removed'] or
    any(v['missing'] for v in translations.values()) or
    any(srcMetrics[k]['removed'] for k in ('sections','i18n_references','ids')) or
    unapproved_case_data or unapproved_csv or unapproved_hrefs or editorial_review['errors'] or
    any(not z['bytes_identical'] for z in archives.values()))
if report['html_articles']['not_exact'] and not approved_pages:
    print('AB_CONTENT_PARITY_UNREVIEWED_EDITORIAL_CHANGE: dated addition failed structural/evidence checks')

if bad:
    print('AB_CONTENT_PARITY_REVIEW_REQUIRED: audit found differences requiring human review')
    sys.exit(2)
print('AB_CONTENT_PARITY_PASS')
