/* Local census filtering; no network requests or external research at runtime. */
(()=>{'use strict';
 const source=document.getElementById('tld-cultural-data');if(!source)return;
 const data=JSON.parse(source.textContent),search=document.getElementById('tld-cultural-search'),round=document.getElementById('tld-cultural-round'),category=document.getElementById('tld-cultural-category'),body=document.getElementById('tld-cultural-records'),status=document.getElementById('tld-cultural-results');
 const norm=s=>String(s||'').normalize('NFKC').toLocaleLowerCase();
 function render(){
  const query=norm(search.value).replace(/^\./,''),selectedRound=round.value,selectedCategory=category.value;
  const records=data.records.filter(([name,rounds,categories,ascii])=>{
   const cats=categories.split('|').filter(c=>c&&c!=='unclassified'&&(!selectedRound||selectedRound==='2026'||c!=='brand')),rs=rounds.split('|').filter(Boolean);
   return (!query||norm(name).includes(query)||norm(ascii).includes(query))&&(!selectedRound||rs.includes(selectedRound))&&(!selectedCategory||(selectedCategory==='__unclassified'?!cats.length:cats.includes(selectedCategory)));
  });
  body.replaceChildren();
  for(const [name,rounds,categories,ascii,allRounds] of records.slice(0,60)){
   const row=document.createElement('tr');
   for(const value of [name,(selectedRound?rounds:allRounds).split('|').filter(Boolean).join(', ')||'—',categories.split('|').filter(c=>c&&c!=='unclassified'&&(!selectedRound||selectedRound==='2026'||c!=='brand')).map(id=>data.labels[id]||id).join(' · ')||data.unknown]){const cell=document.createElement('td');cell.textContent=value;if(value===name){cell.dir='auto';cell.style.unicodeBidi='isolate';}row.appendChild(cell);}
   body.appendChild(row);
  }
  status.textContent=new Intl.NumberFormat(data.lang).format(records.length)+' '+data.results;
 }
 search.addEventListener('input',render);round.addEventListener('change',render);category.addEventListener('change',render);render();
})();
