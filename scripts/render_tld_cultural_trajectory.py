#!/usr/bin/env python3
"""Render source-backed fees, cultural history and corpus coverage in native chapters."""
from __future__ import annotations

import csv
import json
import re
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from scripts.render_cultural_sensitivity import render as render_sensitivity


LANGS = ('en', 'it', 'de', 'fr')
BASE = 'https://robertbregy.github.io/Connecting-the-Dots/'
CATEGORY_LABELS = {
 'technology':('Technology','Tecnologia','Technologie','Technologie'),
 'commerce':('Commerce & finance','Commercio e finanza','Handel und Finanzen','Commerce et finance'),
 'professions':('Professions & services','Professioni e servizi','Berufe und Dienstleistungen','Professions et services'),
 'culture':('Culture, media & education','Cultura, media e istruzione','Kultur, Medien und Bildung','Culture, médias et éducation'),
 'lifestyle':('Lifestyle, mobility & leisure','Stili di vita, mobilità e tempo libero','Lebensstil, Mobilität und Freizeit','Modes de vie, mobilité et loisirs'),
 'health':('Health','Salute','Gesundheit','Santé'),
 'community':('Society, identity & community','Società, identità e comunità','Gesellschaft, Identität und Gemeinschaft','Société, identité et communauté'),
 'geography':('Places & territories','Luoghi e territori','Orte und Gebiete','Lieux et territoires'),
 'brand':('Brand designation (APS 2026)','Marchio: designazione APS 2026','Markenkennzeichnung (APS 2026)','Marque : désignation APS 2026'),
 'institutions':('Institutions & public interest','Istituzioni e interesse pubblico','Institutionen und öffentliches Interesse','Institutions et intérêt public'),
 'territorial-code':('Territorial codes','Codici territoriali','Ländercodes','Codes territoriaux'),
}
TEXT = {
 'it': {
  'eyebrow':'Nomi, società e accesso', 'fact':'Fatto documentato', 'reading':'Lettura interpretativa',
  'review':'Ricerca verificata il 19 ottobre 2026', 'sources':'Fonti', 'initial':'Raccolta iniziale, circa',
  'feeNotes':'Perimetro e fonti di ciascun round', 'homeTitle':'La storia che portiamo dopo il punto',
  'homeBody':'I nomi di Internet raccontano istituzioni, mercati, appartenenze e aspettative. Segui la loro traiettoria e scopri quanto costava proporre un nuovo TLD.',
  'historyLink':'Leggi la traiettoria', 'feesLink':'Confronta le fee', 'patternsLink':'Esplora i pattern',
  'patternsTitle':'Dal censimento dei nomi ai pattern',
  'patternsIntro':'L’analisi considera ogni stringa presente nei corpus archiviati del progetto. La copertura dell’inventario e quella della classificazione sono misure distinte: un nome senza tema assegnato resta nel denominatore. I totali generali includono anche codici territoriali e designazioni ufficiali di marchio; il confronto fra round conta separatamente i temi editoriali.',
  'strings':'Stringhe distinte', 'classified':'Con almeno una categoria', 'unclassified':'Senza categoria assegnata',
  'round':'Round', 'coverage':'Copertura della classificazione', 'category':'Categoria', 'all':'Tutti',
  'search':'Cerca un nome', 'results':'risultati', 'limit':'Prime 60 corrispondenze. Il CSV contiene tutti i record e la provenienza.',
  'corpusDownload':'Scarica il censimento e le classificazioni', 'summaryDownload':'Scarica conteggi e metodo',
  'method':'Metodo e limiti',
  'methodBody':'Si contano stringhe distinte, non domande: più candidati per lo stesso nome non ne aumentano il peso. Le categorie possono sovrapporsi. I temi descrivono il nome, non il settore del candidato o l’impatto sulla società. I campi ufficiali di marchio, comunità e geografia del 2026 non vengono retroproiettati sui round precedenti. Sostituzioni e domande di sole varianti sono conservate nel censimento ma escluse dal confronto principale del 2026. Un’assenza di classificazione non equivale all’assenza del fenomeno.',
  'scope':'Corpus locali datati; non un elenco universale di ogni nome mai proposto. Le domande 2026 esprimono intenzioni e non provano una futura delega o un utilizzo.',
  'socialTitle':'Appartenenze che cambiano nel tempo',
  'socialBody':'Lingue, comunità, città e marchi convivono nel DNS. Per leggerne il significato sociale occorre distinguere chi propone un nome, chi lo può usare e chi lo usa davvero. Il confronto storico collega questi livelli senza equipararli.',
  'name':'Nome', 'rounds':'Round nel corpus', 'noJS':'L’elenco filtrabile richiede JavaScript; il censimento completo è disponibile nel CSV.',
 },
 'en': {
  'eyebrow':'Names, society and access', 'fact':'Documented fact', 'reading':'Interpretation',
  'review':'Research reviewed on 19 October 2026', 'sources':'Sources', 'initial':'Initial collections, about',
  'feeNotes':'Scope and sources for each round', 'homeTitle':'The history we carry after the dot',
  'homeBody':'Internet names tell stories of institutions, markets, belonging and expectations. Follow their trajectory and discover what it cost to propose a new TLD.',
  'historyLink':'Read the trajectory', 'feesLink':'Compare application fees', 'patternsLink':'Explore the patterns',
  'patternsTitle':'From a name census to patterns',
  'patternsIntro':'The analysis includes every string in the project’s archived corpora. Inventory coverage and classification coverage are separate measures: names without an assigned theme remain in the denominator. The overall totals also include territorial codes and official brand designations; the round comparison counts editorial themes separately.',
  'strings':'Distinct strings', 'classified':'With at least one category', 'unclassified':'Without an assigned category',
  'round':'Round', 'coverage':'Classification coverage', 'category':'Category', 'all':'All',
  'search':'Search a name', 'results':'results', 'limit':'First 60 matches. The CSV contains every record and its provenance.',
  'corpusDownload':'Download the census and classifications', 'summaryDownload':'Download counts and method',
  'method':'Method and limits',
  'methodBody':'Counts use distinct strings, not applications: competing applicants do not increase a name’s weight. Categories may overlap. Themes describe the string, not the applicant’s industry or social impact. Official 2026 brand, community and geographic fields are not projected backwards onto previous rounds. Replacement records and variant-only applications are retained in the census but excluded from the main 2026 comparison. Missing classification is not evidence that a phenomenon is absent.',
  'scope':'Dated local corpora, not a universal list of every name ever proposed. The 2026 applications express intentions and do not establish future delegation or use.',
  'socialTitle':'Belonging changes over time',
  'socialBody':'Languages, communities, cities and brands coexist in the DNS. Understanding their social meaning requires separating who proposes a name, who may use it and who actually does. The historical comparison connects these levels without treating them as equivalent.',
  'name':'Name', 'rounds':'Rounds in the corpus', 'noJS':'The filterable list requires JavaScript; the complete census is available in the CSV.',
 },
 'de': {
  'eyebrow':'Namen, Gesellschaft und Zugang', 'fact':'Dokumentierte Tatsache', 'reading':'Interpretation',
  'review':'Recherche geprüft am 19. Oktober 2026', 'sources':'Quellen', 'initial':'Anfängliche Einnahmen, rund',
  'feeNotes':'Abgrenzung und Quellen der einzelnen Runden', 'homeTitle':'Die Geschichte hinter dem Punkt',
  'homeBody':'Internetnamen erzählen von Institutionen, Märkten, Zugehörigkeit und Erwartungen. Verfolge ihre Entwicklung und erfahre, was ein Antrag für eine neue TLD kostete.',
  'historyLink':'Die Entwicklung lesen', 'feesLink':'Antragsgebühren vergleichen', 'patternsLink':'Muster erkunden',
  'patternsTitle':'Vom Namensinventar zu Mustern',
  'patternsIntro':'Die Analyse umfasst jede Zeichenfolge in den archivierten Korpora des Projekts. Inventar- und Klassifikationsabdeckung sind getrennte Grössen: Namen ohne zugeordnetes Thema bleiben im Nenner. Die Gesamtzahlen umfassen auch Ländercodes und offizielle Markenkennzeichnungen; der Rundenvergleich zählt redaktionelle Themen getrennt.',
  'strings':'Unterschiedliche Zeichenfolgen', 'classified':'Mit mindestens einer Kategorie', 'unclassified':'Ohne zugeordnete Kategorie',
  'round':'Runde', 'coverage':'Klassifikationsabdeckung', 'category':'Kategorie', 'all':'Alle',
  'search':'Namen suchen', 'results':'Ergebnisse', 'limit':'Die ersten 60 Treffer. Die CSV enthält alle Datensätze und ihre Herkunft.',
  'corpusDownload':'Inventar und Klassifikationen herunterladen', 'summaryDownload':'Zählungen und Methode herunterladen',
  'method':'Methode und Grenzen',
  'methodBody':'Gezählt werden unterschiedliche Zeichenfolgen, nicht Anträge: Mehrere Bewerber erhöhen das Gewicht eines Namens nicht. Kategorien können sich überschneiden. Themen beschreiben den Namen, nicht die Branche des Bewerbers oder gesellschaftliche Wirkung. Offizielle Marken-, Gemeinschafts- und Geografiefelder von 2026 werden nicht auf frühere Runden übertragen. Ersatznamen und reine Variantenanträge bleiben im Inventar, sind aber vom Hauptvergleich 2026 ausgeschlossen. Eine fehlende Klassifikation beweist nicht das Fehlen eines Phänomens.',
  'scope':'Datierte lokale Korpora, kein universelles Verzeichnis aller jemals vorgeschlagenen Namen. Anträge von 2026 zeigen Absichten, belegen aber keine spätere Delegierung oder Nutzung.',
  'socialTitle':'Zugehörigkeit verändert sich',
  'socialBody':'Sprachen, Gemeinschaften, Städte und Marken bestehen im DNS nebeneinander. Für ihre gesellschaftliche Bedeutung muss unterschieden werden, wer einen Namen vorschlägt, wer ihn nutzen darf und wer ihn tatsächlich nutzt. Der historische Vergleich verbindet diese Ebenen, ohne sie gleichzusetzen.',
  'name':'Name', 'rounds':'Runden im Korpus', 'noJS':'Die filterbare Liste benötigt JavaScript; das vollständige Inventar steht als CSV bereit.',
 },
 'fr': {
  'eyebrow':'Noms, société et accès', 'fact':'Fait documenté', 'reading':'Interprétation',
  'review':'Recherche vérifiée le 19 octobre 2026', 'sources':'Sources', 'initial':'Encaissements initiaux, environ',
  'feeNotes':'Périmètre et sources de chaque cycle', 'homeTitle':'L’histoire que nous portons après le point',
  'homeBody':'Les noms d’Internet racontent institutions, marchés, appartenances et attentes. Suivez leur trajectoire et découvrez ce que coûtait une candidature pour un nouveau TLD.',
  'historyLink':'Lire la trajectoire', 'feesLink':'Comparer les frais', 'patternsLink':'Explorer les tendances',
  'patternsTitle':'Du recensement des noms aux tendances',
  'patternsIntro':'L’analyse inclut chaque chaîne des corpus archivés du projet. La couverture de l’inventaire et celle de la classification sont deux mesures distinctes : les noms sans thème attribué restent dans le dénominateur. Les totaux généraux incluent aussi les codes territoriaux et les désignations officielles de marque ; le comparatif des cycles compte séparément les thèmes éditoriaux.',
  'strings':'Chaînes distinctes', 'classified':'Avec au moins une catégorie', 'unclassified':'Sans catégorie attribuée',
  'round':'Cycle', 'coverage':'Couverture de la classification', 'category':'Catégorie', 'all':'Tous',
  'search':'Rechercher un nom', 'results':'résultats', 'limit':'Les 60 premières correspondances. Le CSV contient tous les enregistrements et leur provenance.',
  'corpusDownload':'Télécharger le recensement et les classifications', 'summaryDownload':'Télécharger les décomptes et la méthode',
  'method':'Méthode et limites',
  'methodBody':'Le décompte porte sur les chaînes distinctes, pas sur les candidatures : plusieurs candidats n’augmentent pas le poids d’un nom. Les catégories peuvent se chevaucher. Les thèmes décrivent le nom, pas le secteur du candidat ou son impact social. Les champs officiels de marque, communauté et géographie de 2026 ne sont pas projetés sur les cycles précédents. Les remplacements et candidatures de variantes seules sont conservés dans le recensement, mais exclus du principal comparatif 2026. Une classification absente ne prouve pas l’absence du phénomène.',
  'scope':'Corpus locaux datés, et non liste universelle de tous les noms jamais proposés. Les candidatures de 2026 expriment des intentions et ne prouvent ni délégation future ni usage.',
  'socialTitle':'Des appartenances qui évoluent',
  'socialBody':'Langues, communautés, villes et marques coexistent dans le DNS. Comprendre leur portée sociale demande de distinguer qui propose un nom, qui peut l’utiliser et qui l’utilise réellement. La comparaison historique relie ces niveaux sans les confondre.',
  'name':'Nom', 'rounds':'Cycles dans le corpus', 'noJS':'La liste filtrable nécessite JavaScript ; le recensement complet est disponible en CSV.',
 },
}

CSS = '''<style id="tld-cultural-style">
.tldResearch{scroll-margin-top:110px;min-width:0}.tldResearch p{line-height:1.7;overflow-wrap:anywhere}
.tldResearch h2,.tldResearch h3{overflow-wrap:anywhere;line-height:1.3}.tldResearch .tldLinks{display:flex;flex-wrap:wrap;gap:10px 18px;margin:16px 0}
.tldResearch .tldSources{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:13px;margin:12px 0}.tldSources a{overflow-wrap:anywhere}
.tldResearch details{border:1px solid var(--border);border-radius:12px;padding:14px;margin:18px 0}.tldResearch summary{font-weight:700;cursor:pointer;line-height:1.5}
.tldResearch .tldTable{overflow:auto;max-width:100%;margin:18px 0;border:1px solid var(--border);border-radius:12px}
.tldResearch table{width:100%;border-collapse:collapse;font-size:14px}.tldResearch th,.tldResearch td{padding:12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--border);white-space:normal;overflow-wrap:anywhere}
.tldResearch th{background:var(--surface2);font-weight:700}.tldResearch tbody th{text-transform:none;letter-spacing:normal;color:var(--text)}
#round-application-fees table{min-width:0}
.tldResearch .tldAmount{display:block;font-weight:700;font-variant-numeric:tabular-nums}.tldResearch .tldBasis{display:block;font-size:12px;margin-top:6px;color:var(--muted)}
.tldStages{padding-left:20px;border-left:2px solid var(--border);margin:26px 0}.tldStage{position:relative;padding:0 0 28px 8px}.tldStage:last-child{padding-bottom:0}.tldStage:before{content:"";position:absolute;width:10px;height:10px;left:-26px;top:7px;border-radius:50%;background:var(--accent-text)}
.tldStage .tldPeriod{color:var(--muted);font-size:13px;font-weight:700}.tldStage h3{margin:7px 0 12px}.tldReading{border-left:3px solid var(--accent-text);padding:10px 14px;background:var(--surface2)}
.tldStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:20px 0}.tldStat{padding:14px;border:1px solid var(--border);border-radius:12px}.tldStat strong{display:block;font-size:25px}.tldStat span{display:block;font-size:13px;color:var(--muted)}
.tldControls{display:grid;grid-template-columns:2fr 1fr 1.5fr;gap:12px;margin:18px 0}.tldControls label{display:block;font-size:13px;font-weight:700}.tldControls input,.tldControls select{display:block;width:100%;margin-top:6px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--surface2);color:var(--text);font:inherit;min-width:0}
.culturalSensitivity{margin:28px 0;scroll-margin-top:155px}.culturalSensitivity h4{font-size:17px;line-height:1.5}.culturalSensitivity caption{text-align:left;padding:12px;font-weight:650}.culturalSensitivity table{table-layout:fixed;min-width:0!important}.culturalSensitivity th:first-child{width:38%}
.tldResearch a:focus-visible,.tldResearch summary:focus-visible,.tldResearch [tabindex]:focus-visible,.tldControls input:focus-visible,.tldControls select:focus-visible{outline:2px solid var(--accent-text);outline-offset:4px}
@media(max-width:720px){.tldControls{grid-template-columns:1fr}.tldStats{grid-template-columns:1fr}.tldResearch th,.tldResearch td{padding:9px 7px;font-size:12px}.tldStages{padding-left:16px}.tldStage:before{left:-22px}#round-application-fees table{table-layout:fixed}#round-application-fees th:nth-child(1){width:18%;white-space:nowrap}#round-application-fees th:nth-child(2){width:28%}#round-application-fees th:nth-child(3){width:18%}#round-application-fees th:nth-child(4){width:36%}}
@media(max-width:720px){.culturalSensitivity{scroll-margin-top:190px}.culturalSensitivity th,.culturalSensitivity td{font-size:13px;line-height:1.5}}
</style>'''


def h(value) -> str:
    return escape(str(value), quote=True)


def number(value, lang: str) -> str:
    return format(value, ',').replace(',', {'en':',','it':'’','de':'’','fr':'\u202f'}[lang])


def refs(data: dict, keys: list[str], lang: str) -> str:
    return '<div class="tldSources" aria-label="'+h(TEXT[lang]['sources'])+'">'+''.join(
        '<a href="'+h(data['sources'][key]['url'])+'" target="_blank" rel="noopener noreferrer">'+h(data['sources'][key]['label'])+' ↗</a>' for key in keys)+'</div>'


def panel(identifier: str, title: str, body: str, lang: str) -> str:
    return '<div class="panel tldResearch" id="'+identifier+'" data-tld-research="'+identifier+'"><p class="eyebrow">'+h(TEXT[lang]['eyebrow'])+'</p><h2>'+h(title)+'</h2>'+body+'<p class="small">'+h(TEXT[lang]['review'])+'</p></div>'


def link(lang: str, section: str, anchor: str, label: str) -> str:
    return '<a class="sourceChip" data-open-section="'+section+'" data-open-anchor="'+anchor+'" href="'+BASE+lang+'/?tab='+section+'#'+anchor+'">'+h(label)+' →</a>'


def fees(data: dict, lang: str) -> str:
    t, u = data['locales'][lang], TEXT[lang]
    rows = []
    for row in data['rounds']:
        amount = row['collected'] if row['collected'] is not None else row['reconstructed']
        label = u['initial'] if row['collectedKind']=='documented-initial' else (t['documentedLabel'] if row['collected'] is not None else t['reconstructedLabel'])
        collected = ('<span class="tldAmount">US$ '+number(amount,lang)+'</span><span class="tldBasis">'+h(label)+'</span>') if amount is not None else h(t['unknown'])
        if row.get('reconstructionApplications'):
            collected += '<span class="tldBasis">'+str(row['reconstructionApplications'])+' × US$ '+number(row['fee'],lang)+'</span>'
        rows.append('<tr data-fee-round="'+str(row['round'])+'"><th scope="row">'+str(row['round'])+'</th><td><span class="tldAmount">US$ '+number(row['fee'],lang)+'</span></td><td>'+number(row['applications'],lang)+'</td><td>'+collected+'</td></tr>')
    body = '<p class="sectionLead">'+h(t['intro'])+'</p><div class="tldTable" tabindex="0" role="region" aria-label="'+h(t['title'])+'"><table><thead><tr>'+''.join('<th scope="col">'+h(x)+'</th>' for x in t['columns'])+'</tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'
    body += '<details><summary>'+h(u['feeNotes'])+'</summary>'+''.join('<h3>'+str(row['round'])+'</h3><p>'+h(t['notes'][str(row['round'])])+'</p>'+refs(data,row['sources'],lang) for row in data['rounds'])+'</details>'
    body += '<h3>'+h(t['methodTitle'])+'</h3><p>'+h(t['methodBody'])+'</p><p class="tldReading">'+h(t['auctionNote'])+'</p><div class="tldLinks"><a class="sourceChip" href="'+BASE+'data/round_application_fees.json" download>'+h(t['download'])+' ↓</a>'+link(lang,'timeline','tld-cultural-trajectory',u['historyLink'])+'</div>'
    return panel('round-application-fees',t['title'],body,lang)


def history(data: dict, lang: str) -> str:
    t,u = data['locales'][lang],TEXT[lang]
    body = '<p class="sectionLead">'+h(t['intro'])+'</p><div class="tldStages">'
    for stage in t['stages']:
        body += '<article class="tldStage" data-cultural-stage="'+h(stage['id'])+'"><p class="tldPeriod">'+h(stage['period'])+'</p><h3>'+h(stage['title'])+'</h3><p><b>'+h(u['fact'])+'.</b> '+h(stage['fact'])+'</p><p class="tldReading"><b>'+h(u['reading'])+'.</b> '+h(stage['reading'])+'</p>'+refs(data,stage['sources'],lang)+'</article>'
    body += '</div><p>'+h(t['closing'])+'</p><details><summary>'+h(t['methodTitle'])+'</summary><p>'+h(t['methodBody'])+'</p></details><div class="tldLinks">'+link(lang,'timeline','tld-cultural-patterns',u['patternsLink'])+link(lang,'economics','round-application-fees',u['feesLink'])+'</div>'
    return panel('tld-cultural-trajectory',t['title'],body,lang)


def patterns(data: dict, corpus: list, lang: str) -> str:
    t = TEXT[lang]
    counts = data['counts']
    research_scope = {'it': 'Analisi corrente, non inclusa negli snapshot scientifici RR1/RR2.', 'en': 'Current working analysis, not included in the RR1/RR2 scientific snapshots.', 'de': 'Aktuelle Arbeitsanalyse, nicht in den wissenschaftlichen Snapshots RR1/RR2 enthalten.', 'fr': 'Analyse de travail actuelle, non incluse dans les instantanés scientifiques RR1/RR2.'}[lang]
    body = '<p>'+h(t['patternsIntro'])+'</p><div class="tldStats">'+''.join('<div class="tldStat"><strong>'+number(counts[key],lang)+'</strong><span>'+h(t[key])+'</span></div>' for key in ('strings','classified','unclassified'))+'</div>'
    semantic_labels = {
      'en':('With a semantic theme','Without a semantic theme','Proposed themes under the current editorial rules','Percentages use every distinct primary string in the round. These are rule-dependent results of a partial, present-day classification; they do not measure adoption or society as a whole.'),
      'it':('Con un tema semantico','Senza tema semantico','Temi proposti secondo le regole editoriali attuali','Le percentuali usano tutte le stringhe primarie distinte del round. Sono risultati dipendenti dalle regole di una classificazione attuale e parziale; non misurano l’adozione o l’intera società.'),
      'de':('Mit semantischem Thema','Ohne semantisches Thema','Vorgeschlagene Themen nach den heutigen redaktionellen Regeln','Die Prozentwerte beziehen sich auf alle unterschiedlichen primären Zeichenfolgen der Runde. Es sind regelabhängige Ergebnisse einer heutigen, unvollständigen Klassifikation; sie messen weder Nutzung noch die gesamte Gesellschaft.'),
      'fr':('Avec un thème sémantique','Sans thème sémantique','Thèmes proposés selon les règles éditoriales actuelles','Les pourcentages portent sur toutes les chaînes primaires distinctes du cycle. Ces résultats dépendent des règles d’une classification actuelle et partielle ; ils ne mesurent ni l’adoption ni l’ensemble de la société.'),
    }[lang]
    body += '<div class="tldTable" tabindex="0" role="region" aria-label="'+h(t['coverage'])+'"><table><thead><tr>'+''.join('<th scope="col">'+h(x)+'</th>' for x in (t['round'],t['strings'],semantic_labels[0],semantic_labels[1]))+'</tr></thead><tbody>'
    for row in data['rounds']:
        body += '<tr><th scope="row">'+h(row['round'])+'</th>'+''.join('<td>'+number(value,lang)+'</td>' for value in (row['strings'],row['semantic_classified'],row['strings']-row['semantic_classified']))+'</tr>'
    body += '</tbody></table></div><p class="small">'+h(t['scope']+' '+research_scope)+'</p>'
    cats = [c for c in data['categories'] if c['id']!='unclassified']
    labels = {c['id']:CATEGORY_LABELS[c['id']][LANGS.index(lang)] for c in cats}
    body += render_sensitivity(data,lang,labels,number)
    rounds=[r for r in data['rounds'] if r['round']!='legacy']
    body += '<h3>'+h(semantic_labels[2])+'</h3><p>'+h(semantic_labels[3])+'</p><div class="tldTable" tabindex="0" role="region" aria-label="'+h(semantic_labels[2])+'"><table><thead><tr><th scope="col">'+h(t['category'])+'</th>'+''.join('<th scope="col">'+h(r['round'])+'<br>n = '+number(r['strings'],lang)+'</th>' for r in rounds)+'</tr></thead><tbody>'
    for cat in data['comparableCategoryIds']:
        body += '<tr><th scope="row">'+h(labels[cat])+'</th>'
        for r in rounds:
            n=r['categories'][cat];pct=f"{100*n/r['strings']:.1f}".replace('.',',' if lang!='en' else '.')
            body += '<td>'+number(n,lang)+'<span class="tldBasis">'+pct+'%</span></td>'
        body += '</tr>'
    body += '</tbody></table></div>'
    body += '<div class="tldControls"><label>'+h(t['search'])+'<input id="tld-cultural-search" type="search" autocomplete="off"></label><label>'+h(t['round'])+'<select id="tld-cultural-round"><option value="">'+h(t['all'])+'</option>'+''.join('<option>'+h(r['round'])+'</option>' for r in data['rounds'])+'</select></label><label>'+h(t['category'])+'<select id="tld-cultural-category"><option value="">'+h(t['all'])+'</option>'+''.join('<option value="'+h(c['id'])+'">'+h(labels[c['id']])+'</option>' for c in cats)+'<option value="__unclassified">'+h(t['unclassified'])+'</option></select></label></div><p id="tld-cultural-results" aria-live="polite"></p><div class="tldTable"><table><thead><tr>'+''.join('<th scope="col">'+h(x)+'</th>' for x in (t['name'],t['rounds'],t['category']))+'</tr></thead><tbody id="tld-cultural-records"></tbody></table></div><p class="small">'+h(t['limit'])+'</p><noscript><p>'+h(t['noJS'])+'</p></noscript>'
    body += '<details><summary>'+h(t['method'])+'</summary><p>'+h(t['methodBody'])+'</p><p>'+h(t['scope'])+'</p></details><div class="tldLinks"><a class="sourceChip" href="'+BASE+'data/tld_cultural_corpus.csv" download>'+h(t['corpusDownload'])+' ↓</a><a class="sourceChip" href="'+BASE+'data/tld_cultural_patterns.json" download>'+h(t['summaryDownload'])+' ↓</a></div>'
    payload = {'records':[[r['display_string'],r['comparable_rounds'],r['category_ids'],r['ascii_string'],r['rounds']] for r in corpus], 'labels':labels,'results':t['results'],'unknown':t['unclassified'],'lang':lang}
    body += '<script type="application/json" id="tld-cultural-data">'+json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+'</script><script src="'+BASE+'assets/tld-cultural.js" defer></script>'
    return panel('tld-cultural-patterns',t['patternsTitle'],body,lang)


class FirstPanelEnd(HTMLParser):
    def __init__(self, text: str, section: str):
        super().__init__(convert_charrefs=False)
        self.offsets=[0]+[m.end() for m in re.finditer('\n',text)]
        self.section=section; self.active=False; self.depth=0; self.end=None
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='section' and attrs.get('id')==self.section:self.active=True
        if self.active and tag=='div' and self.end is None:
            if self.depth:self.depth+=1
            elif 'panel' in attrs.get('class','').split():self.depth=1
    def handle_endtag(self,tag):
        if self.active and tag=='div' and self.depth:
            self.depth-=1
            if not self.depth:
                line,col=self.getpos();self.end=self.offsets[line-1]+col+len('</div>');self.active=False


def after_intro(text: str, section: str, body: str) -> str:
    p=FirstPanelEnd(text,section)
    if p.end is None:raise ValueError('Missing chapter intro: '+section)
    return text[:p.end]+'\n'+body+text[p.end:]


def render(root: Path) -> None:
    fee=json.loads((root/'data/round_application_fees.json').read_text())
    editorial=json.loads((root/'data/tld_cultural_editorial.json').read_text())
    summary=json.loads((root/'data/tld_cultural_patterns.json').read_text())
    with (root/'data/tld_cultural_corpus.csv').open(encoding='utf-8-sig',newline='') as file:corpus=list(csv.DictReader(file))
    for data in (fee,editorial):
        if set(data['locales'])!=set(LANGS):raise ValueError('All four research translations required')
    if len(corpus)!=summary['counts']['strings']:raise ValueError('Cultural corpus denominator mismatch')
    for lang,path in [('en',root/'index.html')]+[(l,root/l/'index.html') for l in LANGS]:
        text=path.read_text()
        if 'id="tld-cultural-style"' in text:raise ValueError('Cultural research already rendered')
        t=TEXT[lang]
        text=after_intro(text,'economics',fees(fee,lang))
        text=after_intro(text,'timeline',history(editorial,lang)+patterns(summary,corpus,lang))
        text=after_intro(text,'social',panel('tld-cultural-social',t['socialTitle'],'<p>'+h(t['socialBody'])+'</p><div class="tldLinks">'+link(lang,'timeline','tld-cultural-trajectory',t['historyLink'])+'</div>',lang))
        text=after_intro(text,'overview',panel('tld-cultural-home',t['homeTitle'],'<p>'+h(t['homeBody'])+'</p><div class="tldLinks">'+link(lang,'timeline','tld-cultural-trajectory',t['historyLink'])+link(lang,'economics','round-application-fees',t['feesLink'])+'</div>',lang))
        text=text.replace('</head>',CSS+'</head>',1)
        prefix='' if path==root/'index.html' else '../'
        for resource in ('data/round_application_fees.json','data/tld_cultural_corpus.csv','data/tld_cultural_patterns.json','data/cultural_lexicon_v2.json','data/cultural_sensitivity_v2.json','data/cultural_classification_protocol_v2.json','data/cultural_lexicon_review_queue_v2.csv','assets/tld-cultural.js'):
            text=text.replace(BASE+resource,prefix+resource)
        path.write_text(text,encoding='utf-8')
    print('TLD_CULTURAL_RESEARCH_OK',json.dumps({'strings':len(corpus),'languages':list(LANGS),'feeRounds':len(fee['rounds'])}))
