#!/usr/bin/env python3
"""Source-backed city-domain analysis, native to existing chapters.

No network calls, runtime fetches, new primary menu entries or research-release
rewrites. English root and four localized pages are generated deterministically.
"""
from __future__ import annotations

import hashlib
import json
import re
from html import escape
from html.parser import HTMLParser
from pathlib import Path

LANGS = ('en', 'it', 'de', 'fr')
BASE = 'https://robertbregy.github.io/Connecting-the-Dots/'
DATA = 'data/city_namespace_editorial.json'
CSS = '''<style id="city-namespace-style">
.cityNamespace{scroll-margin-top:110px;min-width:0}
.cityNamespace h2{line-height:1.2;overflow-wrap:anywhere}
.cityNamespace h3{line-height:1.3;margin:0 0 10px;overflow-wrap:anywhere}
.cityNamespace p{line-height:1.65;overflow-wrap:anywhere}
.cityNamespace .citynsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:20px 0;align-items:start}
.cityNamespace .citynsCard{min-width:0;padding:18px;border:1px solid var(--border);border-radius:13px;background:var(--surface2)}
.cityNamespace .citynsCard p:last-child{margin-bottom:0}
.cityNamespace .citynsStatus{display:inline-block;max-width:100%;padding:6px 10px;margin:0 0 14px;border:1px solid var(--border);border-radius:10px;color:var(--muted);font-size:13px;line-height:1.5}
.cityNamespace .citynsSources{display:flex;flex-wrap:wrap;gap:8px 14px;margin:12px 0 0;font-size:13px;line-height:1.5}
.cityNamespace .citynsSources a{overflow-wrap:anywhere;text-underline-offset:3px}
.cityNamespace .citynsCallout{padding:14px 16px;margin:18px 0;border-left:3px solid var(--accent-text);background:var(--surface2);color:var(--text)}
.cityNamespace .citynsTableWrap{max-width:100%;overflow-x:auto;border:1px solid var(--border);border-radius:10px;margin:14px 0}
.cityNamespace table{width:100%;border-collapse:collapse;font-size:14px;table-layout:fixed}
.cityNamespace th,.cityNamespace td{padding:10px 12px;text-align:left;vertical-align:top;white-space:normal;overflow-wrap:anywhere;border-bottom:1px solid var(--border)}
.cityNamespace th{font-weight:700;background:var(--surface2)}
.cityNamespace tbody th{text-transform:none;letter-spacing:normal;color:var(--text)}
.cityNamespace td:last-child,.cityNamespace th:last-child{text-align:right;font-variant-numeric:tabular-nums}
.cityNamespace details{margin:20px 0 4px;padding:14px 16px;border:1px solid var(--border);border-radius:12px}
.cityNamespace summary{cursor:pointer;font-weight:700;line-height:1.45;overflow-wrap:anywhere}
.cityNamespace a:focus-visible,.cityNamespace summary:focus-visible,.cityNamespace [tabindex="0"]:focus-visible{outline:2px solid var(--accent-text);outline-offset:4px}
@media(max-width:720px){.cityNamespace .citynsGrid{grid-template-columns:1fr}.cityNamespace .citynsCard{padding:15px}.cityNamespace details{padding:12px}.cityNamespace th,.cityNamespace td{padding:9px 6px;font-size:12px}}
</style>'''


def load(root: Path) -> dict:
    data = json.loads((root / DATA).read_text(encoding='utf-8'))
    if data.get('schemaVersion') != 1 or data.get('reviewedOn') != '2026-10-17':
        raise ValueError('City-domain analysis needs a versioned editorial date')
    if set(data['locales']) != set(LANGS):
        raise ValueError('All four city-domain analysis translations required')
    reference = set(data['locales']['en'])
    for lang, values in data['locales'].items():
        if set(values) != reference:
            raise ValueError('Different city-domain translation keys: ' + lang)
        def nonempty(value):
            if isinstance(value, str):
                return bool(value.strip()) and '<script' not in value.lower()
            if isinstance(value, dict):
                return all(nonempty(v) for v in value.values())
            if isinstance(value, list):
                return bool(value) and all(nonempty(v) for v in value)
            return False
        if not all(nonempty(v) for v in values.values()):
            raise ValueError('Empty or unsafe editorial translation: ' + lang)
        if any(len(values[k]) != n for k, n in [('models',4),('cases',4),('metrics',4),('phases',3),('columns',4)]):
            raise ValueError('Incomplete comparative model: ' + lang)
    expected = [('.cat',114800,80.0),('.tokyo',92900,50.8),('.nyc',58500,91.0),('.berlin',43400,92.3),('.london',34900,82.2),('.bayern',28000,96.9),('.paris',18500,85.5),('.amsterdam',18200,84.8)]
    if [(r[0],r[2],r[3]) for r in data['benchmark']['rows']] != expected:
        raise ValueError('Reported benchmark changed without source review')
    for source in data['sources'].values():
        if not source.get('kind') or not source.get('label') or not source.get('url','').startswith('https://'):
            raise ValueError('Unattributed source')
    return data


def h(value: str) -> str:
    return escape(str(value), quote=True)


def refs(data: dict, keys: list[str], label: str) -> str:
    links = []
    for key in keys:
        source = data['sources'][key]
        links.append('<a data-city-source="'+h(key)+'" data-source-class="'+h(source['kind'])+'" href="'+h(source['url'])+'" target="_blank" rel="noopener noreferrer">'+h(source['label'])+' ↗</a>')
    return '<div class="citynsSources" aria-label="'+h(label)+'">'+''.join(links)+'</div>'


def panel(identifier: str, title: str, body: str, t: dict, status: str = '') -> str:
    tag = '<span class="citynsStatus">'+h(status)+'</span>' if status else ''
    return ('<div class="panel cityNamespace" id="'+identifier+'" data-city-namespace="'+identifier+'">'
            '<p class="eyebrow">'+h(t['eyebrow'])+'</p><h2>'+h(title)+'</h2>'+tag+body+
            '<p class="small">'+h(t['review'])+'</p></div>')


def paragraph(text: str, cls: str = '') -> str:
    return '<p'+(' class="'+cls+'"' if cls else '')+'>'+h(text)+'</p>'


def cards(rows: list) -> str:
    return '<div class="citynsGrid">'+''.join('<article class="citynsCard"><h3>'+h(row[0])+'</h3>'+''.join(paragraph(p) for p in row[1:])+'</article>' for row in rows)+'</div>'


def jump(lang: str, section: str, anchor: str, text: str) -> str:
    return ('<a class="sourceChip" data-open-section="'+section+'" data-open-anchor="'+anchor+'" href="'+
            BASE+lang+'/?tab='+section+'#'+anchor+'">'+h(text)+' →</a>')


def cities(data: dict, lang: str) -> str:
    t = data['locales'][lang]
    body = paragraph(t['governanceIntro'])+cards(t['models'])+'<h3>'+h(t['comparisonTitle'])+'</h3><div class="citynsGrid">'
    for row, sources in zip(t['cases'], [['lugano','aps'],['bremen'],['paris'],['nyc']]):
        body += '<article class="citynsCard"><h3>'+h(row[0])+'</h3>'+paragraph(row[1])+refs(data,sources,t['sources'])+'</article>'
    body += '</div>'+paragraph(t['governanceQuestion'],'citynsCallout')
    governance = panel('city-namespace-governance',t['governanceTitle'],body,t,t['reading'])
    body = paragraph(t['metricsIntro'])+cards(t['metrics'])
    body += '<details class="citynsBenchmark"><summary>'+h(t['benchmarkTitle'])+'</summary>'+paragraph(t['benchmarkNote'])
    body += '<div class="citynsTableWrap" tabindex="0" role="region" aria-label="'+h(t['benchmarkTitle'])+'"><table><thead><tr>'+''.join('<th scope="col">'+h(x)+'</th>' for x in t['columns'])+'</tr></thead><tbody>'
    thousands = {'en':',','it':'’','de':'’','fr':'\u202f'}[lang]
    for domain, kind, size, renewal in data['benchmark']['rows']:
        number = format(size,',').replace(',',thousands)
        rate = f'{renewal:.1f}'.replace('.',',' if lang in ('it','de','fr') else '.')+'%'
        body += '<tr><th scope="row">'+h(domain)+'</th><td>'+h(t['categories'][kind])+'</td><td>'+h(number)+'</td><td>'+h(rate)+'</td></tr>'
    body += '</tbody></table></div>'+paragraph(t['methodNote'])+refs(data,['renewals','dnib'],t['sources'])+'</details>'
    body += jump(lang,'cemetery','helsinki-termination',t['cemeteryLink'])
    return governance+panel('city-namespace-measures',t['metricsTitle'],body,t,t['proposal'])


def lugano(data: dict, lang: str) -> str:
    t=data['locales'][lang]
    fact=paragraph(t['luganoIntro'])+'<h3>'+h(t['factsTitle'])+'</h3>'+paragraph(t['factsBody'])+refs(data,['lugano','aps'],t['sources'])
    common='<h3>'+h(t['commonsTitle'])+'</h3>'+paragraph(t['commonsBody'])+jump(lang,'cities','city-namespace-governance',t['compareLink'])
    first=panel('lugano-public-commons',t['luganoTitle'],fact+'<p class="citynsStatus">'+h(t['proposal'])+'</p>'+common,t)
    trust=paragraph(t['trustBody'])+paragraph(t['distinction'],'citynsCallout')+refs(data,['dnssec'],t['sources'])
    second=panel('lugano-verifiable-services',t['trustTitle'],trust,t,t['proposal'])
    stages=cards(t['phases'])+paragraph(t['compatibility'])+refs(data,['local','ua'],t['sources'])+'<h3>'+h(t['openTitle'])+'</h3>'+paragraph(t['openBody'])+refs(data,['lugano','prereg'],t['sources'])
    third=panel('lugano-use-before-scale',t['adoptionTitle'],stages,t,t['proposal'])
    reception=paragraph(t['receptionBody'])+refs(data,['media'],t['sources'])+paragraph(t['receptionCorrection'],'citynsCallout')+refs(data,['lugano','prereg'],t['sources'])
    fourth=panel('lugano-external-reading',t['receptionTitle'],reception,t,t['reading'])
    return first+second+third+fourth


def field_note(data: dict, lang: str) -> str:
    t=data['locales'][lang]
    return panel('city-domain-reception-note',t['notesTitle'],paragraph(t['notesBody'])+jump(lang,'lugano','lugano-external-reading',t['notesLink']),t,t['reading'])


class SectionEnd(HTMLParser):
    def __init__(self, text: str, target: str):
        super().__init__(convert_charrefs=False)
        self.offsets=[0]
        for m in re.finditer('\n',text):
            self.offsets.append(m.end())
        self.target=target
        self.depth=0
        self.active=False
        self.ends=[]
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        if tag=='section':
            if not self.active and dict(attrs).get('id')==self.target:
                self.active=True
                self.depth=1
            elif self.active:
                self.depth+=1
    def handle_endtag(self,tag):
        if tag=='section' and self.active:
            self.depth-=1
            if self.depth==0:
                line,column=self.getpos()
                self.ends.append(self.offsets[line-1]+column)
                self.active=False


def insert_section(text: str, target: str, body: str) -> str:
    parser=SectionEnd(text,target)
    if len(parser.ends)!=1:
        raise ValueError('Expected one native section: '+target)
    pos=parser.ends[0]
    return text[:pos]+body+'\n'+text[pos:]


def render(root: Path) -> None:
    root=Path(root)
    data=load(root)
    pub=json.loads((root/'publication.json').read_text(encoding='utf-8'))
    if data['reviewedOn']>pub['releasedOn']:
        raise ValueError('Editorial content postdates the technical publication')
    for lang,path in [('en',root/'index.html')]+[(l,root/l/'index.html') for l in LANGS]:
        text=path.read_text(encoding='utf-8')
        if 'id="city-namespace-style"' in text or 'data-city-namespace=' in text:
            raise ValueError('City-domain content was already rendered')
        original=text
        text=insert_section(text,'cities',cities(data,lang))
        text=insert_section(text,'lugano',lugano(data,lang))
        text=insert_section(text,'behind-round',field_note(data,lang))
        if text.count('</head>')!=1:
            raise ValueError('Missing document head')
        text=text.replace('</head>',CSS+'</head>',1)
        if text.count('data-city-namespace=')!=7:
            raise ValueError('Incomplete native city-domain analysis')
        path.write_text(text,encoding='utf-8')
    for lang in LANGS:
        path=root/'behind-the-round'/lang/'index.html'
        text=path.read_text(encoding='utf-8')
        if text.count('</main>')!=1 or 'id="city-namespace-style"' in text:
            raise ValueError('Unexpected standalone Field Notes layout')
        text=text.replace('</main>',field_note(data,lang)+'</main>',1).replace('</head>',CSS+'</head>',1)
        path.write_text(text,encoding='utf-8')
    print('CITY_NAMESPACE_EDITORIAL_OK',json.dumps({'languages':list(LANGS),'nativePages':5,'fieldNotePages':4,'newCanonicalRoutes':0,'reviewedOn':data['reviewedOn'],'evidenceSHA256':hashlib.sha256((root/DATA).read_bytes()).hexdigest()}))


if __name__=='__main__':
    render(Path(__file__).resolve().parents[1])
