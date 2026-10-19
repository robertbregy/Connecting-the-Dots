#!/usr/bin/env python3
"""Publish market reach and technical concentration in the existing chapters."""
import json
import re
from pathlib import Path
from .render_tld_cultural_trajectory import h, number, link, after_intro, BASE

TEXT = {
 'it': {
  'title':'Quanto sono diffusi i TLD?', 'intro':'Due misure rispondono a due domande diverse: quali estensioni compaiono nei siti web e quali gTLD contengono più domini delegati. Cambiando vista puoi confrontarne l’origine.',
  'web':'Presenza nei siti web', 'zones':'Domini nei gTLD', 'origin':'Origine', 'all':'Tutte le origini', 'search':'Cerca un TLD', 'tld':'TLD', 'rank':'Posizione', 'date':'Registrazione IANA',
  'webMetric':'Quota dei siti osservati', 'zoneMetric':'Domini nella zona DNS', 'count':'TLD nei primi 50', 'weight':'Domini nei primi 50', 'weightShare':'dei domini di questa top 50',
  'webScope':'W3Techs · 18 ottobre 2026. Siti con contenuti o funzioni rilevanti, inclusi i ccTLD. La fonte pubblica percentuali arrotondate: non permette di ricavare quanti siti esistano in assoluto. L’ordine segue la fonte; quote uguali non dimostrano un primato.',
  'zoneScope':'nTLDData · zone DNS del 18 ottobre 2026. Conteggi dei nomi delegati, non dei siti attivi. Il confronto comprende i gTLD osservati; i ccTLD sono esclusi. I domini registrati senza delega DNS possono mancare.',
  'reading':'La diffusione segue più storie: le estensioni originarie conservano un peso elevato, i codici territoriali radicano il web nei paesi e il round 2012 moltiplica le specializzazioni. L’origine di un TLD non prova, da sola, il successo del relativo round.',
  'cohortNote':'“Origine” indica il round che ha selezionato l’estensione, non l’anno di apertura al pubblico. I ccTLD seguono percorsi territoriali, senza round ICANN. Le domande 2026 non sono ancora TLD operativi e restano fuori da queste classifiche.',
  'coverage':'Copertura dei conteggi DNS', 'unknown':'non misurati', 'method':'Fonti, metodo e dati scaricabili', 'current':'Analisi corrente del 19 ottobre 2026, esterna agli snapshot scientifici RR1/RR2.',
  'history':'Collega diffusione e storia', 'geo':'Chi gestisce l’infrastruttura', 'ranking':'Confronta la diffusione', 'results':'TLD visibili',
  'rspTitle':'Quanti TLD serve ogni piattaforma?', 'rspMode':'TLD per RSP', 'rspUnit':'gTLD attribuiti', 'rspProvider':'Piattaforma / RSP', 'rspKind':'Tipo di attribuzione', 'named':'Impronta associata a un operatore', 'unnamed':'Infrastruttura condivisa, operatore non verificato', 'unattributed':'Senza attribuzione',
  'rspIntro':'Il conteggio misura l’ampiezza delle piattaforme tecniche nei gTLD censiti. Non conta i domini registrati, la proprietà delle estensioni o gli RSP valutati per il 2026.',
  'rspNote':'Attribuzioni ricostruite da nTLDData tramite nameserver della root, endpoint RDAP e DNS inverso. Anche un operatore nominato è un’attribuzione tecnica, non una verifica del contratto RSP. Il perimetro esclude i ccTLD; i totali aziendali dichiarati possono quindi differire.',
  'rspMap':'La vista TLD per RSP mostra la concentrazione per piattaforma, senza assegnare al conteggio una posizione geografica. La tabella riporta anche i gruppi senza un operatore verificato e i TLD senza attribuzione.',
  'rspDetails':'Tutti i conteggi e i limiti', 'rspSum':'gTLD nel perimetro', 'rspAuto':'Gruppi infrastrutturali senza operatore verificato', 'csv':'Scarica CSV', 'provenance':'Provenienza e impronte delle fonti',
  'labels':{'legacy':'gTLD originari','2000':'Round 2000','2004':'Round 2004','2012':'Round 2012','cctld':'ccTLD · senza round ICANN'}
 },
 'en': {
  'title':'How widespread are TLDs?', 'intro':'Two measures answer different questions: which extensions appear on websites, and which gTLDs contain the most delegated domains. Switch views to compare their origins.',
  'web':'Website presence', 'zones':'Domains in gTLDs', 'origin':'Origin', 'all':'All origins', 'search':'Find a TLD', 'tld':'TLD', 'rank':'Position', 'date':'IANA registration',
  'webMetric':'Share of surveyed websites', 'zoneMetric':'Domains in the DNS zone', 'count':'TLDs in the top 50', 'weight':'Domains in the top 50', 'weightShare':'of domains in this top 50',
  'webScope':'W3Techs · 18 October 2026. Websites with relevant content or functionality, including ccTLDs. The source publishes rounded percentages, which cannot establish absolute website totals. Source order is retained; equal shares do not establish a unique rank.',
  'zoneScope':'nTLDData · DNS zones dated 18 October 2026. Counts of delegated names, not active websites. This comparison covers observed gTLDs and excludes ccTLDs. Registered domains without DNS delegation may be missing.',
  'reading':'Adoption follows several histories: original extensions retain considerable weight, country codes anchor the web in territories, and the 2012 round multiplies specialisations. A TLD’s origin alone does not establish its round’s success.',
  'cohortNote':'Origin identifies the round that selected the extension, not its public launch year. ccTLDs follow territorial processes outside ICANN application rounds. The 2026 applications are not operational TLDs and are excluded.',
  'coverage':'DNS count coverage', 'unknown':'unmeasured', 'method':'Sources, method and downloadable data', 'current':'Current working analysis dated 19 October 2026, outside the RR1/RR2 scientific snapshots.',
  'history':'Connect adoption and history', 'geo':'Who runs the infrastructure', 'ranking':'Compare adoption', 'results':'TLDs shown',
  'rspTitle':'How many TLDs does each platform serve?', 'rspMode':'TLDs per RSP', 'rspUnit':'attributed gTLDs', 'rspProvider':'Platform / RSP', 'rspKind':'Attribution type', 'named':'Fingerprint associated with an operator', 'unnamed':'Shared infrastructure, operator unverified', 'unattributed':'Unattributed',
  'rspIntro':'This count measures the breadth of technical platforms across the gTLD inventory. It does not count domain registrations, ownership of extensions or RSPs evaluated for 2026.',
  'rspNote':'nTLDData infers attribution from root nameservers, RDAP endpoints and reverse DNS. Even named operators are technical attributions, not verified RSP contracts. ccTLDs are excluded, so companies’ self-reported totals may differ.',
  'rspMap':'The TLDs per RSP view charts concentration by platform without assigning the count a geographic location. The table also includes groups without a verified operator and unattributed TLDs.',
  'rspDetails':'All counts and limitations', 'rspSum':'gTLDs in scope', 'rspAuto':'Infrastructure groups without a verified operator', 'csv':'Download CSV', 'provenance':'Source provenance and fingerprints',
  'labels':{'legacy':'Original gTLDs','2000':'2000 round','2004':'2004 round','2012':'2012 round','cctld':'ccTLD · no ICANN round'}
 },
 'de': {
  'title':'Wie verbreitet sind TLDs?', 'intro':'Zwei Kennzahlen beantworten verschiedene Fragen: Welche Endungen erscheinen auf Websites, und welche gTLDs enthalten die meisten delegierten Domains? Vergleiche ihre Herkunft in beiden Ansichten.',
  'web':'Präsenz auf Websites', 'zones':'Domains unter gTLDs', 'origin':'Herkunft', 'all':'Alle Ursprünge', 'search':'TLD suchen', 'tld':'TLD', 'rank':'Position', 'date':'IANA-Registrierung',
  'webMetric':'Anteil der untersuchten Websites', 'zoneMetric':'Domains in der DNS-Zone', 'count':'TLDs unter den ersten 50', 'weight':'Domains unter den ersten 50', 'weightShare':'der Domains dieser Top 50',
  'webScope':'W3Techs · 18. Oktober 2026. Websites mit relevanten Inhalten oder Funktionen, einschliesslich ccTLDs. Die Quelle veröffentlicht gerundete Prozentwerte, aus denen keine absolute Websitezahl ableitbar ist. Die Quellenreihenfolge bleibt erhalten; gleiche Anteile belegen keinen eindeutigen Rang.',
  'zoneScope':'nTLDData · DNS-Zonen vom 18. Oktober 2026. Gezählt werden delegierte Namen, keine aktiven Websites. Der Vergleich umfasst beobachtete gTLDs und schliesst ccTLDs aus. Registrierte Domains ohne DNS-Delegierung können fehlen.',
  'reading':'Die Verbreitung folgt mehreren Entwicklungen: Ursprüngliche Endungen behalten erhebliches Gewicht, Ländercodes verankern das Web territorial und die Runde 2012 vervielfacht Spezialisierungen. Die Herkunft einer TLD allein belegt nicht den Erfolg ihrer Runde.',
  'cohortNote':'Herkunft bezeichnet die Auswahlrunde, nicht das Jahr des öffentlichen Starts. ccTLDs folgen territorialen Verfahren ausserhalb der ICANN-Antragsrunden. Anträge von 2026 sind noch keine betriebenen TLDs und bleiben ausgeschlossen.',
  'coverage':'Abdeckung der DNS-Zählung', 'unknown':'nicht gemessen', 'method':'Quellen, Methode und Downloads', 'current':'Aktuelle Arbeitsanalyse vom 19. Oktober 2026, ausserhalb der wissenschaftlichen Snapshots RR1/RR2.',
  'history':'Verbreitung und Geschichte verbinden', 'geo':'Wer die Infrastruktur betreibt', 'ranking':'Verbreitung vergleichen', 'results':'angezeigte TLDs',
  'rspTitle':'Wie viele TLDs betreut jede Plattform?', 'rspMode':'TLDs pro RSP', 'rspUnit':'zugeordnete gTLDs', 'rspProvider':'Plattform / RSP', 'rspKind':'Art der Zuordnung', 'named':'Mit einem Betreiber verbundenes Muster', 'unnamed':'Gemeinsame Infrastruktur, Betreiber ungeprüft', 'unattributed':'Ohne Zuordnung',
  'rspIntro':'Die Zählung misst die Breite technischer Plattformen im gTLD-Inventar. Sie zählt weder Domainregistrierungen noch Eigentum an Endungen oder für 2026 geprüfte RSPs.',
  'rspNote':'nTLDData leitet Zuordnungen aus Root-Nameservern, RDAP-Endpunkten und Reverse-DNS ab. Auch benannte Betreiber sind technische Zuordnungen, keine geprüften RSP-Verträge. ccTLDs fehlen; Unternehmensangaben können daher abweichen.',
  'rspMap':'Die Ansicht TLDs pro RSP zeigt die Konzentration nach Plattform, ohne die Zahlen geografisch zu verorten. Die Tabelle enthält auch Gruppen ohne geprüften Betreiber und nicht zugeordnete TLDs.',
  'rspDetails':'Alle Zählungen und Grenzen', 'rspSum':'gTLDs im erfassten Bereich', 'rspAuto':'Infrastrukturgruppen ohne geprüften Betreiber', 'csv':'CSV herunterladen', 'provenance':'Quellenherkunft und Prüfsummen',
  'labels':{'legacy':'Ursprüngliche gTLDs','2000':'Runde 2000','2004':'Runde 2004','2012':'Runde 2012','cctld':'ccTLD · keine ICANN-Runde'}
 },
 'fr': {
  'title':'Quelle est la diffusion des TLD ?', 'intro':'Deux mesures répondent à deux questions : quelles extensions apparaissent sur les sites web et quels gTLD contiennent le plus de domaines délégués ? Comparez leurs origines en changeant de vue.',
  'web':'Présence sur les sites web', 'zones':'Domaines sous les gTLD', 'origin':'Origine', 'all':'Toutes les origines', 'search':'Chercher un TLD', 'tld':'TLD', 'rank':'Position', 'date':'Enregistrement IANA',
  'webMetric':'Part des sites observés', 'zoneMetric':'Domaines dans la zone DNS', 'count':'TLD parmi les 50 premiers', 'weight':'Domaines parmi les 50 premiers', 'weightShare':'des domaines de ce top 50',
  'webScope':'W3Techs · 18 octobre 2026. Sites au contenu ou aux fonctions pertinents, ccTLD compris. La source publie des pourcentages arrondis qui ne permettent pas de calculer un nombre absolu de sites. L’ordre de la source est conservé ; des parts égales ne prouvent pas un rang unique.',
  'zoneScope':'nTLDData · zones DNS du 18 octobre 2026. Décompte des noms délégués, pas des sites actifs. La comparaison couvre les gTLD observés et exclut les ccTLD. Les domaines enregistrés sans délégation DNS peuvent manquer.',
  'reading':'La diffusion suit plusieurs histoires : les extensions originelles conservent un poids élevé, les codes territoriaux ancrent le web dans les pays et le cycle 2012 multiplie les spécialisations. L’origine d’un TLD ne prouve pas, à elle seule, le succès de son cycle.',
  'cohortNote':'L’origine désigne le cycle de sélection, pas l’année d’ouverture au public. Les ccTLD suivent des processus territoriaux hors des cycles ICANN. Les candidatures de 2026 ne sont pas des TLD opérationnels et sont exclues.',
  'coverage':'Couverture du décompte DNS', 'unknown':'non mesurés', 'method':'Sources, méthode et données téléchargeables', 'current':'Analyse de travail du 19 octobre 2026, hors des instantanés scientifiques RR1/RR2.',
  'history':'Relier diffusion et histoire', 'geo':'Qui gère l’infrastructure', 'ranking':'Comparer la diffusion', 'results':'TLD affichés',
  'rspTitle':'Combien de TLD chaque plateforme sert-elle ?', 'rspMode':'TLD par RSP', 'rspUnit':'gTLD attribués', 'rspProvider':'Plateforme / RSP', 'rspKind':'Type d’attribution', 'named':'Empreinte associée à un opérateur', 'unnamed':'Infrastructure partagée, opérateur non vérifié', 'unattributed':'Sans attribution',
  'rspIntro':'Ce décompte mesure l’étendue des plateformes techniques dans l’inventaire des gTLD. Il ne mesure ni les enregistrements de domaines, ni la propriété des extensions, ni les RSP évalués pour 2026.',
  'rspNote':'nTLDData déduit les attributions des serveurs de noms de la racine, des points RDAP et du DNS inverse. Même un opérateur nommé reste une attribution technique, pas un contrat RSP vérifié. Les ccTLD sont exclus ; les totaux déclarés par les entreprises peuvent donc différer.',
  'rspMap':'La vue TLD par RSP montre la concentration par plateforme sans attribuer de position géographique au décompte. Le tableau inclut aussi les groupes sans opérateur vérifié et les TLD sans attribution.',
  'rspDetails':'Tous les décomptes et leurs limites', 'rspSum':'gTLD dans le périmètre', 'rspAuto':'Groupes d’infrastructure sans opérateur vérifié', 'csv':'Télécharger CSV', 'provenance':'Provenance et empreintes des sources',
  'labels':{'legacy':'gTLD originels','2000':'Cycle 2000','2004':'Cycle 2004','2012':'Cycle 2012','cctld':'ccTLD · sans cycle ICANN'}
 }
}

for _lang, _values in {'it': {'rspTitle': 'gTLD attribuiti a ogni piattaforma',
        'rspMode': 'Piattaforme · attribuzione tecnica',
        'rspIntro': 'Questi numeri ricostruiscono quali gTLD usano la stessa infrastruttura, a partire dai segnali '
                    'pubblici della rete. Non sono un censimento dei contratti o della proprietà. Il perimetro '
                    'comprende 1.131 gTLD e non include i ccTLD.',
        'origin': 'Gruppo di introduzione',
        'summaryScope': 'Distribuzione della classifica completa (50 TLD). I filtri modificano soltanto la lista '
                        'sottostante. La quota dei TLD e la quota dei domini sono misure diverse.',
        'derived': 'DERIVATO · ATTRIBUZIONE TECNICA'},
 'en': {'rspTitle': 'gTLDs technically attributed to each platform',
        'rspMode': 'Platforms · technical attribution',
        'rspIntro': 'These numbers reconstruct which gTLDs share infrastructure from public network signals. They are '
                    'not a census of contracts or ownership. Scope: 1,131 gTLDs; ccTLDs are excluded.',
        'origin': 'Introduction group',
        'summaryScope': 'Distribution of the complete ranking (50 TLDs). Filters change only the list below. TLD '
                        'shares and domain shares are different measures.',
        'derived': 'DERIVED · TECHNICAL ATTRIBUTION'},
 'de': {'rspTitle': 'Den Plattformen technisch zugeordnete gTLDs',
        'rspMode': 'Plattformen · technische Zuordnung',
        'rspIntro': 'Die Zahlen rekonstruieren aus öffentlichen Netzsignalen, welche gTLDs Infrastruktur teilen. Sie '
                    'sind kein Vertrags- oder Eigentumsverzeichnis. Erfasst sind 1.131 gTLDs; ccTLDs fehlen.',
        'origin': 'Einführungsgruppe',
        'summaryScope': 'Verteilung der vollständigen Rangliste (50 TLDs). Filter ändern nur die Liste darunter. '
                        'TLD-Anteile und Domain-Anteile sind verschiedene Kennzahlen.',
        'derived': 'ABGELEITET · TECHNISCHE ZUORDNUNG'},
 'fr': {'rspTitle': 'gTLD attribués techniquement à chaque plateforme',
        'rspMode': 'Plateformes · attribution technique',
        'rspIntro': 'Ces chiffres reconstituent les gTLD partageant une infrastructure à partir de signaux publics du '
                    'réseau. Ils ne recensent ni les contrats ni la propriété. Périmètre : 1 131 gTLD ; les ccTLD sont '
                    'exclus.',
        'origin': 'Groupe d’introduction',
        'summaryScope': 'Répartition du classement complet (50 TLD). Les filtres modifient uniquement la liste '
                        'ci-dessous. Parts de TLD et parts de domaines sont deux mesures différentes.',
        'derived': 'DÉRIVÉ · ATTRIBUTION TECHNIQUE'}}.items():
    TEXT[_lang].update(_values)

CSS = '''<style id="tld-market-style">
.marketResearch{scroll-margin-top:110px;min-width:0}.marketResearch p{line-height:1.7;overflow-wrap:anywhere}.marketResearch h2,.marketResearch h3{line-height:1.35;overflow-wrap:anywhere}
.marketViews{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}.marketViews button{font:inherit;cursor:pointer;border:1px solid var(--border);padding:10px 14px;border-radius:9px;background:var(--surface2);color:var(--text)}.marketViews button[aria-pressed="true"]{border:2px solid var(--accent-text);font-weight:700}
.marketResearch [hidden]{display:none!important}.marketFilters{display:flex;flex-wrap:wrap;gap:16px;margin:18px 0}.marketFilters label{display:flex;flex-direction:column;gap:6px;font-size:14px}.marketFilters input,.marketFilters select{font:inherit;padding:9px;border:1px solid var(--border);border-radius:8px;background:var(--surface2);color:var(--text);max-width:100%}
.marketTable{overflow:auto;border:1px solid var(--border);border-radius:12px;margin:16px 0;max-height:650px}.marketResearch table{width:100%;border-collapse:collapse;font-size:14px}.marketResearch th,.marketResearch td{padding:11px 10px;text-align:left;border-bottom:1px solid var(--border);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.marketResearch thead th{position:sticky;top:0;background:var(--surface2);z-index:1}.marketResearch tbody th{text-transform:none;letter-spacing:normal;color:var(--text)}.marketResearch caption{text-align:left;padding:12px;font-weight:700}.marketResearch td small{display:block;color:var(--muted)}
.marketResearch details{padding:14px;border:1px solid var(--border);border-radius:12px;margin:18px 0}.marketResearch summary{font-weight:700;cursor:pointer}.marketResearch a:focus-visible,.marketResearch button:focus-visible,.marketResearch input:focus-visible,.marketResearch select:focus-visible,.marketResearch summary:focus-visible,.marketResearch [tabindex]:focus-visible{outline:2px solid var(--accent-text);outline-offset:3px}
.marketGroups{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px;margin:18px 0}.marketGroup{padding:12px;border:1px solid var(--border);border-radius:10px}.marketGroup strong{display:block;font-size:23px}.marketGroup small{display:block;line-height:1.6}.marketLinks{display:flex;flex-wrap:wrap;gap:10px 18px;margin:18px 0}.marketReading{padding:14px;border-left:3px solid var(--accent-text);background:var(--surface2)}
.rspChartLabel{font-size:17px;fill:var(--text)}.rspChartValue{font-size:17px;font-weight:700;fill:var(--text)}.rspChartBar{fill:var(--accent-text)}
@media(max-width:600px){.marketResearch{scroll-margin-top:185px}.marketResearch th,.marketResearch td{font-size:12px;padding:9px 6px}.marketGroups{grid-template-columns:1fr 1fr}.marketFilters label{width:100%}.marketTable{max-height:540px}}
</style>'''


def table(headers, rows, caption):
    return '<div class="marketTable" tabindex="0" role="region" aria-label="'+h(caption)+'"><table><caption>'+h(caption)+'</caption><thead><tr>'+''.join('<th scope="col">'+h(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'


def sources(data, keys):
    return '<div class="marketLinks">'+''.join('<a href="'+h(data['sources'][k])+'" target="_blank" rel="noopener noreferrer">'+h({'zones':'nTLDData · gTLD','backends':'nTLDData · RSP','method':'nTLDData · methodology','web':'W3Techs · TLD','webMethod':'W3Techs · methodology','cohorts':'ICANN · round definitions','iana':'IANA · root database'}[k])+' ↗</a>' for k in keys)+'</div>'


def download(filename, label):
    return '<a href="'+BASE+'data/'+filename+'" download>'+h(label)+' ↓</a>'


def market(data, lang):
    t=TEXT[lang]
    body='<div class="panel marketResearch" id="tld-market-reach"><h2>'+h(t['title'])+'</h2><p class="sectionLead">'+h(t['intro'])+'</p>'
    body+='<div class="marketViews" role="group" aria-label="'+h(t['title'])+'" hidden>'+''.join('<button type="button" data-market-view="'+k+'" aria-pressed="'+str(k=='web').lower()+'" aria-controls="market-'+k+'">'+h(t[k])+'</button>' for k in ('web','zones'))+'</div>'
    body+='<div class="marketFilters" hidden><label>'+h(t['search'])+'<input type="search" id="market-search" autocomplete="off"></label><label>'+h(t['origin'])+'<select id="market-origin"><option value="">'+h(t['all'])+'</option>'+''.join('<option value="'+k+'">'+h(v)+'</option>' for k,v in t['labels'].items())+'</select></label></div><p id="market-result-count" aria-live="polite"></p>'
    for key, name in [('web','top50Web'),('zones','top50Zones')]:
        body+='<div id="market-'+key+'" data-market-panel="'+key+'"><h3>'+h(t[key])+'</h3><p>'+h(t['webScope' if key=='web' else 'zoneScope'])+'</p><p class="marketSummaryScope">'+h(t['summaryScope'])+'</p><div class="marketGroups">'
        for g in data['groups'][key]:
            if not g['tlds']:continue
            body+='<div class="marketGroup"><span>'+h(t['labels'][g['cohort']])+'</span><strong>'+str(g['tlds'])+' / 50</strong><small>'+h(t['count'])+'</small>'
            if key=='zones':
                pct=f"{100*g['value']/sum(x['value'] for x in data['groups'][key]):.1f}".replace('.',',' if lang!='en' else '.')
                body+='<small>'+number(int(g['value']),lang)+' · '+h(t['weight'])+'</small><small><b>'+pct+'%</b> '+h(t['weightShare'])+'</small>'
            body+='</div>'
        body+='</div>'
        rows=[]
        for r in data[name]:
            value=(str(r['sharePercent']).replace('.',',' if lang!='en' else '.')+'%') if key=='web' else number(r['domains'],lang)
            rows.append('<tr data-market-tld="'+h(r['tld'])+'" data-market-cohort="'+r['cohort']+'"><td>'+str(r.get('rank',r.get('sourcePosition')))+'</td><th scope="row"><bdi>.'+h(r['tld'])+'</bdi></th><td>'+h(value)+'</td><td>'+h(t['labels'][r['cohort']])+'</td><td>'+h(r['ianaRegistrationDate'] or '—')+'</td></tr>')
        body+=table([t['rank'],t['tld'],t['webMetric' if key=='web' else 'zoneMetric'],t['origin'],t['date']],rows,t[key])
        if key=='zones':body+='<p class="small">'+h(t['coverage'])+': '+number(data['zoneMeasuredTLDs'],lang)+' / '+number(data['inventoryTLDs'],lang)+' gTLD · '+str(data['missingZoneTLDs'])+' '+h(t['unknown'])+'.</p>'
        body+='</div>'
    body+='<p class="marketReading">'+h(t['reading'])+'</p><p>'+h(t['cohortNote'])+'</p><details><summary>'+h(t['method'])+'</summary>'+sources(data,['zones','method','web','webMethod','cohorts','iana'])+'<p>'+h(data['attribution'])+'</p><div class="marketLinks">'+download('tld_top50_zone_domains.csv',t['zones']+' · CSV')+download('tld_top50_website_share.csv',t['web']+' · CSV')+download('tld_market_snapshot.json','JSON')+download('tld_market_provenance.json',t['provenance'])+download('source_method_corrections_20261019.json',t['provenance']+' · 2026-10-19')+'</div></details><p class="small">'+h(t['current'])+'</p><div class="marketLinks">'+link(lang,'timeline','tld-cultural-trajectory',t['history'])+link(lang,'geography','rsp-tld-footprint',t['geo'])+'</div></div>'
    return body


def rsp(data, lang):
    t=TEXT[lang]; named=[r for r in data['backends'] if r['attributionKind']=='named-fingerprint']; unnamed=[r for r in data['backends'] if r['attributionKind']!='named-fingerprint']
    def rows(items):
        return ['<tr><th scope="row">'+h(r['name'])+'</th><td>'+str(r['tlds'])+'</td><td>'+h(t['named' if r['attributionKind']=='named-fingerprint' else 'unnamed'])+'</td></tr>' for r in items]
    body='<div class="marketResearch" id="rsp-tld-footprint"><p class="marketEvidence">'+h(t['derived'])+'</p><h3>'+h(t['rspTitle'])+'</h3><p>'+h(t['rspIntro'])+'</p>'
    body+=table([t['rspProvider'],t['rspUnit'],t['rspKind']],rows(named),t['rspTitle'])
    body+='<details><summary>'+h(t['rspAuto'])+' · '+str(len(unnamed))+'</summary>'+table([t['rspProvider'],t['rspUnit'],t['rspKind']],rows(unnamed),t['rspAuto'])+'</details>'
    body+='<p><strong>'+h(t['unattributed'])+': '+str(data['unattributedTLDs'])+' gTLD.</strong> '+h(t['rspSum'])+': '+number(data['inventoryTLDs'],lang)+'.</p><details><summary>'+h(t['rspDetails'])+'</summary><p>'+h(t['rspMap'])+'</p>'+sources(data,['backends','method'])+'<p>'+h(data['attribution'])+'</p><p>'+h(t['current'])+' DNS: '+h(data['zoneDate'])+'.</p><div class="marketLinks">'+download('rsp_tld_footprint.csv',t['csv'])+download('tld_market_snapshot.json','JSON')+download('tld_market_provenance.json',t['provenance'])+download('source_method_corrections_20261019.json',t['provenance']+' · 2026-10-19')+'</div></details><div class="marketLinks">'+link(lang,'economics','tld-market-reach',t['ranking'])+'</div></div>'
    return body


def render(root: Path):
    data=json.loads((root/'data/tld_market_snapshot.json').read_text())
    for lang,path in [('en',root/'index.html')]+[(l,root/l/'index.html') for l in TEXT]:
        text=path.read_text();t=TEXT[lang]
        assert 'id="tld-market-style"' not in text
        text=after_intro(text,'economics',market(data,lang))
        # Add the same provider counts directly beside the existing power map.
        pattern=r'<div class="mapNote" id="geoNote">.*?</div>'
        assert re.search(pattern,text,re.S)
        text=re.sub(pattern,lambda m:m.group(0)+rsp(data,lang),text,count=1,flags=re.S)
        pattern=r'<div[^>]*class="mapControls"[^>]*>'
        assert re.search(pattern,text)
        text=re.sub(pattern,lambda m:m.group(0)+'<button class="mapToggle" type="button" data-mapmode="rspFootprint">'+h(t['rspMode'])+'</button>',text,count=1)
        payload={'rows':[{'name':r['name'],'tlds':r['tlds']} for r in data['backends'] if r['attributionKind']=='named-fingerprint'], 'unit':t['rspUnit'],'note':t['rspMap']+' '+t['rspNote'],'results':t['results']}
        text=text.replace('</head>',CSS+'<script type="application/json" id="rsp-footprint-data">'+json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+'</script><script src="'+BASE+'assets/tld-market.js" defer></script></head>',1)
        # The history offers the next step from proposed names to observed use.
        marker='<div class="panel tldResearch" id="tld-cultural-trajectory"'
        assert marker in text
        start=text.index(marker);end=text.index('<div class="tldLinks">',start)
        text=text[:end]+text[end:].replace('<div class="tldLinks">','<div class="tldLinks">'+link(lang,'economics','tld-market-reach',t['ranking']),1)
        prefix='' if path==root/'index.html' else '../'
        for resource in ('assets/tld-market.js','data/tld_top50_zone_domains.csv','data/tld_top50_website_share.csv','data/rsp_tld_footprint.csv','data/tld_market_snapshot.json','data/tld_market_provenance.json'):
            text=text.replace(BASE+resource,prefix+resource)
        path.write_text(text,encoding='utf-8')
    print('TLD_MARKET_RENDERED',data['inventoryTLDs'],len(data['backends']))
