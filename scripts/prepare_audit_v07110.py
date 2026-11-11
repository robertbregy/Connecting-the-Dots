#!/usr/bin/env python3
from __future__ import annotations
import json, os, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
VERSION="0.7.110"
DATE="2026-11-12"
BASELINE="5f1b3853bbbe9ff21f0c6bb689c1f23f96084a82"

def read(p): return (ROOT/p).read_text(encoding="utf-8")
def write(p,s): (ROOT/p).write_text(s,encoding="utf-8")
def load(p): return json.loads(read(p))
def dump(p,o): write(p,json.dumps(o,ensure_ascii=False,indent=2)+"\n")
def rep(p,a,b):
    s=read(p)
    if b in s and a not in s: return
    if s.count(a)!=1: raise SystemExit(f"{p}: expected one match for {a[:80]!r}, got {s.count(a)}")
    write(p,s.replace(a,b,1))

pkg=load("package.json"); pkg["version"]=VERSION; dump("package.json",pkg)
lock=load("package-lock.json"); lock["version"]=VERSION; lock["packages"][""]["version"]=VERSION; dump("package-lock.json",lock)
pub=load("publication.json")
pub.update({
  "version":VERSION,"releasedOn":DATE,
  "currentDataPackVersion":VERSION,
  "currentDataPackPath":f"downloads/connecting-the-dots-data-pack-v{VERSION}.zip",
  "editorialReviewPath":f"docs/editorial-review-{DATE}-v{VERSION}.json",
  "buildProvenanceCommit":os.environ.get("SOURCE_COMMIT",BASELINE)
})
dump("publication.json",pub)

# Once 0.7.110 becomes current, the published 0.7.109 data pack becomes an
# immutable historical package and must enter the frozen registry before build.
frozen=load("data/frozen_technical_packages.json")
frozen["recordedOn"]=DATE
frozen["files"]["downloads/connecting-the-dots-data-pack-v0.7.109.zip"]="be3b80a7cb0f1c712401e3596ed571211e901e8fd175545076a707fc0a4d6a0e"
dump("data/frozen_technical_packages.json",frozen)

hist=load("data/release_history.json")
for x in hist["releases"]:
    if x["version"]=="0.7.109": x["summaryKey"]="release07109"
if not any(x["version"]==VERSION for x in hist["releases"]):
    prev=next(x for x in hist["releases"] if x["version"]=="0.7.109")
    hist["releases"].insert(0,{"version":VERSION,"date":DATE,"summaryKey":"release07110",
      "ianaSnapshot":prev.get("ianaSnapshot"),"researchRelease":prev.get("researchRelease"),
      "ianaEvidenceSha256":prev.get("ianaEvidenceSha256")})
dump("data/release_history.json",hist)

tr=load("data/translations.json")
vals={
"en":{
"release07109":"Added a dedicated legal and procedural layer inside Conflicts & outcomes, separating formal objections, government input, standing, providers, appeals and Registry Voluntary Commitments from the historical case stories.",
"release07110":"Closed the post-Legal audit: corrected the remaining light-theme contrast defect, aligned release metadata and chronology, made source-health versioning dynamic, sharpened 2026 legal timing and terminology, and removed duplicated procedure from Disputed Dots while preserving all frozen research evidence.",
"disputesLegalBridgeTitle":"The procedure now lives in one place",
"disputesLegalBridgeBody":"Formal objections, standing, providers, deadlines and appeals are explained in Rights, objections & remedies. Disputed Dots stays focused on what happened in individual cases.",
"disputesLegalBridgeCta":"Read Rights, objections & remedies"},
"it":{
"release07109":"Aggiunto un livello legale e procedurale dedicato dentro Conflitti ed esiti, separando obiezioni formali, intervento governativo, standing, provider, appelli e Registry Voluntary Commitments dai casi storici.",
"release07110":"Chiuso l'audit successivo al capitolo Legal: corretto l'ultimo difetto di contrasto in tema chiaro, allineati metadati e cronologia delle release, resa dinamica la versione del source-health check, precisati tempi e termini legali 2026 e rimossa la duplicazione procedurale da Disputed Dots, senza toccare le evidenze di ricerca congelate.",
"disputesLegalBridgeTitle":"La procedura, in un solo posto",
"disputesLegalBridgeBody":"Obiezioni formali, standing, provider, scadenze e appelli sono spiegati in Diritti, obiezioni e rimedi. Disputed Dots resta concentrato su ciò che è successo nei singoli casi.",
"disputesLegalBridgeCta":"Leggi Diritti, obiezioni e rimedi"},
"de":{
"release07109":"Eine eigene rechtliche und verfahrensbezogene Ebene wurde in Konflikte & Ergebnisse ergänzt; formelle Einwände, staatliche Eingaben, Standing, Anbieter, Appeals und Registry Voluntary Commitments bleiben von den historischen Fallgeschichten getrennt.",
"release07110":"Das Audit nach dem Legal-Kapitel ist abgeschlossen: der verbleibende Kontrastfehler im hellen Design ist behoben, Release-Metadaten und Chronologie sind abgeglichen, die Version des Source-Health-Checks ist dynamisch, die Verfahrensfristen 2026 sind präzisiert und die doppelte Verfahrenserklärung wurde aus Disputed Dots entfernt, ohne eingefrorene Forschungsbelege zu verändern.",
"disputesLegalBridgeTitle":"Das Verfahren steht jetzt an einem Ort",
"disputesLegalBridgeBody":"Formelle Einwände, Standing, Anbieter, Fristen und Appeals werden unter Rechte, Einwände und Rechtsbehelfe erklärt. Disputed Dots konzentriert sich auf die einzelnen Fälle.",
"disputesLegalBridgeCta":"Rechte, Einwände und Rechtsbehelfe lesen"},
"fr":{
"release07109":"Une couche juridique et procédurale dédiée a été ajoutée dans Conflits et résultats, en séparant objections formelles, intervention gouvernementale, qualité pour agir, prestataires, recours et Registry Voluntary Commitments des récits de cas historiques.",
"release07110":"L'audit suivant le chapitre Legal est clos : le dernier défaut de contraste en thème clair est corrigé, les métadonnées et la chronologie des versions sont alignées, la version du contrôle de santé des sources est dynamique, les délais juridiques 2026 sont précisés et la procédure dupliquée a été retirée de Disputed Dots, sans modifier les preuves de recherche gelées.",
"disputesLegalBridgeTitle":"La procédure est désormais regroupée",
"disputesLegalBridgeBody":"Les objections formelles, la qualité pour agir, les prestataires, les délais et les recours sont expliqués dans Droits, objections et recours. Disputed Dots reste centré sur les cas individuels.",
"disputesLegalBridgeCta":"Lire Droits, objections et recours"}}
for lang,v in vals.items(): tr[lang].update(v)
dump("data/translations.json",tr)

rep("assets/style.css",
'.wordMark{font-size:14px;font-weight:850;letter-spacing:.12em;color:var(--accent);padding-top:4px}',
'.wordMark{font-size:14px;font-weight:850;letter-spacing:.12em;color:var(--accent-text);padding-top:4px}')

rep("scripts/check_external_sources.py",
'ROOT = Path(__file__).resolve().parents[1]\nUA = "Connecting-the-Dots-Source-Health/0.7.108 (+https://github.com/robertbregy/Connecting-the-Dots)"',
'ROOT = Path(__file__).resolve().parents[1]\nSITE_VERSION = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]\nUA = f"Connecting-the-Dots-Source-Health/{SITE_VERSION} (+https://github.com/robertbregy/Connecting-the-Dots)"')

rep("src/index.web.html",
'<div class="panel"><h2 data-i18n="disputesMechanismsTitle"></h2><p class="sub" data-i18n="disputesMechanismsSub"></p><div class="disputeMechanisms" id="disputeMechanisms"></div></div>',
'<div class="panel disputesLegalBridge"><h2 data-i18n="disputesLegalBridgeTitle"></h2><p class="sub" data-i18n="disputesLegalBridgeBody"></p><a class="control sectionLink" data-open-section="legal" href="#legal"><span data-i18n="disputesLegalBridgeCta"></span> →</a><span hidden aria-hidden="true" data-i18n="disputesMechanismsTitle"></span><span hidden aria-hidden="true" data-i18n="disputesMechanismsSub"></span></div>')

# Reader-first must follow the reviewed architecture: Disputed Dots links to
# the dedicated Legal chapter instead of requiring the retired mechanism grid.
rep("scripts/reader_first.cjs",
"    disputes: [':first', '#disputeGrid', '#disputeMechanisms'],",
"    disputes: [':first', '#disputeGrid', '.disputesLegalBridge'],")

legal=load("data/legal_layer.json")
legal["reviewedOn"]=DATE
legal["sources"]["independentObjectors"]="https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey/community-input/objections-and-appeals/independent-objectors"
legal["sources"]["singularPlural"]="https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey/string-evaluation/singular-plural-notifications-evaluation"
updates={
"en":{
"statusTitle":"2026 status · before String Confirmation Day",
"statusBody":"At this editorial review on 12 November 2026, ICANN lists String Confirmation Day for 17 November 2026. The initial objection window is 104 days after that milestone, but it is not the only clock: later 30-day windows can open after String Evaluation and for eligible .Brand String Change requests. The chapter describes the published procedure; it does not report objections that do not yet exist.",
"timingTitle":"The clocks that matter in 2026","timingIntro":"The objection framework is not one single deadline. The applicable window depends on the event and the ground.",
"timings":[
["Initial objection window","104 days following String Confirmation Day. All four formal objection grounds may be filed by parties with standing."],
["After String Evaluation","A 30-day window opens after updated contention sets are published; this later window is for String Confusion objections only."],
[".Brand String Change","A separate 30-day window may open after successful String Evaluation reports for eligible .Brand String Change requests; all four objection grounds may apply."],
["Independent Objectors","The three Independent Objectors share the initial opening date but receive seven additional days beyond the general public deadline, and may file only during the initial window."],
["Singular/plural notifications","Notifications may be submitted during the 30 days immediately following String Confirmation Day. An applicant affected by a validated determination has 21 days to challenge it under the clearly erroneous standard."]],
"glossaryTitle":"Five terms worth getting right","glossaryIntro":"The procedure becomes much easier to read once these terms stop being treated as interchangeable.",
"glossary":[
["Standing","The procedural entitlement to bring a specific objection. It depends on the objection ground; not everyone may file every type."],
["DRSP","Dispute Resolution Service Provider. The independent provider administering the relevant objection proceeding, including WIPO or ICC for the 2026 round."],
["Quick Look Review","An initial panel review used to identify an objection that is manifestly unfounded or an abuse of the right to object before the full proceeding continues."],
["Clearly erroneous","A limited review standard. A determination stands unless the reviewing body finds a qualifying factual or procedural error, including failure to follow procedure or consider necessary material evidence."],
["RVC","Registry Voluntary Commitment. A commitment proposed by an applicant that can become contractually binding if ICANN approves it and it is incorporated into the Registry Agreement."]]},
"it":{
"statusTitle":"Stato 2026 · prima dello String Confirmation Day",
"statusBody":"Alla verifica editoriale del 12 novembre 2026, ICANN indica lo String Confirmation Day per il 17 novembre 2026. La finestra iniziale per le obiezioni dura 104 giorni da quel momento, ma non è l'unico orologio: possono aprirsi successive finestre di 30 giorni dopo la String Evaluation e per richieste ammissibili di .Brand String Change. Il capitolo descrive la procedura pubblicata; non attribuisce obiezioni che ancora non esistono.",
"timingTitle":"Gli orologi che contano nel 2026","timingIntro":"Il sistema delle obiezioni non ha una sola scadenza. La finestra applicabile dipende dall'evento e dal motivo invocato.",
"timings":[
["Finestra iniziale per le obiezioni","104 giorni dopo lo String Confirmation Day. I soggetti con standing possono utilizzare tutti e quattro i motivi di obiezione formale."],
["Dopo la String Evaluation","Dopo la pubblicazione dei contention set aggiornati si apre una finestra di 30 giorni; questa finestra successiva riguarda soltanto le String Confusion Objections."],
[".Brand String Change","Per richieste ammissibili di .Brand String Change può aprirsi una finestra distinta di 30 giorni dopo i report di String Evaluation con esito positivo; possono applicarsi tutti e quattro i motivi."],
["Independent Objectors","I tre Independent Objectors partono con la finestra iniziale ma dispongono di sette giorni aggiuntivi rispetto alla scadenza del pubblico generale e possono presentare obiezioni soltanto nella finestra iniziale."],
["Segnalazioni singolare/plurale","Le segnalazioni possono essere presentate nei 30 giorni immediatamente successivi allo String Confirmation Day. Un candidato interessato da una determinazione validata ha 21 giorni per contestarla secondo lo standard clearly erroneous."]],
"glossaryTitle":"Cinque termini da usare bene","glossaryIntro":"La procedura diventa molto più leggibile quando questi concetti smettono di essere trattati come sinonimi.",
"glossary":[
["Standing","La legittimazione procedurale a presentare una specifica obiezione. Dipende dal motivo: non tutti possono presentare ogni tipo di obiezione."],
["DRSP","Dispute Resolution Service Provider. Il provider indipendente che amministra il procedimento di obiezione pertinente, tra cui WIPO o ICC nel round 2026."],
["Quick Look Review","Un controllo iniziale del panel per individuare obiezioni manifestamente infondate o abusive prima che il procedimento prosegua nel merito."],
["Clearly erroneous","Uno standard di riesame limitato. La determinazione resta ferma salvo un errore fattuale o procedurale qualificato, per esempio il mancato rispetto della procedura o la mancata considerazione di prove materiali necessarie."],
["RVC","Registry Voluntary Commitment. Un impegno proposto dal candidato che può diventare contrattualmente vincolante se approvato da ICANN e incorporato nel Registry Agreement."]]},
"de":{
"statusTitle":"Stand 2026 · vor dem String Confirmation Day",
"statusBody":"Zum Redaktionsstand vom 12. November 2026 nennt ICANN den 17. November 2026 als String Confirmation Day. Das erste Einwandsfenster läuft 104 Tage ab diesem Meilenstein, ist aber nicht die einzige Frist: Nach der String Evaluation und bei zulässigen .Brand String Change-Anträgen können weitere 30-Tage-Fenster folgen. Dieses Kapitel beschreibt das veröffentlichte Verfahren; es berichtet keine Einwände, die noch nicht existieren.",
"timingTitle":"Die Fristen, die 2026 zählen","timingIntro":"Das Einwandssystem kennt nicht nur eine Frist. Welches Fenster gilt, hängt vom Ereignis und vom Einwandsgrund ab.",
"timings":[
["Erstes Einwandsfenster","104 Tage nach dem String Confirmation Day. Parteien mit Standing können alle vier formellen Einwandsgründe nutzen."],
["Nach der String Evaluation","Nach Veröffentlichung aktualisierter Contention Sets öffnet sich ein 30-Tage-Fenster; dieses spätere Fenster gilt nur für String Confusion Objections."],
[".Brand String Change","Für zulässige .Brand String Change-Anträge kann nach erfolgreichen String-Evaluation-Berichten ein eigenes 30-Tage-Fenster öffnen; alle vier Einwandsgründe können anwendbar sein."],
["Independent Objectors","Die drei Independent Objectors starten gleichzeitig mit dem ersten Fenster, erhalten aber sieben zusätzliche Tage über die Frist der allgemeinen Öffentlichkeit hinaus und dürfen nur im ersten Fenster Einwände einreichen."],
["Singular-/Plural-Meldungen","Meldungen können in den 30 Tagen unmittelbar nach dem String Confirmation Day eingereicht werden. Ein von einer bestätigten Entscheidung betroffener Bewerber hat 21 Tage für eine Anfechtung nach dem clearly-erroneous-Standard."]],
"glossaryTitle":"Fünf Begriffe, die man sauber trennen sollte","glossaryIntro":"Das Verfahren wird deutlich verständlicher, wenn diese Begriffe nicht als austauschbar behandelt werden.",
"glossary":[
["Standing","Die verfahrensrechtliche Befugnis, einen bestimmten Einwand zu erheben. Sie hängt vom Einwandsgrund ab; nicht jede Partei kann jeden Einwand einreichen."],
["DRSP","Dispute Resolution Service Provider. Der unabhängige Anbieter, der das jeweilige Einwandsverfahren verwaltet, im 2026-Round unter anderem WIPO oder ICC."],
["Quick Look Review","Eine erste Panel-Prüfung, um offensichtlich unbegründete Einwände oder einen Missbrauch des Einwandsrechts zu erkennen, bevor das vollständige Verfahren weiterläuft."],
["Clearly erroneous","Ein begrenzter Prüfungsmaßstab. Eine Entscheidung bleibt bestehen, sofern kein qualifizierter Tatsachen- oder Verfahrensfehler vorliegt, etwa ein Verfahrensverstoß oder die Nichtberücksichtigung notwendiger wesentlicher Beweise."],
["RVC","Registry Voluntary Commitment. Eine vom Bewerber vorgeschlagene Verpflichtung, die vertraglich bindend werden kann, wenn ICANN sie genehmigt und in das Registry Agreement aufnimmt."]]},
"fr":{
"statusTitle":"État 2026 · avant le String Confirmation Day",
"statusBody":"À la revue éditoriale du 12 novembre 2026, l'ICANN indique le 17 novembre 2026 comme String Confirmation Day. La fenêtre initiale d'objections dure 104 jours après ce jalon, mais ce n'est pas le seul délai : d'autres fenêtres de 30 jours peuvent s'ouvrir après la String Evaluation et pour certaines demandes de .Brand String Change. Le chapitre décrit la procédure publiée ; il ne présente pas comme existantes des objections qui ne le sont pas encore.",
"timingTitle":"Les délais qui comptent en 2026","timingIntro":"Le régime des objections ne repose pas sur une échéance unique. La fenêtre applicable dépend de l'événement et du motif invoqué.",
"timings":[
["Fenêtre initiale d'objections","104 jours après le String Confirmation Day. Les parties ayant qualité pour agir peuvent utiliser les quatre motifs d'objection formelle."],
["Après la String Evaluation","Une fenêtre de 30 jours s'ouvre après la publication des contention sets mis à jour ; cette fenêtre ultérieure concerne uniquement les String Confusion Objections."],
[".Brand String Change","Pour les demandes de .Brand String Change admissibles, une fenêtre distincte de 30 jours peut s'ouvrir après des rapports de String Evaluation favorables ; les quatre motifs peuvent s'appliquer."],
["Independent Objectors","Les trois Independent Objectors commencent avec la fenêtre initiale mais disposent de sept jours supplémentaires après l'échéance applicable au public général et ne peuvent déposer que pendant cette fenêtre initiale."],
["Notifications singulier/pluriel","Les notifications peuvent être soumises pendant les 30 jours suivant immédiatement le String Confirmation Day. Un candidat concerné par une détermination validée dispose de 21 jours pour la contester selon le standard clearly erroneous."]],
"glossaryTitle":"Cinq termes à distinguer correctement","glossaryIntro":"La procédure devient beaucoup plus lisible lorsque ces notions cessent d'être traitées comme interchangeables.",
"glossary":[
["Standing","La qualité procédurale permettant de déposer une objection déterminée. Elle dépend du motif ; tout le monde ne peut pas déposer chaque type d'objection."],
["DRSP","Dispute Resolution Service Provider. Le prestataire indépendant qui administre la procédure d'objection concernée, notamment l'OMPI ou l'ICC pour le round 2026."],
["Quick Look Review","Un examen initial du panel destiné à identifier une objection manifestement infondée ou un abus du droit d'opposition avant la poursuite de la procédure complète."],
["Clearly erroneous","Un standard de réexamen limité. La détermination reste en vigueur sauf erreur factuelle ou procédurale qualifiée, par exemple si la procédure n'a pas été suivie ou si des preuves matérielles nécessaires n'ont pas été examinées."],
["RVC","Registry Voluntary Commitment. Un engagement proposé par le candidat qui peut devenir contractuellement contraignant s'il est approuvé par l'ICANN et incorporé au Registry Agreement."]]}}
for lang,v in updates.items(): legal["locales"][lang].update(v)
dump("data/legal_layer.json",legal)

r=read("scripts/render_legal_layer.py")
r=r.replace(
'''    process = "".join(
        f'<article class="step"><div class="n">{i:02d}</div><b>{e(title)}</b><p>{e(body)}</p></article>'
        for i, (title, body) in enumerate(L["process"], 1)
    )
    source_links = "".join([''',
'''    process = "".join(
        f'<article class="step"><div class="n">{i:02d}</div><b>{e(title)}</b><p>{e(body)}</p></article>'
        for i, (title, body) in enumerate(L["process"], 1)
    )
    timings = "".join('<article class="panel"><h3>'+e(a)+'</h3><p class="sub">'+e(b)+'</p></article>' for a,b in L["timings"])
    glossary = "".join('<article class="panel"><h3>'+e(a)+'</h3><p class="sub">'+e(b)+'</p></article>' for a,b in L["glossary"])
    source_links = "".join([''',1)
r=r.replace('        source_chip(S["rvc"], "ICANN · Registry Voluntary Commitments"),\n',
'        source_chip(S["rvc"], "ICANN · Registry Voluntary Commitments"),\n        source_chip(S["independentObjectors"], "ICANN · Independent Objectors"),\n        source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation"),\n',1)
r=r.replace('data-legal-layer="2026-11-11"','data-legal-layer="{e(DATA[\'reviewedOn\'])}"',1)
r=r.replace(
'''  {source_chip(S["icannCommunityInput"], "ICANN · Community Input & Objections")}
</div>
<div class="panel">
  <h2>{e(L["mapTitle"])}</h2>''',
'''  {source_chip(S["icannCommunityInput"], "ICANN · Community Input & Objections")}
</div>
<div class="panel">
  <h2>{e(L["timingTitle"])}</h2><p class="sub sectionLead">{e(L["timingIntro"])}</p><div class="grid2">{timings}</div>
  <div class="srcs">{source_chip(S["icannObjections"], "ICANN · Objections & Appeals")}{source_chip(S["independentObjectors"], "ICANN · Independent Objectors")}{source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation")}</div>
</div>
<div class="panel">
  <h2>{e(L["mapTitle"])}</h2>''',1)
r=r.replace(
'''  <div class="processGrid">{process}</div>
</div>
<div class="panel">
  <h2>{e(L["outcomesTitle"])}</h2>''',
'''  <div class="processGrid">{process}</div>
</div>
<div class="panel">
  <h2>{e(L["glossaryTitle"])}</h2><p class="sub sectionLead">{e(L["glossaryIntro"])}</p><div class="grid2">{glossary}</div>
</div>
<div class="panel">
  <h2>{e(L["outcomesTitle"])}</h2>''',1)
write("scripts/render_legal_layer.py",r)

readme=read("README.md")
readme=re.sub(r'^# Connecting the Dots — v\d+\.\d+\.\d+',f'# Connecting the Dots — v{VERSION}',readme,count=1)
readme=re.sub(r'^\*\*v0\.7\.109 · 11 November 2026\.\*\*.*?$',
'**v0.7.110 · 12 November 2026.** Closed the post-Legal audit with the remaining WCAG contrast correction, consistent release metadata and chronology, dynamic source-health versioning, precise 2026 objection clocks and terminology, and a cleaner boundary between Legal procedure and historical Disputed Dots cases. Frozen research evidence and prior archives remain unchanged.',
readme,count=1,flags=re.M)
a=readme.index("## Current release"); b=readme.index("## Previous homepage release",a)
block='''## Current release

**v0.7.110 - 12 November 2026**

Audit-close release before the 17 November String Confirmation milestone: fixes the remaining light-theme contrast defect, aligns public release metadata and chronology, makes source-health versioning follow the package automatically, sharpens the 2026 Legal timetable and glossary, and removes duplicated procedural exposition from Disputed Dots.

## Previous legal release

**v0.7.109 - 11 November 2026**

Added the dedicated Rights, objections & remedies layer inside Conflicts & outcomes, separating public and government input, formal objections, standing, WIPO/ICC proceedings, Independent Objectors, appeals and Registry Voluntary Commitments from the historical case layer.

## Previous audit release

**v0.7.108 - 10 November 2026**

The 10 November audit closed with explicit snapshot dates, consistent reading controls and metadata, repaired multilingual paths, clearer Economics navigation and direct discovery of the .meow story and Reader Study.

## Previous Economics reading release

**v0.7.107 - 9 November 2026**

The long Economics dossier was split into a shorter introduction plus four complete reading paths: market/adoption, economic cases, portfolios/contention and the economics of the 2026 round. Existing evidence, metrics, charts, sources and filters remain available at dedicated routes.

'''
write("README.md",readme[:a]+block+readme[b:])

ch=read("CHANGELOG.md")
if not ch.startswith("# v0.7.110"):
    ch='''# v0.7.110 — 12 November 2026

- Closed the post-v0.7.109 audit before the String Confirmation milestone.
- Fixed the remaining light-theme WCAG contrast defect in the closed-generic word mark.
- Corrected release-history semantics and restored v0.7.107 to the human-readable chronology.
- Made the source-health User-Agent derive from package metadata.
- Clarified the 2026 objection clocks, Independent Objector extension and singular/plural timing.
- Added a concise glossary for standing, DRSP, Quick Look Review, clearly erroneous and RVC.
- Replaced duplicated procedure in Disputed Dots with a direct bridge to the Legal chapter.
- APS/IANA snapshots, RR1/RR2 and earlier technical archives remain unchanged.

'''+ch
if "# v0.7.107" not in ch:
    p=ch.index("# v0.7.106")
    ch=ch[:p]+'''# v0.7.107 — 9 November 2026

- Reworked the long Economics landing chapter into a concise introduction and four complete reading paths.
- Preserved the evidence, cases, tables, metrics, rankings, charts, sources and historical fragments at dedicated routes.

'''+ch[p:]
write("CHANGELOG.md",ch)

rc=read("scripts/release_check.py")
anchor='''readme=(ROOT/'README.md').read_text(encoding='utf-8')
if "No live refresh occurs in a visitor's browser." in readme: fail('README contains obsolete no-live-refresh claim')
'''
extra=anchor+'''
if not changelog.lstrip().startswith(f'# v{version}'): fail('CHANGELOG latest heading does not match package version')
m=re.search(r'## Current release\\s+\\*\\*v(\\d+\\.\\d+\\.\\d+)',readme,re.S)
if not m or m.group(1)!=version: fail('README Current release does not match package version')
for recent in ('0.7.107','0.7.108','0.7.109',version):
    if f'v{recent}' not in changelog or f'v{recent}' not in readme: fail('Recent release chronology missing: v'+recent)
style_text=(ROOT/'assets'/'style.css').read_text(encoding='utf-8')
wm=re.search(r'\\.wordMark\\{[^}]*\\}',style_text)
if not wm or 'color:var(--accent-text)' not in wm.group(0): fail('Audited wordMark contrast correction missing')
health=(ROOT/'scripts'/'check_external_sources.py').read_text(encoding='utf-8')
if 'SITE_VERSION = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]' not in health: fail('Source-health version must derive from package metadata')
if re.search(r'Source-Health/0\\.7\\.\\d+',health): fail('Source-health checker still hard-codes a release')
if 'id="disputeMechanisms"' in source_html: fail('Disputed Dots still duplicates Legal procedure')
for token in ('disputesLegalBridgeTitle','disputesLegalBridgeBody','data-open-section="legal"'):
    if token not in source_html: fail('Disputed Dots Legal bridge missing: '+token)
legal_layer=json_file('legal_layer.json')
for language in LANGS:
    loc=legal_layer.get('locales',{}).get(language,{})
    if len(loc.get('timings',[]))!=5 or len(loc.get('glossary',[]))!=5: fail('Legal timing/glossary incomplete: '+language)
'''
if extra not in rc: rc=rc.replace(anchor,extra,1)
old='''latest_summary=history[0].get('summaryKey')
if not latest_summary or any(not translations.get(lang,{}).get(latest_summary) for lang in LANGS): fail('latest release-history summary translation missing')
'''
new=old+'''for item in history[:4]:
    patch=int(item['version'].split('.')[-1])
    if patch>=100 and item.get('summaryKey')!=f'release07{patch}': fail('Recent release history uses a non-release summary key: '+item['version'])
    if any(not translations.get(lang,{}).get(item.get('summaryKey','')) for lang in LANGS): fail('Recent release summary translation missing: '+item['version'])
'''
if new not in rc: rc=rc.replace(old,new,1)
write("scripts/release_check.py",rc)

print(json.dumps({"prepared":VERSION,"date":DATE,"researchChanged":False,"archivesChanged":False}))
