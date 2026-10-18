/* Filter the frozen, source-backed tables without changing their ranks or denominators. */
(()=>{'use strict';
 const bind=(searchId,rowsSelector,resultId,eraId)=>{
  const input=document.getElementById(searchId),result=document.getElementById(resultId),era=eraId?document.getElementById(eraId):null;
  if(!input||!result)return;
  const rows=[...document.querySelectorAll(rowsSelector)];
  const update=()=>{const raw=input.value.trim().toLowerCase(),exact=raw.startsWith('.'),q=raw.replace(/^\./,''),e=era?era.value:'';let count=0;
   for(const row of rows){const match=(!q||(exact?row.dataset.tlds.split(/\s+/).includes(q):row.dataset.search.toLowerCase().includes(q)))&&(!e||row.dataset.era===e);row.hidden=!match;if(match)count++;}
   result.textContent=count+' '+result.dataset.resultLabel;
  };
  input.addEventListener('input',update);if(era)era.addEventListener('change',update);update();
 };
 bind('power-platform-search','[data-power-platform]','power-platform-results');
 bind('power-ranking-search','[data-power-ranking]','power-ranking-results','power-ranking-era');
})();
