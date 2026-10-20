"""Publish the unperformed formative-study protocol, without collecting responses."""
from pathlib import Path
from html import escape as h
import json

ROOT = Path(__file__).resolve().parents[1]

def render():
    publication = json.loads((ROOT/'publication.json').read_text())
    materials = json.loads((ROOT/'data/independent_review_materials.json').read_text())
    study = materials['readerStudy']
    assert materials['humanParticipants'] == study['observedParticipants'] == 0
    for lang in ('it', 'en', 'de', 'fr'):
        t = study['locales'][lang]
        folder = ROOT/'research/reader-study'/lang
        folder.mkdir(parents=True, exist_ok=True)
        languages = ''.join(f'<a href="../{code}/" lang="{code}" hreflang="{code}"'+(' aria-current="page"' if code == lang else '')+f'>{code.upper()}</a>' for code in ('it','en','de','fr'))
        before = ''.join(f'<li>{h(text)}</li>' for text in t['before'])
        phases = ''.join(f'<li><h3>{h(title)}</h3><p>{h(body)}</p></li>' for title, body in t['phases'])
        tasks = ''.join(f'<li>{h(text)}</li>' for text in study['tasks'][lang])
        criteria = ''.join(f'<li>{h(text)}</li>' for text in t['criteria'])
        notes = ''.join(f'<div class="note"><h3>{h(label)}</h3><div class="blank" aria-hidden="true"></div></div>' for label in t['columns'])
        html = f'''<!DOCTYPE html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{h(t['lead'], quote=True)}"><title>{h(t['title'])} · Connecting the Dots</title>
<link rel="canonical" href="{publication['deployment']}research/reader-study/{lang}/">
<style>
:root{{color-scheme:light;font-family:system-ui,sans-serif;color:#172029;background:#f5f6f8}}*{{box-sizing:border-box}}body{{margin:0}}header,main,footer{{width:min(920px,100%);margin:auto;padding:24px}}a{{color:#064b96;text-underline-offset:3px;overflow-wrap:anywhere}}a:focus-visible,summary:focus-visible{{outline:3px solid #825a00;outline-offset:4px}}header{{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}}nav{{display:flex;gap:8px}}nav a{{padding:9px 12px;border:1px solid #b8c0c8;border-radius:7px}}nav a[aria-current]{{font-weight:750;background:#e2e9f1}}main{{padding-top:6px}}h1{{font-size:clamp(30px,5vw,44px);line-height:1.12;letter-spacing:-.025em}}h2{{font-size:25px;margin-top:0}}h3{{font-size:18px}}p,li{{line-height:1.65}}li{{margin:12px 0}}.lead{{font-size:19px}}.status{{border-left:4px solid #14569a;padding:14px 18px;background:#e5eef8;font-weight:650}}section,details{{padding:24px;border:1px solid #c5cbd2;border-radius:12px;background:white;margin:22px 0}}summary{{cursor:pointer;font-weight:700;font-size:21px}}.meta{{color:#44515e;font-size:14px}}.links{{display:flex;gap:18px;flex-wrap:wrap}}.note h3{{font-size:16px}}.blank{{height:90px;border-bottom:1px solid #9ba6b1}}.download{{display:inline-block;padding:12px 18px;border:1px solid #175898;border-radius:8px;font-weight:650}}footer{{line-height:1.6}}@media(max-width:600px){{header,main,footer{{padding:18px}}section,details{{padding:18px}}ol,ul{{padding-left:21px}}nav a{{padding:8px 10px}}}}@media print{{:root{{background:white;color:black}}header nav,.download,.links{{display:none}}header,main,footer{{width:100%;padding:0}}body{{margin:15mm;font-size:11pt}}h1{{font-size:23pt}}h2{{font-size:17pt}}section,details{{padding:12pt;border:1px solid #888;break-inside:auto}}.phases li,.note{{break-inside:avoid}}.blank{{height:60pt}}a{{color:black}}}}
</style></head><body><header><a href="../../../{lang}/">Connecting the Dots</a><nav aria-label="IT / EN / DE / FR">{languages}</nav></header>
<main><h1>{h(t['title'])}</h1><p class="lead">{h(t['lead'])}</p><p class="meta">{h(t['metadata'])} · v{h(publication['version'])}</p><p class="status">{h(t['status'])} {h(t['observed'])}</p><p>{h(t['plan'])}</p>
<p class="links"><a href="../../../{lang}/?tab=overview#three-minute-guide">{h(t['home'])} →</a><a href="../../../{lang}/?tab=research#reader-study-protocol">{h(t['research'])} →</a></p>
<section><h2>{h(t['beforeTitle'])}</h2><ol>{before}</ol></section>
<section class="phases"><h2>{h(t['phasesTitle'])}</h2><ol>{phases}</ol></section>
<section><h2>{h(t['tasksTitle'])}</h2><p>{h(t['taskNote'])}</p><ol>{tasks}</ol></section>
<section class="observation"><h2>{h(t['notesTitle'])}</h2><p>{h(t['notesHelp'])}</p><a class="download" href="../../../data/reader_observations_blank.csv" download>{h(t['download'])}</a>{notes}<p>{h(t['print'])}</p></section>
<details><summary>{h(t['criteriaTitle'])}</summary><ul>{criteria}</ul></details>
</main><footer>Connecting the Dots · v{h(publication['version'])} · {h(t['metadata'])}</footer></body></html>
'''
        (folder/'index.html').write_text(html, encoding='utf-8')
    print('READER_STUDY_MATERIALS_READY languages=4 observedParticipants=0 noResults=true')

if __name__ == '__main__':
    render()
