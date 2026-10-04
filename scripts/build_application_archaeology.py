#!/usr/bin/env python3
"""Build the locally vendored 2000/2004 application archaeology datasets.

The 2012 Reveal Day corpus is intentionally handled by the browser runtime from
an archival copy of the original ICANN CSV and validated before it is merged.
This keeps personal contact fields out of the repository while preserving the
full public application history for the online Explorer.
"""
from __future__ import annotations
from pathlib import Path
import csv, json

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
SRC_2000='https://archive.icann.org/en/tlds/tld-applications-lodged-02oct00.htm'
SRC_2000_STATUS='https://archive.icann.org/en/tlds/tld-review-update-13oct00.htm'
SRC_2004='https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en'
RAW_2012='https://raw.githubusercontent.com/nimblemachines/analyzing-iana-root-db/master/strings-1200utc-13jun12-en.csv'
CDN_2012='https://cdn.jsdelivr.net/gh/nimblemachines/analyzing-iana-root-db@master/strings-1200utc-13jun12-en.csv'
WAYBACK_2012='https://web.archive.org/web/20120613142047if_/http://newgtlds-cloudfront.icann.org/sites/default/files/reveal/strings-1200utc-13jun12-en.html'
ICANN_2012='https://newgtlds.icann.org/en/program-status/statistics'
ICANN_2012_OVERVIEW='https://newgtlds.icann.org/en/program-status/statistics/applications-overview-13jun12-en.pdf'
ICANN_2012_ANNUAL='https://www.icann.org/en/about/annual-report/annual-report-2012-en.pdf'

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

apps=[]; links=[]
for sid,applicant,location,strings,status,outcome in rows_2000:
    item2=strings.split()
    apps.append({'round':'2000','submission_id':sid,'official_application_id':'','applicant':applicant,'location':location,'status':status,'outcome':outcome,'item_e2_string_count':len(item2),'source_url':SRC_2000})
    for s in item2:
        links.append({'round':'2000','submission_id':sid,'string':s.lower(),'relation_type':'item-e2-requested','source_url':SRC_2000})
for sid,s,rel in alternatives_2000:
    links.append({'round':'2000','submission_id':sid,'string':s,'relation_type':rel,'source_url':SRC_2000})

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
    apps2004.append({'round':'2004','submission_id':f'2004-{i:03d}','official_application_id':'','string':r['string'].lower(),'applicant':r['applicant'],'location':r['location'],'status':'completed','outcome':r['outcome'],'source_url':r['source_url'] or SRC_2004})
write_csv(DATA/'applications_2004.csv',list(apps2004[0]),apps2004)

local_apps=[]
by_id={a['submission_id']:a for a in apps}
for link in links:
    a=by_id[link['submission_id']]
    local_apps.append({
        'round':'2000','submissionId':a['submission_id'],'applicationId':'','string':link['string'],'applicant':a['applicant'],'location':a['location'],
        'region':'','idn':False,'aLabel':'','scriptCode':'','community':None,'geographic':None,'status':a['status'],'outcome':a['outcome'],
        'relationType':link['relation_type'],'source':SRC_2000
    })
for a in apps2004:
    local_apps.append({
        'round':'2004','submissionId':a['submission_id'],'applicationId':'','string':a['string'],'applicant':a['applicant'],'location':a['location'],
        'region':'','idn':False,'aLabel':'','scriptCode':'','community':None,'geographic':None,'status':a['status'],'outcome':a['outcome'],
        'relationType':'requested','source':a['source_url']
    })

manifest={
 'schemaVersion':1,
 'title':'Application Archaeology corpus',
 'privacy':{'excluded2012Fields':['Primary Contact','Email'],'reason':'Not needed for historical TLD/application analysis.'},
 'rounds':{
   '2000':{'delivery':'vendored','applications':47,'itemE2Links':223,'itemE2UniqueStrings':188,'additionalMentionedAlternatives':2,'sources':[SRC_2000,SRC_2000_STATUS]},
   '2004':{'delivery':'vendored','applications':10,'uniqueStrings':9,'sources':[SRC_2004]},
   '2012':{'delivery':'runtime-archival-snapshot','applications':1930,'uniqueStrings':1409,'idn':116,'geographic':66,'community':84,'regions':{'NA':911,'EUR':675,'AP':303,'LAC':24,'AF':17},'sources':[WAYBACK_2012,ICANN_2012_OVERVIEW,ICANN_2012_ANNUAL,ICANN_2012,RAW_2012,CDN_2012],
           'expectedHeader':['String','Applicant','Website','Location','Region','Primary Contact','Email','IDN?','A-Label','English Meaning','Script Code','Community?','Geographic?','Application ID']}
 },
 'runtimeSources2012':[RAW_2012,CDN_2012],
 'method':'2012 rows are parsed in-browser from a preserved copy of the 13 June 2012 Reveal Day CSV, privacy-sanitized, validated against official ICANN totals and the 1,409 distinct-string snapshot count, and only then merged into the Explorer.'
}
(DATA/'application_archaeology_local.json').write_text(json.dumps({'schemaVersion':1,'applications':local_apps},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(DATA/'application_archaeology_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'2000: {len(apps)} submissions · {len(item2)} Item E2 links · {len(set(r["string"] for r in item2))} unique strings · {len(links)} links incl. SITA alternatives')
print(f'2004: {len(apps2004)} submissions · {len(set(r["string"] for r in apps2004))} unique strings')
print(f'local application links: {len(local_apps)}')
