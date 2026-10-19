"""Regression checks against the immutable v0.7.87 corpus and primary cohorts."""
import csv
import hashlib
import io
import json
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
def read(n):return json.loads((DATA/n).read_text())
def tokens(s):return set(filter(None,s.split('|')))

summary=read('tld_cultural_patterns.json');analysis=read('cultural_sensitivity_v2.json')
assert summary['sensitivity']==analysis
families=set(summary['comparableCategoryIds'])
current={r['ascii_string']:r for r in csv.DictReader((DATA/'tld_cultural_corpus.csv').open())}
pack=ROOT/'downloads/connecting-the-dots-data-pack-v0.7.87.zip'
assert hashlib.sha256(pack.read_bytes()).hexdigest()=='8231bf27ad276e706dc213657fa4d8dd658e06bdc461d2da04c550f56610212d'
with zipfile.ZipFile(pack) as z:
    previous={r['ascii_string']:r for r in csv.DictReader(io.StringIO(z.read('tld_cultural_corpus.csv').decode('utf-8-sig')))}
assert set(current)==set(previous), 'Do not change the corpus while extending classification'
for k,r in current.items():
    old=previous[k]
    for field in ['rounds','comparable_rounds','roles','current_root_status','iana_registration_date','official_designations_2026','primary_application_ids_2026']:
        assert r[field]==old[field], (k,field)
    assert tokens(r['baseline_category_ids'])==tokens(old['category_ids'])&families, (k,'baseline drift')
    assert tokens(r['category_ids'])&families==tokens(r['baseline_category_ids'])|tokens(r['lexicon_category_ids']), k
for r in analysis['rounds']:
    cohort=[v for v in current.values() if r['round'] in tokens(v['comparable_rounds'])]
    assert len(cohort)==r['strings']
    for mode,field in [('baseline','baseline_category_ids'),('lexiconOnly','lexicon_category_ids'),('expanded','category_ids')]:
        assert r['views'][mode]['classified']==sum(bool(tokens(x[field])&families) for x in cohort)
        for c,n in r['views'][mode]['categories'].items():assert n==sum(c in tokens(x[field]) for x in cohort)
        assert sum(s[mode] for s in r['strata'])==r['views'][mode]['classified']
    assert sum(s['strings'] for s in r['strata'])==r['strings']
    assert r['views']['expanded']['classified']>=r['views']['baseline']['classified']
a,b=analysis['rounds'][-2:]
assert [a['strings'],b['strings']]==[1409,980]
assert [a['views']['baseline']['classified'],b['views']['baseline']['classified']]==[333,334]
delta=lambda mode:b['views'][mode]['categories']['commerce']/980-a['views'][mode]['categories']['commerce']/1409
assert delta('baseline')>0 and delta('lexiconOnly')<0, 'Localized sensitivity example must remain supported'
paper=(ROOT/'research/connecting-the-dots-working-paper-v1.md').read_text()
assert f"{a['views']['lexiconOnly']['categories']['commerce']}/1,409 and {b['views']['lexiconOnly']['categories']['commerce']}/980" in paper, 'Paper lexical-count example is stale'
assert f"**{a['views']['expanded']['classified']} of 1,409**" in paper
assert f"**{b['views']['expanded']['classified']} of 980**" in paper
assert 'technology' in tokens(current['api']['lexicon_category_ids'])
assert not tokens(current['apple']['lexicon_category_ids'])
assert not tokens(current['amazon']['lexicon_category_ids'])
assert not tokens(current['agent']['lexicon_category_ids']), 'Agent alone must not imply AI'
assert 'commerce' in tokens(current['xn--czrs0t']['lexicon_category_ids'])
queue=list(csv.DictReader((DATA/'cultural_lexicon_review_queue_v2.csv').open()))
for r in queue:
    assert r['status']=='not-reviewed'
    assert not any(v for k,v in r.items() if k.startswith('reviewer_') or k=='adjudication')
protocol=read('cultural_classification_protocol_v2.json')
assert protocol['readerValidation']['participants']==0
assert protocol['operationalRules']['sourceSHA256']==hashlib.sha256((ROOT/'scripts/build_tld_cultural_trajectory.py').read_bytes()).hexdigest()
assert protocol['operationalRules']['lexiconSHA256']==hashlib.sha256((DATA/'cultural_lexicon_v2.json').read_bytes()).hexdigest()
print('CULTURAL_RESEARCH_V2_VERIFIED',json.dumps({'preservedStrings':len(current),'newlyRecognized2012':a['newlyRecognized'],'newlyRecognized2026':b['newlyRecognized'],'reviewQueue':len(queue),'humanParticipants':0}))
