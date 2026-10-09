from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json,re,os,shutil

ROOT=Path(__file__).resolve().parent.parent
INPUT=ROOT/'index.html'
BASE='https://robertbregy.github.io/Connecting-the-Dots/'
LANGS=['en','it','de','fr']
LOCALE={'en':'en_US','it':'it_IT','de':'de_DE','fr':'fr_FR'}
NAMES={'en':'English','it':'Italiano','de':'Deutsch','fr':'Français'}
VERSION=json.loads((ROOT/'package.json').read_text())['version']
I18N=json.loads((ROOT/'data/translations.json').read_text())
ARCH=json.loads((ROOT/'data/application_archaeology_manifest.json').read_text())
LOCAL_APPLICATION_COUNT=sum(int(ARCH['rounds'][r].get('applications',0)) for r in ('2000','2004','2012') if r in ARCH.get('rounds',{}))
PUB_JS=(ROOT/'data/publication.js').read_text()
m=re.search(r"version:'([^']+)'.*?releasedOn:'([^']+)'",PUB_JS,re.S)
RELEASED=m.group(2) if m else '2026-10-04'
raw=INPUT.read_text()

def source_for(lang):
    def repl(m):
        attrs=m.group(1)
        attrs=re.sub(r'\s+data-ctd-language="[^"]*"','',attrs)
        attrs=re.sub(r'\s+data-ctd-root="[^"]*"','',attrs)
        attrs=re.sub(r'\s+data-ctd-alias(?:="[^"]*")?','',attrs)
        attrs=re.sub(r'\s+lang="[^"]*"','',attrs)
        return '<html'+attrs+f' lang="{lang}" data-ctd-language="{lang}" data-ctd-root="../">'
    staged=re.sub(r'<html([^>]*)>',repl,raw,count=1)
    for identifier,filename in [
        ('ctd-data-bundle','data/site_bundle.js'),
        ('ctd-i18n-bundle','data/i18n_bundle.js'),
        ('ctd-worldmap','data/worldmap.js'),
        ('ctd-publication','data/publication.js'),
        ('ctd-app','assets/app.js')
    ]:
        placeholder=f'<script id="{identifier}"></script>'
        if placeholder not in staged:raise RuntimeError('missing '+identifier)
        staged=staged.replace(placeholder,f'<script id="{identifier}">\n'+(ROOT/filename).read_text(encoding='utf-8')+'\n</script>',1)
    return staged

def set_content(tag,html):
    tag.clear();frag=BeautifulSoup(html,'html.parser')
    for node in list(frag.contents):tag.append(node)

def render(page,lang,alias=False):
    page.set_content(source_for(lang),wait_until='domcontentloaded',timeout=30000)
    page.wait_for_function("document.querySelectorAll('#disputeGrid .disputeCase').length===9",timeout=10000)
    page.wait_for_function("document.querySelectorAll('#socialGrid .socialCase').length===9",timeout=10000)
    page.wait_for_timeout(100)
    html=page.content();soup=BeautifulSoup(html,'lxml');root=soup.html
    prefix='' if alias else '../';canonical=BASE+lang+'/'
    root['lang']=lang;root['data-ctd-language']=lang;root['data-ctd-root']='./' if alias else '../'
    if alias:root['data-ctd-alias']=''
    elif root.has_attr('data-ctd-alias'):del root['data-ctd-alias']
    tr={**I18N['en'],**I18N[lang]}
    soup.title.string=tr['metaTitle']
    def meta(selector,val):
        n=soup.select_one(selector)
        if not n:raise RuntimeError('missing '+selector)
        n['content']=val
    meta('meta[name="description"]',tr['metaDescription']);meta('meta[name="robots"]','index,follow,max-image-preview:large')
    meta('meta[property="og:title"]',tr['metaTitle']);meta('meta[property="og:description"]',tr['metaOgDescription']);meta('meta[property="og:url"]',canonical);meta('meta[property="og:locale"]',LOCALE[lang]);meta('meta[property="og:image:alt"]',tr['metaSocialImageAlt'])
    meta('meta[name="twitter:title"]',tr['metaTitle']);meta('meta[name="twitter:description"]',tr['metaOgDescription']);meta('meta[name="twitter:image:alt"]',tr['metaSocialImageAlt'])
    soup.select_one('#canonicalLink')['href']=canonical
    for link in soup.select('link[hreflang]'):
        target=link.get('hreflang');link['href']=BASE+('en' if target=='x-default' else target)+'/'
    for old in soup.select('meta[property="og:locale:alternate"]'):old.decompose()
    for other in [x for x in LANGS if x!=lang]:
        x=soup.new_tag('meta');x['property']='og:locale:alternate';x['content']=LOCALE[other];soup.head.append(x)
    article=soup.select_one('#articleStructuredData');ad=json.loads(article.string or article.get_text());ad.update({'inLanguage':lang,'description':tr['metaDescription'],'mainEntityOfPage':canonical,'dateModified':RELEASED});article.string=json.dumps(ad,ensure_ascii=False,separators=(',',':'))
    dataset=soup.select_one('#datasetStructuredData');dd=json.loads(dataset.string or dataset.get_text());dd.update({'name':tr['metaDatasetName'],'description':tr['metaDatasetDescription'],'version':VERSION,'dateModified':RELEASED});dataset.string=json.dumps(dd,ensure_ascii=False,separators=(',',':'))
    def links():
        return ''.join(f'<a href="{prefix}{l}/" hreflang="{l}" lang="{l}" data-language="{l}"'+(' aria-current="page"' if l==lang else '')+f'>{NAMES[l]}</a>' for l in LANGS)
    footer=soup.select_one('#languageVersions');footer['aria-label']=tr['languageVersions'];set_content(footer,links())
    nos=soup.select_one('#staticReading')
    if nos:set_content(nos,f'<div class="staticReading"><p>{tr["staticReading"]}</p><nav class="languageVersions" aria-label="{tr["languageVersions"]}">{links()}</nav></div>')
    st=soup.select_one('#applicationCorpusStatus')
    if st:
        st['class']=['applicationCorpusStatus','ready']
        st.string=tr['applicationCorpusReady'].replace('{count}',str(LOCAL_APPLICATION_COUNT)).replace('{rounds}','2000, 2004, 2012')
    cnt=soup.select_one('#exploreApplicationCount')
    if cnt:cnt.string=str(LOCAL_APPLICATION_COUNT)
    style=soup.select_one('#ctd-runtime-style');link=soup.new_tag('link',id='ctd-runtime-style');link['rel']='stylesheet';link['href']=f'assets/style.css?v={VERSION}';style.replace_with(link)
    for sid,file in [('ctd-data-bundle','data/site_bundle.js'),('ctd-worldmap','data/worldmap.js'),('ctd-app','assets/app.js')]:
        n=soup.select_one('#'+sid);n.clear();n['src']=f'{file}?v={VERSION}';n['defer']=''
    i18n=soup.select_one('#ctd-i18n-bundle');i18n.string='\nwindow.DOT_I18N='+json.dumps({lang:tr},ensure_ascii=False,separators=(',',':'))+';\n'
    guide=soup.select_one('a[data-inside-round-guide]')
    if guide:guide['href']=BASE+'inside-the-round/'+lang+'/'
    behind_guide=soup.select_one('a[data-behind-round-guide]')
    if behind_guide:behind_guide['href']=BASE+'behind-the-round/'+lang+'/'
    for n in soup.select('[src], [href]'):
        for attr in ('src','href'):
            ref=n.get(attr)
            if ref and (re.match(r'^(assets|data|downloads|research)/',ref) or ref=='CITATION.cff'):n[attr]=prefix+ref
    classes=[c for c in root.get('class',[]) if c!='js']
    if 'no-js' not in classes:classes.append('no-js')
    root['class']=classes
    if root.has_attr('style'):del root['style']
    tt=soup.select_one('#mapTooltip')
    if tt:tt.decompose()
    out=ROOT/('index.html' if alias else f'{lang}/index.html');out.parent.mkdir(parents=True,exist_ok=True)
    serialized=str(soup)
    if not serialized.lstrip().lower().startswith('<!doctype'): serialized='<!DOCTYPE html>\n'+serialized
    out.write_text(serialized+'\n')
    return out

CHROMIUM=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser') or shutil.which('google-chrome')
if not CHROMIUM: raise SystemExit('Chromium not found. Install it or set CHROMIUM_PATH for the optional Python fallback renderer.')

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=CHROMIUM,args=['--no-sandbox','--disable-gpu'])
    for lang in LANGS:
        page=browser.new_page();page.route('https://raw.githubusercontent.com/**',lambda route:route.abort());page.route('https://cdn.jsdelivr.net/**',lambda route:route.abort());page.route('https://www.icann.org/resources/registries/gtlds/v2/gtlds.json',lambda route:route.abort())
        out=render(page,lang,False);print('rendered',out.relative_to(ROOT),out.stat().st_size);page.close()
    page=browser.new_page();page.route('https://raw.githubusercontent.com/**',lambda route:route.abort());page.route('https://cdn.jsdelivr.net/**',lambda route:route.abort());page.route('https://www.icann.org/resources/registries/gtlds/v2/gtlds.json',lambda route:route.abort())
    out=render(page,'en',True);print('rendered',out.relative_to(ROOT),out.stat().st_size);page.close();browser.close()

hre='\n'.join(f'    <xhtml:link rel="alternate" hreflang="{l}" href="{BASE+("en" if l=="x-default" else l)}/"/>' for l in [*LANGS,'x-default'])
entries='\n'.join(f'  <url>\n    <loc>{BASE+l}/</loc>\n    <lastmod>{RELEASED}</lastmod>\n{hre}\n  </url>' for l in LANGS)
(ROOT/'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n{entries}\n</urlset>\n')
