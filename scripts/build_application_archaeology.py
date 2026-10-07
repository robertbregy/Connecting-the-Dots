#!/usr/bin/env python3
"""Build the locally vendored 2000/2004/2012 application archaeology datasets.

The 2012 layer vendors the complete 1,930 Reveal-Day string/applicant graph
(1,409 distinct strings) from a preserved transcription of ICANN's published
Reveal table, plus the four subsequently approved string corrections that
created three additional unique replacement labels. Personal contact fields
are intentionally not vendored. The browser performs no external research
fetches, so every visitor sees the same deterministic locally vendored historical corpus.
"""
from __future__ import annotations
from pathlib import Path
import csv, json, re, unicodedata
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
GOVERNANCE_CASES=json.loads((DATA/'governance_cases.json').read_text(encoding='utf-8'))
SRC_2000='https://archive.icann.org/en/tlds/tld-applications-lodged-02oct00.htm'
SRC_2000_STATUS='https://archive.icann.org/en/tlds/tld-review-update-13oct00.htm'
SRC_2000_SELECTION='https://www.icann.org/en/announcements/details/icann-announces-selections-for-new-top-level-domains-16-11-2000-en'
SRC_2004='https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en'
RAW_2012='https://raw.githubusercontent.com/nimblemachines/analyzing-iana-root-db/master/strings-1200utc-13jun12-en.csv'
CDN_2012='https://cdn.jsdelivr.net/gh/nimblemachines/analyzing-iana-root-db@master/strings-1200utc-13jun12-en.csv'
WAYBACK_2012='https://web.archive.org/web/20120613142047if_/http://newgtlds-cloudfront.icann.org/sites/default/files/reveal/strings-1200utc-13jun12-en.html'
ICANN_2012='https://newgtlds.icann.org/en/program-status/statistics'
ICANN_2012_STATUS='https://gtldresult.icann.org/applicationstatus/viewstatus'
ICANN_2012_REVEAL='https://www.icann.org/en/announcements/details/new-gtld-reveal-day---applied-for-strings-13-6-2012-en'
ICANN_2013_QUALITY='https://newgtlds.icann.org/sites/default/files/ie-quality-program-26aug14-en.pdf'
ICANN_2025_TERMINATION='https://www.icann.org/en/board-activities-and-meetings/materials/approved-resolutions-regular-meeting-of-the-icann-board-14-09-2025-en'
ICANN_2012_OVERVIEW='https://newgtlds.icann.org/en/program-status/statistics/applications-overview-13jun12-en.pdf'
ICANN_2012_ANNUAL='https://www.icann.org/en/about/annual-report/annual-report-2012-en.pdf'
TRANSCRIPTION_2012='https://www.thedomains.com/2012/06/13/here-are-all-1930-applications-for-new-gtlds/'
ICANN_2012_STRING_CHANGES='https://itp.cdn.icann.org/en/files/board-committee-meetings/briefing-materials/briefing-materials-4-18may13-en.pdf'
ICANN_2012_INITIAL_CONTENTION='https://gtldresult.icann.org/applicationstatus/stringcontentionstatus.downinitialstringsimilaritysetspdf'
ICANN_2012_SUPPORT='https://newgtlds.icann.org/sites/default/files/sarp-results-12mar13-en.pdf'
ICANN_2012_GCC='https://www.icann.org/en/board-activities-and-meetings/materials/minutes-meeting-of-the-new-gtld-program-committee-30-01-2014-en'
ICANN_2012_COLLISION='https://www.icann.org/en/board-activities-and-meetings/materials/approved-board-resolutions-regular-meeting-of-the-icann-board-04-02-2018-en'

# Stable project submission IDs follow the order on ICANN's corrected 10 Oct 2000
# lodged-applications table. They are not ICANN-issued application IDs.
rows_2000=[
('2000-001','Name.Space, Incorporated','United States','.ads .agency .aids .air .antiques .art .artists .auction .audio .bbs .books .cafe .cam .card .cars .center .city .channel .church .club .commerce .computers .consulting .culture .design .digital .direct .dtv .dvd .factory .fashion .festival .fiction .film .films .foundation .free .fun .fund .funds .gallery .games .gay .graphics .group .guide .hotel .help .history .index .insurance .jazz .jobs .lab .mad .mag .magic .mail .market .media .men .monitor .movie .music .news .now .nyc .one .online .opera .page .partners .people .planet .politics .power .productions .projects .properties .radio .records .school .service .sex .shoes .shop .show .security .society .sound .shareware .site .software .solutions .soup .space .sports .star .studios .sucks .systems .tech .temple .theater .time .times .toys .trade .travel .voice .war .watch .weather .women .world .writer .zine .zone','completed','not-selected'),
('2000-002','Rathbawn Computers Limited','United States / Australia','.africa .llc .sansansan .sex .three33 .wap .xxx','completed','not-selected'),
('2000-003','Société Internationale de Télécommunications Aéronautiques (SITA)','Belgium / Switzerland','.air','completed','selected'),
('2000-004','JVTeam, LLC','United States','.biz','completed','selected'),
('2000-005','Abacus America, Inc.','United States','.biz .cool .fam .inc .xxx','completed','not-selected'),
('2000-006','Affinity Internet, Inc. / biz Regulatory and Advisory Council (bizTRAC)','United States','.biz .ebiz .firm .inc .real','completed','not-selected'),
('2000-007','iDomains, Inc.','United States','.biz .ebiz .ecom','completed','not-selected'),
('2000-008','KDD Internet Solutions Co., Ltd.','Japan','.biz .home','completed','not-selected'),
('2000-009','Diebold Incorporated','United States','.cash .global .secure','completed','not-selected'),
('2000-010','Cooperative League of the USA dba National Cooperative Business Association','United States','.co-op .coop','completed','selected'),
('2000-011','Novell, Inc.','United States','.dir','completed','not-selected'),
('2000-012','NeuStar, Inc.','United States','.dot .info .site .spot .surf .web','completed','not-selected'),
('2000-013','Dubai Technology, Electronic Commerce and Media Free Zone Authority','United Arab Emirates','.dubai .go','completed','not-selected'),
('2000-014','Internet Events International, Inc.','United States','.event','completed','not-selected'),
('2000-015','Association Monegasque des Banques','Monaco','.fin','completed','not-selected'),
('2000-016','Monsoon Assets Limited (BVI) dba dotYP, Inc.','United States','.find .yp .ypa .ypi','completed','not-selected'),
('2000-017','Eastern Communications Company Limited','China','.firm .game .inc .info .ltd .news .shop .store .tour','completed','not-selected'),
('2000-018','SRI International','United States','.geo','completed','not-selected'),
('2000-019','World Health Organization','Switzerland','.health','completed','not-selected'),
('2000-020','Sarnoff Corporation / Atomic Tangerine, Inc. / NextDNS, Inc.','United States','.i','completed','not-selected'),
('2000-021','Afilias, LLC','United States','.info .site .web','completed','selected'),
('2000-022','The Global Name Registry, Limited','United Kingdom','.jina .name .nom .san .xing','completed','selected'),
('2000-023','Blueberry Hill Communications, Inc.','United States','.kids','completed','not-selected'),
('2000-024','DotKids, Inc.','United States','.kids','completed','not-selected'),
('2000-025','ICM Registry, Inc.','Canada','.kids .xxx','completed','not-selected'),
('2000-026','.KIDS Domains, Inc.','United States','.kids','completed','not-selected'),
('2000-027','dotlaw, Inc.','United States','.law','completed','not-selected'),
('2000-028','Commercial Connect, LLC','United States','.mall .shop .svc','completed','not-selected'),
('2000-029','Nokia Corporation','Finland','.mas .max .mid .mis .mobi .mobile .now .own','completed','not-selected'),
('2000-030','Museum Domain Management Association','Sweden / United States','.mus .muse .musea .museum .museums','completed','selected'),
('2000-031','CORE Internet Council of Registrars','Switzerland','.nom','completed','not-selected'),
('2000-032','The dotNOM Consortium','International consortium','.nom','completed','not-selected'),
('2000-033','De Breed Holding B.V.','Netherlands','.number .tel .phone','returned-unpaid','returned'),
('2000-034','WorldNames, Inc.','United States','.nyc','withdrawn','withdrawn'),
('2000-035','Group One Registry, Inc.','United States','.one','completed','not-selected'),
('2000-036','JVTeam, LLC','United States','.per','completed','not-selected'),
('2000-037','DADA Spa','Italy','.pid','completed','not-selected'),
('2000-038','Universal Postal Union','Switzerland','.post','completed','not-selected'),
('2000-039','The dotPRO Consortium','International consortium','.pro','completed','not-selected'),
('2000-040','RegistryPro, Ltd.','Ireland','.pro','completed','selected'),
('2000-041','Jeff Pulver / David P. Peek / Glenn W. Marschel','United States','.tel','completed','not-selected'),
('2000-042','Number.tel LLC','United States','.tel','completed','not-selected'),
('2000-043','Telnic Limited','United Kingdom','.tel','completed','not-selected'),
('2000-044','International Air Transport Association','Switzerland','.travel','completed','not-selected'),
('2000-045','International Confederation of Free Trade Unions (ICFTU)','Belgium','.union','completed','not-selected'),
('2000-046','dotWAP Domain Registry (DDR), Inc.','United States','.wap','returned-unpaid','returned'),
('2000-047','Image Online Design, Inc. dba Web Registry','United States','.web','completed','not-selected'),
]

# The later-selected .aero was explicitly mentioned by SITA but not listed in Item E2.
alternatives_2000=[('2000-003','.aer','mentioned-alternative'),('2000-003','.aero','mentioned-alternative-selected')]


def write_csv(path, headers, rows):
    with path.open('w',encoding='utf-8-sig',newline='') as fh:
        w=csv.DictWriter(fh,fieldnames=headers); w.writeheader(); w.writerows(rows)

def ascii_dot(label:str)->str:
    raw=unicodedata.normalize('NFC',str(label or '').strip()).lstrip('.')
    if not raw: return ''
    return '.'+raw.encode('idna').decode('ascii').lower()

governance_case_by_string={}
for case in GOVERNANCE_CASES.get('cases',[]):
    years=[int(y) for y in re.findall(r'\d{4}',case.get('period',''))]
    start=years[0] if years else None; end=years[-1] if years else start
    for raw in case.get('strings',[]):
        governance_case_by_string[ascii_dot(raw)]={'id':case['id'],'start':start,'end':end}

def governance_case_id_for(label:str, round_year:int)->str:
    case=governance_case_by_string.get(ascii_dot(label))
    if not case: return ''
    if case['start'] is not None and round_year < case['start']: return ''
    if case['end'] is not None and round_year > case['end']: return ''
    return case['id']

apps=[]; links=[]
for sid,applicant,location,strings,status,outcome in rows_2000:
    item2=strings.split()
    if status=='returned-unpaid':
        outcome_reason='application-fee-not-paid'; outcome_source=SRC_2000_STATUS
    elif status=='withdrawn':
        outcome_reason='confidentiality-claims-unresolved'; outcome_source=SRC_2000_STATUS
    elif outcome=='selected':
        outcome_reason='selected-in-proof-of-concept-round'; outcome_source=SRC_2000_SELECTION
    elif outcome=='not-selected':
        outcome_reason='not-selected-in-proof-of-concept-round'; outcome_source=SRC_2000_SELECTION
    else:
        outcome_reason=''; outcome_source=''
    apps.append({'round':'2000','submission_id':sid,'official_application_id':'','applicant':applicant,'location':location,'status':status,'outcome':outcome,'outcome_reason':outcome_reason,'outcome_source_url':outcome_source,'item_e2_string_count':len(item2),'source_url':SRC_2000})
    for s in item2:
        links.append({'round':'2000','submission_id':sid,'string':s.lower(),'relation_type':'item-e2-requested','source_url':SRC_2000})
for sid,s,rel in alternatives_2000:
    links.append({'round':'2000','submission_id':sid,'string':s,'relation_type':rel,'source_url':SRC_2000})

by_submission_2000={a['submission_id']:a for a in apps}
outcome_case_by_submission_2000={'2000-033':'fees-2000','2000-046':'fees-2000','2000-034':'nyc-2000','2000-018':'geo-2000'}
for link in links:
    parent=by_submission_2000[link['submission_id']]
    key=ascii_dot(link['string'])
    controversy_case_id=governance_case_id_for(key,2000)
    link.update({
        'outcome':parent['outcome'],'outcome_reason':parent['outcome_reason'],
        'outcome_case_id':outcome_case_by_submission_2000.get(parent['submission_id'],''),
        'outcome_source_url':parent['outcome_source_url'],
        'contention':'','contention_case_id':'',
        'controversy':'yes' if controversy_case_id else 'no',
        'controversy_case_id':controversy_case_id,
    })

if len(apps)!=47: raise SystemExit(f'2000 submissions {len(apps)} != 47')
item2=[r for r in links if r['relation_type']=='item-e2-requested']
if len(item2)!=223: raise SystemExit(f'2000 Item E2 links {len(item2)} != 223')
if len({r['string'] for r in item2})!=188: raise SystemExit('2000 distinct Item E2 string count != 188')
if sum(a['status']=='returned-unpaid' for a in apps)!=2 or sum(a['status']=='withdrawn' for a in apps)!=1:
    raise SystemExit('2000 inactive application counts do not match ICANN status update')

write_csv(DATA/'applications_2000.csv',list(apps[0]),apps)
write_csv(DATA/'application_strings_2000.csv',list(links[0]),links)

# Normalize the already-curated complete 2004 table.
with (DATA/'round_2004.csv').open(encoding='utf-8-sig',newline='') as fh:
    source2004=list(csv.DictReader(fh))
if len(source2004)!=10 or len({r['string'].lower() for r in source2004})!=9:
    raise SystemExit('2004 source table must contain 10 applications for 9 strings')
apps2004=[]
for i,r in enumerate(source2004,1):
    # The legacy 2004 table already carries a curated outcome, but this frozen
    # corpus does not carry a uniformly strong application-level reason source.
    # Keep reason blank rather than reverse-engineering it from later root state.
    key=ascii_dot(r['string'])
    controversy_case_id=governance_case_id_for(key,2004)
    apps2004.append({'round':'2004','submission_id':f'2004-{i:03d}','official_application_id':'','string':r['string'].lower(),'applicant':r['applicant'],'location':r['location'],'status':'completed','outcome':r['outcome'],'outcome_reason':'','outcome_case_id':'','outcome_source_url':'','contention':'','contention_case_id':'','controversy':'yes' if controversy_case_id else 'no','controversy_case_id':controversy_case_id,'source_url':r['source_url'] or SRC_2004})
write_csv(DATA/'applications_2004.csv',list(apps2004[0]),apps2004)

# Vendor the complete 2012 Reveal-Day string/applicant graph. The preserved
# project source contains only two factual fields from the historic table:
# applied-for string and applicant. Contact/email and other richer fields from
# the original 14-column transport are deliberately not republished.
pairs_source=DATA/'applications_2012_pairs_source.txt'
pairs=[]
for raw in pairs_source.read_text(encoding='utf-8').splitlines():
    m=re.match(r'^L(\d+): (.*?)\s+\|\s+(.*)$',raw)
    if not m: raise SystemExit(f'Invalid 2012 source row: {raw!r}')
    source_row=int(m.group(1))
    string=unicodedata.normalize('NFC',m.group(2).strip())
    applicant=unicodedata.normalize('NFC',m.group(3).strip())
    if not string or not applicant: raise SystemExit(f'Incomplete 2012 source row {source_row}')
    pairs.append((source_row,string,applicant))
if [n for n,_,_ in pairs] != list(range(22,1952)):
    raise SystemExit('2012 source rows must be exactly L22..L1951 in order')
if len(pairs)!=1930: raise SystemExit(f'2012 applications {len(pairs)} != 1930')

def alabel_2012(label:str)->str:
    return label.encode('idna').decode('ascii').lower()

counts2012=Counter(unicodedata.normalize('NFC',s).casefold() for _,s,_ in pairs)
if len(counts2012)!=1409: raise SystemExit(f'2012 distinct strings {len(counts2012)} != 1409')
if sum(v>1 for v in counts2012.values())!=230: raise SystemExit('2012 contested string count != 230')
if sum(v for v in counts2012.values() if v>1)!=751: raise SystemExit('2012 contested application count != 751')
for label,expected in {'app':13,'home':11,'inc':11,'web':7,'art':10,'music':8}.items():
    if counts2012[label]!=expected: raise SystemExit(f'2012 contention sanity check {label}: {counts2012[label]} != {expected}')

# Four post-Reveal string corrections were explicitly approved by ICANN. They
# are application updates, not additional applications. Three of the targets
# were new unique labels; .africa already existed in the Reveal-Day set via a
# different application. Mapping by original A-label avoids Unicode ambiguity.
string_changes_2012={
    'dotafrica':{
        'official_application_id':'1-1165-42560','target_string':'africa',
        'reason':'approved spelling correction: .DotAfrica → .Africa'
    },
    'kerrylogisitics':{
        'official_application_id':'1-928-31367','target_string':'kerrylogistics',
        'reason':'approved spelling correction: .kerrylogisitics → .kerrylogistics'
    },
    'xn--hdb9cza1b':{
        'official_application_id':'1-1254-29622','target_string':'קום',
        'reason':'approved Hebrew spelling correction'
    },
    'xn--tqq33ed31aqia':{
        'official_application_id':'1-910-25137','target_string':'组织机构',
        'reason':'approved IDN transliteration/form correction for ORG'
    },
}

# Only source-backed 2012 outcomes carried by this frozen corpus are populated.
# Blank means unknown here, not delegated/successful and not rejected/failed.
source_backed_outcomes_2012={
    '.idn':('excluded-from-further-participation','applicant-support-ineligibility','support-2012',ICANN_2012_SUPPORT),
    '.ummah':('excluded-from-further-participation','applicant-support-ineligibility','support-2012',ICANN_2012_SUPPORT),
    '.gcc':('not-approved','gac-consensus-advice','gcc-2012',ICANN_2012_GCC),
    '.corp':('did-not-proceed','high-risk-name-collision','collision-2012',ICANN_2012_COLLISION),
    '.home':('did-not-proceed','high-risk-name-collision','collision-2012',ICANN_2012_COLLISION),
    '.mail':('did-not-proceed','high-risk-name-collision','collision-2012',ICANN_2012_COLLISION),
}
nonexact_contention_2012={
    '.hoteis':'2012-similarity-hoteis-hotels', '.hotels':'2012-similarity-hoteis-hotels',
    '.unicom':'2012-similarity-unicom-unicorn', '.unicorn':'2012-similarity-unicom-unicorn',
}

apps2012=[]
for i,(source_row,string,applicant) in enumerate(pairs,1):
    is_idn=any(ord(ch)>127 for ch in string)
    a_label=alabel_2012(string) if is_idn else string.lower()
    change=string_changes_2012.get(a_label)
    target=unicodedata.normalize('NFC',change['target_string']) if change else ''
    target_alabel=alabel_2012(target) if target and any(ord(ch)>127 for ch in target) else target.lower()
    normalized_key='.'+a_label
    outcome,outcome_reason,outcome_case_id,outcome_source_url=source_backed_outcomes_2012.get(normalized_key,('','','',''))
    if counts2012[unicodedata.normalize('NFC',string).casefold()]>1:
        contention='yes'; contention_case_id='2012-exact-'+a_label
    elif normalized_key in nonexact_contention_2012:
        contention='yes'; contention_case_id=nonexact_contention_2012[normalized_key]
    else:
        contention='no'; contention_case_id=''
    controversy_case_id=governance_case_id_for(normalized_key,2012)
    apps2012.append({
        'round':'2012','submission_id':f'2012-{i:04d}',
        'official_application_id':change['official_application_id'] if change else '',
        'string':'.'+string.lower(),'ascii_string':'.'+a_label,'applicant':applicant,
        'idn':'Yes' if is_idn else 'No','a_label':a_label if is_idn else '',
        'relation_type':'requested','status':'published-application','outcome':outcome,
        'outcome_reason':outcome_reason,'outcome_case_id':outcome_case_id,'outcome_source_url':outcome_source_url,
        'contention':contention,'contention_case_id':contention_case_id,
        'controversy':'yes' if controversy_case_id else 'no','controversy_case_id':controversy_case_id,
        'string_change_target':('.'+target.lower()) if target else '',
        'string_change_target_ascii':('.'+target_alabel) if target else '',
        'string_change_reason':change['reason'] if change else '',
        'string_change_source_url':ICANN_2012_STRING_CHANGES if change else '',
        'source_url':TRANSCRIPTION_2012,'source_role':'secondary-transcription-of-icann-reveal-table',
        'official_corpus_source_url':ICANN_2012_STATUS,'official_corpus_source_role':'official-icann-2012-application-status-database',
        'metadata_scope':'complete-string-applicant-graph-plus-approved-string-changes','source_row':source_row
    })
if sum(a['idn']=='Yes' for a in apps2012)!=116: raise SystemExit('2012 IDN application count != 116')
changed=[a for a in apps2012 if a['string_change_target']]
if len(changed)!=4 or len({a['string_change_target_ascii'] for a in changed})!=4:
    raise SystemExit('2012 approved string-change mapping incomplete')
reveal_labels={a['ascii_string'] for a in apps2012}
replacement_labels={a['string_change_target_ascii'] for a in changed}
if len(reveal_labels|replacement_labels)!=1412:
    raise SystemExit('2012 Reveal + approved replacement label universe != 1412')
if sum(bool(a['outcome_reason']) for a in apps2012)!=27:
    raise SystemExit('2012 source-backed outcome row count != 27')
if any(a['outcome_reason'] and not a['outcome_source_url'] for a in apps2012):
    raise SystemExit('2012 outcome reason without source URL')
if sum(a['contention']=='yes' for a in apps2012)!=755:
    raise SystemExit('2012 contention dimension count != 755 (751 exact-match + 4 non-exact)')
if not any(a['contention']=='yes' and a['controversy']=='yes' for a in apps2012):
    raise SystemExit('independent contention/controversy dimensions have no overlap')
if not any(a['outcome'] and a['contention']=='yes' for a in apps2012):
    raise SystemExit('independent outcome/contention dimensions have no overlap')
write_csv(DATA/'applications_2012.csv',list(apps2012[0]),apps2012)

local_apps=[]
by_id={a['submission_id']:a for a in apps}
for link in links:
    a=by_id[link['submission_id']]
    local_apps.append({
        'round':'2000','submissionId':a['submission_id'],'applicationId':'','string':link['string'],'applicant':a['applicant'],'location':a['location'],
        'region':'','idn':False,'aLabel':'','scriptCode':'','community':None,'geographic':None,'status':a['status'],'outcome':a['outcome'],'outcomeReason':link['outcome_reason'],'outcomeCaseId':link['outcome_case_id'],'outcomeSource':link['outcome_source_url'],'contention':link['contention'],'contentionCaseId':link['contention_case_id'],'controversy':link['controversy'],'controversyCaseId':link['controversy_case_id'],
        'relationType':link['relation_type'],'source':SRC_2000
    })
for a in apps2004:
    local_apps.append({
        'round':'2004','submissionId':a['submission_id'],'applicationId':'','string':a['string'],'applicant':a['applicant'],'location':a['location'],
        'region':'','idn':False,'aLabel':'','scriptCode':'','community':None,'geographic':None,'status':a['status'],'outcome':a['outcome'],'outcomeReason':a['outcome_reason'],'outcomeCaseId':a['outcome_case_id'],'outcomeSource':a['outcome_source_url'],'contention':a['contention'],'contentionCaseId':a['contention_case_id'],'controversy':a['controversy'],'controversyCaseId':a['controversy_case_id'],
        'relationType':'requested','source':a['source_url']
    })
for a in apps2012:
    base={
        'round':'2012','submissionId':a['submission_id'],'applicationId':a['official_application_id'],'string':a['string'],'asciiString':a['ascii_string'],'applicant':a['applicant'],
        'location':'','region':'','idn':a['idn']=='Yes','aLabel':a['a_label'],'scriptCode':'','community':None,'geographic':None,
        'status':a['status'],'outcome':a['outcome'],'outcomeReason':a['outcome_reason'],'outcomeCaseId':a['outcome_case_id'],'outcomeSource':a['outcome_source_url'],'contention':a['contention'],'contentionCaseId':a['contention_case_id'],'controversy':a['controversy'],'controversyCaseId':a['controversy_case_id'],'relationType':'requested','source':a['source_url'],
        'sourceRole':a['source_role'],'officialCorpusSource':a['official_corpus_source_url'],'officialCorpusSourceRole':a['official_corpus_source_role'],'metadataScope':a['metadata_scope'],'sourceRow':a['source_row']
    }
    local_apps.append(base)
    if a['string_change_target']:
        local_apps.append({
            **base,
            'string':a['string_change_target'],'asciiString':a['string_change_target_ascii'],
            'relationType':'approved-string-change-target','source':a['string_change_source_url'],
            'sourceRole':'official-icann-approved-string-change','originalString':a['string'],
            'stringChangeReason':a['string_change_reason']
        })

manifest={
 'schemaVersion':1,
 'title':'Application Archaeology corpus',
 'privacy':{
   'excluded2012Fields':['Primary Contact','Email'],
   'sourceTransportContainsExcludedFields':True,
   'handling':'The locally vendored 2012 layer contains String and Applicant only; personal contact and email fields from the historic 14-column transport are not stored, exposed or exported.',
   'reason':'Not needed for historical TLD/application analysis.'
 },
 'rounds':{
   '2000':{'delivery':'vendored','applications':47,'itemE2Links':223,'itemE2UniqueStrings':188,'additionalMentionedAlternatives':2,'sources':[SRC_2000,SRC_2000_STATUS]},
   '2004':{'delivery':'vendored','applications':10,'uniqueStrings':9,'sources':[SRC_2004]},
   '2012':{
      'delivery':'vendored-complete-string-applicant-graph','applications':1930,'uniqueStrings':1409,'idn':116,'geographic':66,'community':84,
      'contestedStrings':230,'contestedApplications':751,'regions':{'NA':911,'EUR':675,'AP':303,'LAC':24,'AF':17},
      'sources':[ICANN_2012_REVEAL,ICANN_2012_STATUS,WAYBACK_2012,ICANN_2012_OVERVIEW,ICANN_2012_ANNUAL,ICANN_2012,ICANN_2012_STRING_CHANGES,ICANN_2012_INITIAL_CONTENTION,RAW_2012,CDN_2012,TRANSCRIPTION_2012],
      'expectedOriginalHeader':['String','Applicant','Website','Location','Region','Primary Contact','Email','IDN?','A-Label','English Meaning','Script Code','Community?','Geographic?','Application ID'],
      'fieldsVendored':['String','Applicant','approved post-Reveal string-change target for four applications'],
      'provenance':{'rowMaterialization':'secondary transcription of the 13 June 2012 ICANN Reveal table','officialCorpusAuthority':ICANN_2012_STATUS,'officialRevealAuthority':ICANN_2012_REVEAL,'applicationIdPolicy':'Only IDs independently documented by a primary ICANN source are populated; blank does not mean that ICANN did not assign an ID.'},
      'revealDayDistinctStringDefinition':{'value':1409,'asOf':'2012-06-13','definition':'distinct strings in the original Reveal-Day list','laterActivePopulationExample':1388,'laterActivePopulationAsOf':'2013-08-28','note':'Later ICANN materials use 1,388 for a later active/program-state population; this does not replace the original 1,409 Reveal-Day count.','sources':[ICANN_2012_ANNUAL,ICANN_2013_QUALITY,ICANN_2025_TERMINATION]},
      'derivedFields':['A-Label for IDNs','IDN flag','project record ID','contention counts'],
      'outcomeFields':{'fields':['outcome','outcome_reason','outcome_case_id','outcome_source_url'],'coverage':'source-backed subset only','rule':'Blank means not documented in this frozen corpus; no result is inferred from present-day root status.','sourceBackedApplicationRows':27},
      'independentDimensions':{'contention':['contention','contention_case_id'],'controversy':['controversy','controversy_case_id'],'rule':'Outcome, contention and controversy are independent. A row may carry more than one dimension; editorial case selection does not collapse them.'},
      'approvedStringChanges':4,'additionalUniqueReplacementStrings':3,'applicationStringLifecycleLabels':1412,
      'initialStringSimilarityContention':{
          'source':ICANN_2012_INITIAL_CONTENTION,
          'exactMatchSets':230,
          'nonExactMatchSets':2,
          'nonExactMatchPairs':[['.hoteis','.hotels'],['.unicom','.unicorn']],
          'note':'The 230 exact-match sets are counted from duplicate Reveal-Day strings. ICANN also identified two initial non-exact string-similarity sets; they are documented separately and are not folded into the exact-match application count.'
      },
      'fieldsNotVendored':['Website','Location','Region','Primary Contact','Email','English Meaning','Script Code','Community?','Geographic?','official Application ID except four independently documented string-change applications'],
      'metadataScope':'Complete 1,930-row application→string→applicant graph covering all 1,409 distinct Reveal-Day strings, plus all four ICANN-approved post-Reveal string corrections (three additional unique replacement labels; 1,412 application-string lifecycle labels in total). Richer original application metadata is not claimed as locally complete.'
   }
 },
 'runtimeSources2012':[],
 'documentedExternalSources2012':[ICANN_2012_REVEAL,ICANN_2012_STATUS,RAW_2012,CDN_2012,WAYBACK_2012],
 'runtimeTransport2012':{
   'status':'disabled-local-corpus-vendored',
   'canonicalHistoricalEvidence':WAYBACK_2012,
   'officialCurrentApplicationDatabase':ICANN_2012_STATUS,
   'scope':'The complete 2012 string/applicant graph is bundled locally. External mirrors remain provenance references only; no browser-time transport contributes records.',
   'validation':['1,930 application rows','1,409 distinct Reveal-Day strings','4 approved post-Reveal string corrections','3 additional unique replacement labels','1,412 application-string lifecycle labels','116 IDN applications','230 contested Reveal-Day strings','751 applications in exact-match Reveal-Day contention strings','2 initial non-exact string-similarity sets (.hoteis/.hotels and .unicom/.unicorn)','top contention sanity checks: .app 13, .home 11, .inc 11, .web 7'],
 },
 "method":"The publication locally vendors the complete 13 June 2012 applied-for-string/applicant graph: 1,930 applications across 1,409 distinct Reveal-Day strings, plus all four ICANN-approved post-Reveal string corrections that add three unique replacement labels (1,412 application-string lifecycle labels total). Row materialization is preserved from a secondary transcription of the original ICANN Reveal table and is explicitly corroborated at corpus level by ICANN\'s official 2012 application-status database and Reveal-Day publication. It does not claim that every field of the historic 14-column Reveal CSV is locally reproduced. Primary Contact and Email are excluded by design, and official Application IDs remain blank unless independently documented by a primary ICANN source. No browser-time external research fetch is used."
}
(DATA/'application_archaeology_local.json').write_text(json.dumps({'schemaVersion':1,'applications':local_apps},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(DATA/'application_archaeology_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'2000: {len(apps)} submissions · {len(item2)} Item E2 links · {len(set(r["string"] for r in item2))} unique strings · {len(links)} links incl. SITA alternatives')
print(f'2004: {len(apps2004)} submissions · {len(set(r["string"] for r in apps2004))} unique strings')
print(f'2012: {len(apps2012)} applications · {len(counts2012)} Reveal-Day strings · 4 approved changes · 1412 lifecycle labels · {sum(v>1 for v in counts2012.values())} exact-match contested strings')
print(f'local application links: {len(local_apps)}')
