/* Render the actual application once per language, with no browser at build time. */
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const base='https://robertbregy.github.io/Connecting-the-Dots/';
const languages=['en','it','de','fr'];
const locale={en:'en_US',it:'it_IT',de:'de_DE',fr:'fr_FR'};
const names={en:'English',it:'Italiano',de:'Deutsch',fr:'Français'};
const input=fs.readFileSync(path.join(root,'index.html'),'utf8');

function render(language,alias=false){
  const {document,HTMLElement}=parseHTML(input);
  // Match browser DOMStringMap conversion, including digit-containing keys such as i18n.
  Object.defineProperty(HTMLElement.prototype,'dataset',{configurable:true,get(){
    const element=this;
    const attribute=key=>'data-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
    return new Proxy({}, {
      get:(_,key)=>typeof key==='string'?(element.getAttribute(attribute(key))??undefined):undefined,
      set:(_,key,value)=>{element.setAttribute(attribute(key),String(value));return true;}
    });
  }});
  const html=document.documentElement;
  const prefix=alias?'':'../';
  const canonical=base+language+'/';
  html.setAttribute('lang',language);
  html.dataset.ctdLanguage=language;
  html.dataset.ctdRoot=alias?'./':'../';
  if(alias)html.setAttribute('data-ctd-alias','');
  else html.removeAttribute('data-ctd-alias');

  // The build needs DOM manipulation, not layout, storage or network APIs.
  HTMLElement.prototype.getBoundingClientRect=()=>({height:62,width:0,left:0,top:0,bottom:62,right:0});
  for(const select of document.querySelectorAll('select')){
    Object.defineProperty(select,'options',{get(){return this.querySelectorAll('option');}});
    Object.defineProperty(select,'value',{
      get(){const o=this.querySelector('option[selected]')||this.querySelector('option');return o?.getAttribute('value')||'';},
      set(value){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.getAttribute('value')===String(value));}
    });
  }
  const url=new URL(canonical);
  const location={href:url.href,protocol:url.protocol,pathname:url.pathname,search:'',hash:''};
  const window={document,innerWidth:1440,matchMedia:()=>({matches:false}),addEventListener:()=>{}};
  const context=vm.createContext({window,document,location,navigator:{language},
    localStorage:{getItem:()=>null,setItem:()=>{}},history:{pushState:()=>{},replaceState:()=>{}},
    requestAnimationFrame:()=>{},setTimeout:()=>0,clearTimeout:()=>{},URL,URLSearchParams,Intl,console});
  for(const id of ['ctd-data-bundle','ctd-i18n-bundle','ctd-worldmap','ctd-publication','ctd-app']){
    const node=document.getElementById(id);
    if(!node)throw new Error('Missing runtime block '+id);
    let runtime=node.textContent;
    if(id==='ctd-app')runtime=runtime.replace('if(v!==undefined)el.innerHTML=v', 'if(v!==undefined){try{el.innerHTML=v}catch(e){throw new Error("Static translation "+el.dataset.i18n+" failed: "+JSON.stringify(v)+"; "+e.message)}}');
    vm.runInContext(runtime,context,{filename:id,timeout:10000});
  }
  const translations={...window.DOT_I18N.en,...window.DOT_I18N[language]};
  const meta=(selector,value)=>{
    const node=document.querySelector(selector);
    if(!node)throw new Error('Missing metadata '+selector);
    node.setAttribute('content',value);
  };
  document.title=translations.metaTitle;
  meta('meta[name="description"]',translations.metaDescription);
  meta('meta[name="robots"]','index,follow,max-image-preview:large');
  meta('meta[property="og:title"]',translations.metaTitle);
  meta('meta[property="og:description"]',translations.metaOgDescription);
  meta('meta[property="og:url"]',canonical);
  meta('meta[property="og:image:alt"]',translations.metaSocialImageAlt);
  meta('meta[property="og:locale"]',locale[language]);
  meta('meta[name="twitter:title"]',translations.metaTitle);
  meta('meta[name="twitter:description"]',translations.metaOgDescription);
  meta('meta[name="twitter:image:alt"]',translations.metaSocialImageAlt);
  document.getElementById('canonicalLink').setAttribute('href',canonical);
  for(const link of document.querySelectorAll('link[hreflang]')){
    const target=link.getAttribute('hreflang');
    link.setAttribute('href',base+(target==='x-default'?'en':target)+'/');
  }
  for(const other of languages.filter(l=>l!==language)){
    const m=document.createElement('meta');m.setAttribute('property','og:locale:alternate');m.setAttribute('content',locale[other]);document.head.appendChild(m);
  }
  const article=document.getElementById('articleStructuredData');
  const articleData=JSON.parse(article.textContent);
  Object.assign(articleData,{inLanguage:language,description:translations.metaDescription,mainEntityOfPage:canonical,dateModified:window.DOT_PUBLICATION.releasedOn});
  article.textContent=JSON.stringify(articleData);
  const dataset=document.getElementById('datasetStructuredData');
  const datasetData=JSON.parse(dataset.textContent);
  Object.assign(datasetData,{name:translations.metaDatasetName,description:translations.metaDatasetDescription,version:window.DOT_PUBLICATION.version,dateModified:window.DOT_PUBLICATION.releasedOn});
  dataset.textContent=JSON.stringify(datasetData);

  const links=()=>languages.map(l=>`<a href="${prefix+l}/" hreflang="${l}" lang="${l}" data-language="${l}"${l===language?' aria-current="page"':''}>${names[l]}</a>`).join('');
  const footer=document.getElementById('languageVersions');
  footer.setAttribute('aria-label',translations.languageVersions);footer.innerHTML=links();
  const noscript=document.getElementById('staticReading');
  noscript.innerHTML=`<div class="staticReading"><p>${translations.staticReading}</p><nav class="languageVersions" aria-label="${translations.languageVersions}">${links()}</nav></div>`;

  // Prerender with the real application, then share its immutable release assets
  // across language routes. Details are absent from the initial payload.
  const version=window.DOT_PUBLICATION.version;
  const sheet=document.createElement('link');sheet.id='ctd-runtime-style';sheet.setAttribute('rel','stylesheet');sheet.setAttribute('href',`assets/style.css?v=${version}`);
  document.getElementById('ctd-runtime-style').replaceWith(sheet);
  for(const [id,file] of [['ctd-data-bundle','data/site_bundle.js'],['ctd-worldmap','data/worldmap.js'],['ctd-app','assets/app.js']]){
    const node=document.getElementById(id);node.textContent='';node.setAttribute('src',`${file}?v=${version}`);node.setAttribute('defer','');
  }
  for(const node of document.querySelectorAll('[src],[href]')){
    for(const attr of ['src','href']){
      const ref=node.getAttribute(attr);
      if(ref&&(/^(assets|data|downloads|research)\//.test(ref)||ref==='CITATION.cff'))node.setAttribute(attr,prefix+ref);
    }
  }
  // A localized page only needs its own complete dictionary at runtime.
  document.getElementById('ctd-i18n-bundle').textContent='\nwindow.DOT_I18N='+JSON.stringify({[language]:translations})+';\n';
  html.classList.remove('js');html.classList.add('no-js');
  html.style.removeProperty('--topbar-height');
  if(!html.getAttribute('style'))html.removeAttribute('style');
  document.getElementById('mapTooltip')?.remove();
  const output=path.join(root,alias?'index.html':language+'/index.html');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,document.toString()+'\n');
  return window.DOT_PUBLICATION.releasedOn;
}

let modified;
for(const language of languages)modified=render(language);
render('en',true);
const hreflang=[...languages,'x-default'].map(l=>`    <xhtml:link rel="alternate" hreflang="${l}" href="${base+(l==='x-default'?'en':l)}/"/>`).join('\n');
const entries=languages.map(l=>`  <url>\n    <loc>${base+l}/</loc>\n    <lastmod>${modified}</lastmod>\n${hreflang}\n  </url>`).join('\n');
fs.writeFileSync(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`);
console.log('Prerendered EN, IT, DE, FR and the compatible root alias; generated reciprocal sitemap alternates.');
