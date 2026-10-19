#!/usr/bin/env python3
"""Derive dated market comparisons from archived, attributed aggregate sources."""
from pathlib import Path
import csv
import hashlib
import io
import json
import sys
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'data/evidence/tld-market-2026-10-19'


def derive():
    provenance = json.loads((ROOT/'data/tld_market_provenance.json').read_text())
    for source in provenance['sources']:
        assert hashlib.sha256((ROOT/source['path']).read_bytes()).hexdigest() == source['sha256'], source['path']
    pages = [json.loads((EVIDENCE/f'ntlddata-tlds-{n}.json').read_text()) for n in (1, 2, 3)]
    records = [r for page in pages for r in page['data']]
    meta = pages[0]['meta']
    assert all(p['meta']['total'] == meta['total'] and p['meta']['data_version'] == meta['data_version'] and p['meta']['zone_data_date'] == meta['zone_data_date'] for p in pages)
    assert len(records) == len({r['tld'] for r in records}) == meta['total']
    corpus = {r['ascii_string']: r for r in csv.DictReader((ROOT/'data/tld_cultural_corpus.csv').open())}
    def annotate(tld):
        r = corpus.get(tld)
        assert r, 'No documented cohort for '+tld
        # Selection cohorts, not the earliest occurrence of a proposed label.
        # ICANN Contractual Compliance Report 7 explicitly defines both sets.
        selected2000 = {'aero','biz','coop','info','museum','name','pro'}
        selected2004 = {'asia','cat','jobs','mobi','tel','travel','xxx','post'}
        cohort = '2000' if tld in selected2000 else '2004' if tld in selected2004 else '2012' if '2012' in r['rounds'].split('|') else 'legacy'
        if r['classification_basis'].startswith('IANA country-code') or r['category_ids'] == 'territorial-code':
            cohort = 'cctld'
        return {'cohort': cohort, 'ianaRegistrationDate': r['iana_registration_date'] or None}
    measured = sorted((r for r in records if r['domains'] is not None), key=lambda r: (-r['domains'], r['tld']))
    top = [{'rank': i+1, 'tld': r['tld'], 'domains': r['domains'], 'zoneDate': meta['zone_data_date'], **annotate(r['tld'])} for i, r in enumerate(measured[:50])]
    web_source = json.loads((EVIDENCE/'w3techs-top50.json').read_text())
    web = [{**r, **annotate(r['tld'])} for r in web_source['rows']]
    for r in web:
        # Territorial codes are assigned outside ICANN application rounds.
        if len(r['tld']) == 2:
            r['cohort'] = 'cctld'
    backend_source = json.loads((EVIDENCE/'ntlddata-backends.json').read_text())
    backends = sorted(backend_source['data'], key=lambda r: (-r['tlds'], r['name']))
    unknown = backend_source['meta']['unattributed_tlds']
    assert sum(r['tlds'] for r in backends) + unknown == len(records)
    for r in backends:
        r['attributionKind'] = 'unnamed-infrastructure' if r['inferred'] else 'named-fingerprint'
        # This flag means unnamed auto-group upstream, not contractual verification.
        del r['inferred']
        del r['domains']
    groups = {}
    for key, rows in [('zones',top), ('web',web)]:
        groups[key] = [{'cohort': c, 'tlds': sum(r['cohort'] == c for r in rows),
                        'value': round(sum((r['domains'] if key == 'zones' else r['sharePercent']) for r in rows if r['cohort'] == c), 1)} for c in ('legacy','2000','2004','2012','cctld')]
    result = {'schemaVersion':1,'retrievedOn':'2026-10-19','zoneDate':meta['zone_data_date'],
              'webDate':web_source['sourceDate'],'scope':'all gTLDs in nTLDData snapshot; web survey also includes ccTLDs',
              'inventoryTLDs':len(records),'zoneMeasuredTLDs':len(measured),'missingZoneTLDs':len(records)-len(measured),
              'backends':backends,'unattributedTLDs':unknown,'groups':groups,'top50Zones':top,'top50Web':web,
              'sources':{'zones':'https://ntlddata.com/tld?scope=all','backends':'https://ntlddata.com/backend?scope=all',
                         'method':'https://ntlddata.com/methodology','web':web_source['source'],
                         'webMethod':'https://w3techs.com/technologies','cohorts':'https://compliance-reports.icann.org/compliance/complaints-by-tld.html', 'iana':'https://www.iana.org/domains/root/db'},
              'attribution':provenance['attribution'],'limitations':provenance['limitations']}
    outputs = {'data/tld_market_snapshot.json':json.dumps(result,ensure_ascii=False,indent=2)+'\n'}
    for name, rows in [('tld_top50_zone_domains.csv',top), ('tld_top50_website_share.csv',web), ('rsp_tld_footprint.csv',backends)]:
        target = io.StringIO(newline='')
        writer = csv.DictWriter(target,fieldnames=list(rows[0]),lineterminator='\n')
        writer.writeheader(); writer.writerows(rows)
        outputs['data/'+name] = target.getvalue()
    return outputs


if __name__ == '__main__':
    for name, text in derive().items():
        path = ROOT/name
        if '--check' in sys.argv:
            assert path.read_text() == text, 'Stale derived market data: '+name
        else:
            path.write_text(text,encoding='utf-8')
    print('TLD_MARKET_DATA_VERIFIED')
