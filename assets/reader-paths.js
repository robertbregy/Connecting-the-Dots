/* Connecting the Dots | reader paths v1. Accessible, non-destructive cross-chapter navigation. */
(() => {
  'use strict';
  const sequence = {
    overview: ['how','research'],
    how: ['timeline','sources'],
    timeline: ['geography','explore'],
    explore: ['timeline','aps-native'],
    'aps-native': ['reveal','sources'],
    beyond: ['social','research'],
    cities: ['lugano','economics'],
    geography: ['beyond','sources'],
    economics: ['social','research'],
    cemetery: ['refusals','sources'],
    social: ['cities','research'],
    contention: ['disputes','aps-native'],
    refusals: ['cemetery','timeline'],
    disputes: ['strange','sources'],
    strange: ['beyond','explore'],
    reveal: ['inside-round','aps-native'],
    'inside-round': ['behind-round','sources'],
    'behind-round': ['lugano','aps-native'],
    lugano: ['cities','research'],
    research: ['paper','sources'],
    paper: ['resources','sources'],
    resources: ['sources','explore'],
    sources: ['overview','resources']
  };
  const words = {
    it: {title:'Dove andare adesso?', intro:'Segui il filo della storia oppure passa direttamente alle prove.',next:'Continua la storia',deeper:'Approfondisci', names:{overview:'Inizia dal principio',how:'Come funziona Internet e il DNS',timeline:'Le candidature nella storia',explore:'Esplora i domini', 'aps-native':'Atlante delle candidature 2026',beyond:'Oltre il punto',cities:'Le città su Internet',geography:'La geografia del DNS',economics:'Economia dei domini',cemetery:'Il cimitero dei gTLD',social:'La dimensione sociale',contention:'Le contese',refusals:'Esiti e cicli di vita',disputes:'Le controversie',strange:'Internet insolito',reveal:'Le candidature del 2026','inside-round':'La cronologia del round','behind-round':'Note dal campo',lugano:'Il caso .lugano',research:'La ricerca',paper:'Il working paper',resources:'Dati e risorse',sources:'Metodi e fonti'}},
    en: {title:'Where next?',intro:'Follow the story or go straight to the evidence.',next:'Continue the story',deeper:'Go deeper',names:{overview:'Start here',how:'How the Internet and DNS work',timeline:'Applications through history',explore:'Explore domains','aps-native':'2026 application atlas',beyond:'Beyond the dot',cities:'Cities on the Internet',geography:'DNS geography',economics:'The domain economy',cemetery:'The gTLD cemetery',social:'Social dimensions',contention:'Contention sets',refusals:'Outcomes and lifecycles',disputes:'Disputes',strange:'The strange Internet',reveal:'2026 applications','inside-round':'Round timeline','behind-round':'Field notes',lugano:'The .lugano case',research:'Research',paper:'Working paper',resources:'Data and resources',sources:'Methods and sources'}},
    de: {title:'Wie geht es weiter?',intro:'Folgen Sie der Geschichte oder gehen Sie direkt zu den Belegen.',next:'Geschichte fortsetzen',deeper:'Vertiefen',names:{overview:'Hier beginnen',how:'Internet und DNS verstehen',timeline:'Geschichte der Bewerbungen',explore:'Domains erkunden','aps-native':'Bewerbungsatlas 2026',beyond:'Jenseits des Punktes',cities:'Städte im Internet',geography:'Geografie des DNS',economics:'Ökonomie der Domains',cemetery:'Der gTLD-Friedhof',social:'Gesellschaftliche Dimension',contention:'Namenskonflikte',refusals:'Ergebnisse und Lebenszyklen',disputes:'Kontroversen',strange:'Das ungewöhnliche Internet',reveal:'Bewerbungen 2026','inside-round':'Chronologie der Runde','behind-round':'Feldnotizen',lugano:'Der Fall .lugano',research:'Forschung',paper:'Working Paper',resources:'Daten und Ressourcen',sources:'Methodik und Quellen'}},
    fr: {title:'Et ensuite ?',intro:'Suivez le fil du récit ou consultez directement les preuves.',next:'Poursuivre le récit',deeper:'Approfondir',names:{overview:'Commencer ici',how:'Comprendre Internet et le DNS',timeline:'Histoire des candidatures',explore:'Explorer les domaines','aps-native':'Atlas des candidatures 2026',beyond:'Au-delà du point',cities:'Les villes sur Internet',geography:'Géographie du DNS',economics:'Économie des domaines',cemetery:'Le cimetière des gTLD',social:'Dimension sociale',contention:'Concurrences entre noms',refusals:'Résultats et cycles de vie',disputes:'Controverses',strange:'Internet insolite',reveal:'Candidatures 2026','inside-round':'Chronologie du cycle','behind-round':'Notes de terrain',lugano:'Le cas .lugano',research:'Recherche',paper:'Document de travail',resources:'Données et ressources',sources:'Méthodes et sources'}}
  };
  function addPaths() {
    const lang = document.documentElement.lang.toLowerCase().slice(0,2);
    const t = words[lang] || words.en;
    for (const [from, destinations] of Object.entries(sequence)) {
      const section = document.getElementById(from);
      if (!section || !section.classList.contains('section') || section.querySelector(':scope > .readerPaths')) continue;
      const nav = document.createElement('nav');
      nav.className = 'readerPaths';
      nav.setAttribute('aria-label', t.title);
      const header = document.createElement('div');
      header.className = 'readerPathsHeader';
      const h = document.createElement('h2');
      h.textContent = t.title;
      const p = document.createElement('p');
      p.textContent = t.intro;
      header.append(h,p);
      nav.append(header);
      const links = document.createElement('div');
      links.className = 'readerPathsLinks';
      destinations.forEach((target,i) => {
        if (!document.getElementById(target)) return;
        const a = document.createElement('a');
        a.className = 'readerPathsLink';
        a.href = '?tab=' + encodeURIComponent(target) + '#' + encodeURIComponent(target);
        const small = document.createElement('span');
        small.className = 'readerPathsLabel';
        small.textContent = i === 0 ? t.next : t.deeper;
        const strong = document.createElement('strong');
        strong.textContent = t.names[target] || target;
        a.append(small,strong);
        links.append(a);
      });
      nav.append(links);
      section.append(nav);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',addPaths,{once:true});
  else addPaths();
})();
