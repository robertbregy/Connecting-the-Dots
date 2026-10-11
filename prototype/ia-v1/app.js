"use strict";

/*
 * Connecting the Dots / IA Lab 01
 * Isolated navigation demonstrator. It does NOT load or rewrite the scientific datasets.
 * Original source pages remain the canonical source for all facts and links.
 */
const LIVE = "https://robertbregy.github.io/Connecting-the-Dots/";
const NAV_LABELS = {it:"Navigazione principale",en:"Main navigation",de:"Hauptnavigation",fr:"Navigation principale"};
const THEME_LABELS = {
  it:{light:"Attiva tema chiaro",dark:"Attiva tema scuro"},
  en:{light:"Switch to light theme",dark:"Switch to dark theme"},
  de:{light:"Helles Design aktivieren",dark:"Dunkles Design aktivieren"},
  fr:{light:"Activer le thème clair",dark:"Activer le thème sombre"}
};
const AREAS = ["capire", "esplorare", "storie", "round", "ricerca"];
const AREA_RESOURCES = {
  capire:["basics","roles","access","sanctions","glossary"],
  esplorare:["explorer","atlas","archaeology","profiles"],
  storie:["economics","social","cities","geography","disputes","outcomes","strange"],
  round:["overview2026","timeline2026","fieldnotes","counts","lugano"],
  ricerca:["method","paper","researchPortal","datasets"]
};
const RESOURCE_TARGETS = {
  basics:"basics",roles:"roles",access:"#/guida-accesso",sanctions:"sanctions",
  glossary:"glossary",explorer:"explorer",atlas:"atlas",archaeology:"archaeology",
  profiles:"explorer",economics:"economics",social:"social",cities:"cities",
  geography:"geography",disputes:"disputes",outcomes:"outcomes",strange:"strange",
  overview2026:"overview2026",timeline2026:"timeline2026",fieldnotes:"fieldnotes",
  counts:"#/nota-conteggi",lugano:"lugano",method:"method",paper:"paper",
  researchPortal:"researchPortal",datasets:"datasets"
};
const I = {
  it:{
    skip:"Vai al contenuto",language:"Lingua",notLive:"Prototipo isolato: nessuna modifica al sito pubblico",
    testLink:"Cinque prove di navigazione ↗",navUnderstand:"Capire",navExplore:"Esplorare",
    navStories:"Storie e questioni",navRound:"Round 2026",navResearch:"Ricerca",
    footerNote:"Studio di architettura informativa, non una nuova release scientifica. I contenuti completi rimangono nel sito originale.",
    originalSite:"Sito pubblico ↗",projectDocs:"Documentazione ↗",
    homeKicker:"Un atlante, più porte d'accesso",homeTitle:"Il punto di partenza è la tua domanda.",
    homeLead:"Che cosa cerchi di capire? Una spiegazione semplice, un nome nel DNS, una storia da approfondire o fonti da citare? Il sito deve accompagnarti senza sacrificare il rigore.",
    homeStart:"Comincia da una spiegazione",homeBrowse:"Esplora un nome",
    visualLabel:"La stessa conoscenza, letture diverse",visualTitle:"Dal dubbio alla fonte",
    visualSteps:["Domanda del lettore","Risposta comprensibile","Oggetto e relazioni","Dati, fonti e metodo"],
    visualFoot:"Percorsi collegati, non due siti separati.",
    chooseTitle:"Da dove vuoi partire?",chooseLead:"Tre ingressi rapidi. Non serve conoscere il lessico ICANN per scegliere.",
    choices:[["Non conosco i TLD","Parti dal funzionamento di Internet e dal significato di un nome.","#/capire"],["Cerco un nome o una candidatura","Arriva ai dati senza confondere stringhe, candidature e TLD.","#/esplorare"],["Voglio verificare le fonti","Trova metodi, download, paper e identificatori scientifici.","#/ricerca"]],
    mapKicker:"Architettura proposta",mapTitle:"Cinque aree, un solo patrimonio",
    mapLead:"La classificazione segue l'intenzione del visitatore, non l'ordine in cui abbiamo scritto le pagine.",
    openArea:"Esplora l'area →",jumpTitle:"Due esempi reali",jumpLead:"Stesso contenuto rigoroso, ingresso semplice e approfondimenti apribili quando servono.",
    demoAccess:"Guida · Chi controlla l'accesso a Internet?",demoCounts:"Nota dal campo · Perché le candidature non tornano?",
    demoOpen:"Apri il prototipo →",demoDisclaimer:"La dimostrazione riassume due articoli esistenti; i link portano sempre ai testi e alle fonti originali.",
    homeBack:"Home",navOpen:"Apri risorsa ↗",openDemo:"Esamina la scheda →",
    here:"Sei qui",typesTitle:"Oggetti diversi, domande diverse",
    distinction:"Una stringa richiesta non è automaticamente un TLD delegato; due candidature possono riferirsi alla stessa stringa.",
    terms:[["Stringa","L'etichetta richiesta, per esempio .lugano."],["Candidatura","La domanda di un soggetto a ICANN, identificata da un Application ID."],["TLD","Il dominio di primo livello, con uno stato nella storia del DNS."],["Riga APS","Un record pubblicato: anche un'alternativa -R, non per forza una nuova candidatura."]],
    relationTitle:"La relazione fondamentale",relationLabels:["Stringa","Candidatura","Delegazione"],
    relationValues:[".lugano","CDL2651T-T31516","Non accertata"],
    relationWarning:"L'esistenza di una candidatura NON dimostra che la stringa sia stata delegata.",
    baselineLabel:"Fotografia della pubblicazione",baselineNote:"Dati riferiti al 7–11 ottobre 2026; non sono esiti finali del round.",
    sectionPages:{
      capire:["Fondamenti","Capire prima di approfondire","Internet, DNS, diritti, regole e attori. Dalle spiegazioni più accessibili alle questioni di governance.","Le guide"],
      esplorare:["Oggetti e dati","Trova il nome, poi capisci cosa rappresenta","Un TLD, una stringa richiesta e una candidatura sono entità collegate ma non equivalenti.","Gli strumenti"],
      storie:["Interpretazioni e casi","Il DNS riguarda anche potere, soldi e società","Economia, comunità, identità, controversie e decisioni pubbliche: ogni storia rimanda alle prove.","I temi"],
      round:["Osservazione del processo","Il round 2026, mentre accade","Distinguiamo gli eventi accertati, gli snapshot e le domande ancora aperte. .lugano è un caso osservabile, non il centro di tutto.","Segui il processo"],
      ricerca:["Pubblicazione e metodo","Un atlante che si può verificare e citare","La versione tecnica del sito evolve; le release di ricerca hanno identità archiviate e immutabili.","Strumenti scientifici"]
    },
    resources:{
      basics:["Internet in pochi passi","Dal browser al DNS e alla radice, con un percorso visivo.","Introduzione"],
      roles:["Chi fa cosa","ICANN, registry, registrar e gestore del dominio: ruoli distinti.","Guida"],
      access:["Chi controlla l'accesso a Internet?","Filtri DNS, blocchi di rete e sospensioni dei nomi non sono la stessa cosa.","Guida pilota"],
      sanctions:["Sanzioni e DNS","Come un sistema globale incontra obblighi giuridici nazionali.","Guida"],
      glossary:["Glossario essenziale","Definizioni operative senza confondere oggetti e procedure.","Riferimento"],
      explorer:["TLD Explorer","Indaga record, stato, storia e profili dei TLD.","Strumento"],
      atlas:["Atlante delle candidature 2026","Cerca i record APS per Application ID, soggetto e stringa.","Strumento"],
      archaeology:["Application Archaeology","Segui le candidature del 2000, 2004 e 2012.","Storia"],
      profiles:["Profili e life histories","Dalla candidatura alla delegazione, se documentata.","Dati"],
      economics:["Economia del punto","Modelli, cicli, portafogli e il cimitero dei gTLD.","Analisi"],
      social:["Vita sociale","Lingue, comunità, appartenenza e inclusione.","Analisi"],
      cities:["Città e territori","Il punto come spazio digitale e risorsa pubblica.","Tema"],
      geography:["Geografia del potere","Operatori, concentrazione e controllo del namespace.","Analisi"],
      disputes:["Controversie","Conflitti di governance con fonti ed esiti distinti.","Casi"],
      outcomes:["Esiti delle candidature","Rifiuti, rinunce, interruzioni e stati diversi.","Casi"],
      strange:["L'Internet strano","Anomalie e storie che aiutano a capire le regole.","Curiosità"],
      overview2026:["Panoramica del round","Le informazioni attuali con limiti temporali espliciti.","Snapshot"],
      timeline2026:["Cronologia","Eventi e milestone osservati dal processo.","Cronologia"],
      fieldnotes:["Note dal campo","Indagini datate, osservazioni e domande irrisolte.","Serie editoriale"],
      counts:["Le candidature che non tornano","Perché 1.615, 1.614 e 2.783 sono numeri diversi.","Nota pilota"],
      lugano:["Il caso .lugano","Una candidatura osservata dall'interno, senza anticiparne l'esito.","Caso"],
      method:["Metodo e fonti","Come separiamo fatti, letture e visioni.","Metodo"],
      paper:["Working paper","Domande di ricerca, risultati e limiti.","Pubblicazione"],
      researchPortal:["Research release RR2","Identità scientifica e DOI di versione.","Archivio"],
      datasets:["Dataset scaricabili","Pacchetto tecnico, manifesti e file riproducibili.","Dati"]
    },
    art:{
      access:{
        type:"Guida generale",kicker:"Capire · Governance e accesso",title:"Chi può impedire l'accesso a un sito Internet?",
        lead:"Un problema concreto, sei livelli possibili di intervento. Questa guida non è una nota su un singolo episodio del round 2026.",
        short:"Un sito può risultare irraggiungibile per motivi molto diversi: una registrazione sospesa, una risposta DNS filtrata, un blocco di rete, un problema di connessione cifrata o un servizio non disponibile. ICANN non controlla da sola ciascuno di questi livelli. Prima di attribuire una responsabilità bisogna identificare dove avviene l'interruzione e quali prove la documentano.",
        deep:["Prima di tutto esiste un nome registrato: il registro e il registrar possono intervenire sul suo stato secondo competenze e regole proprie. Questo è diverso dall'eliminare un intero dominio di primo livello.","Quando un utente tenta la visita entrano in gioco il resolver DNS, l'instradamento IP, l'eventuale connessione TLS, l'hosting e l'applicazione. Un blocco in uno di questi passaggi non prova un blocco negli altri.","Misurazioni di rete e segnalazioni non bastano sempre a distinguere censura, guasto e indisponibilità del servizio. Per i casi nazionali servono data, metodo, fonti e limiti di inferenza."],
        caveat:"Questa è una sintesi didattica. Per i sette scenari interattivi, i precedenti e le fonti tecniche è necessario consultare l'articolo completo.",
        sourceIntro:"Il prototipo rimanda alle due guide pubblicate: le evidenze documentate appartengono alle pagine originali e alle fonti da esse citate.",
        more:["Guida integrale al controllo dell'accesso","Sanzioni e DNS: guida correlata"],
        related:["#/capire","#/storie"]
      },
      counts:{
        type:"Nota dal campo",kicker:"Round 2026 · Indagine",title:"Manca una candidatura. Ma le domande sono due.",
        lead:"Un confronto fra dati ufficiali, elenco pubblico e snapshot secondari. La differenza non va nascosta né spiegata con una supposizione comoda.",
        short:"ICANN indicava 1.616 candidature il 22 settembre 2026 e 1.615 al Reveal Day del 7 ottobre. Nell'export pubblico APS acquisito l'11 ottobre risultavano 1.614 Application ID di base e 1.169 righe di stringhe alternative, per un totale di 2.783 righe. La candidatura .wdo era indicata separatamente come sottoposta a verifica amministrativa e non compariva nell'elenco. Questa circostanza aiuta a comprendere lo scarto fra totale ufficiale ed elenco visibile, ma non spiega perché il dato di settembre fosse diminuito di un'unità.",
        deep:["Il primo confronto riguarda due aggregati ufficiali in date diverse: 1.616 candidature con pagamento ricevuto al 22 settembre e 1.615 al Reveal Day. Le fonti esaminate non stabiliscono quale candidatura abbia determinato il cambiamento.","Il secondo confronto riguarda il totale del Reveal Day e il successivo elenco pubblico APS: 1.615 contro 1.614 Application ID pubblicati. ICANN segnala esplicitamente la mancata visualizzazione di .wdo durante la verifica amministrativa.","Il terzo punto è terminologico: le 1.169 righe con identificativi -R rappresentano alternative di stringa e non 1.169 candidature pagate in più. Non confondere righe esportate, candidature, applicant e stringhe uniche."],
        caveat:"Stato delle verifiche: lo scarto 1.616 → 1.615 non è stato risolto nelle fonti congelate per questa dimostrazione. Nessuna ipotesi di sanzioni o contenzioso viene presentata come causa accertata.",
        sourceIntro:"Osservazioni datate. Il materiale sul round evolve e va confrontato con le pubblicazioni ICANN successive.",
        more:["Nota integrale, revisioni e fonti","Elenco ufficiale APS e statistiche"],
        related:["#/round","#/esplorare"]
      }
    },
    levels:["In breve","Capire meglio","Fonti, limiti e verifiche"],
    originalArticle:"Leggi l'articolo originale ↗",relatedTitle:"Continua a esplorare",
    snapshot:["1.615","1.614","2.783"],snapshotLabels:["Candidature: totale ICANN al Reveal Day","Application ID di base nell'elenco APS","Righe pubblicate, incluse le alternative -R"],
    testKicker:"Protocollo sperimentale",testTitle:"Cinque percorsi reali, prima del redesign",
    testLead:"Per verificare la nuova struttura bisogna osservare persone che non hanno contribuito al sito. Queste sono consegne per il facilitatore, non risultati di un test già effettuato.",
    tasks:[
      ["Capire un TLD","Partendo dalla Home, spiega che cos'è un TLD e distinguine la funzione da quella di un dominio registrato."],
      ["Trovare una candidatura","Cerca .lugano e identifica la candidatura ufficiale e il suo stato senza confonderla con un TLD già delegato."],
      ["Distinguere gli oggetti","Spiega la differenza fra candidature, stringhe e righe APS con i numeri del 2026."],
      ["Interpretare una controversia","Trova un caso, indica una fonte e separa ciò che è documentato da ciò che resta incerto."],
      ["Citare l'atlante","Trova il DOI specifico di RR2, la release tecnica corrente e un limite metodologico."]
    ],
    testRules:"Rilevare completamento, errori concettuali, navigazione a ritroso, tempo e qualità delle fonti. Ripetere con prototipo e sito attuale, senza guidare l'utente.",
    testBaseline:"Apri la versione attuale ↗",testDocuments:"Leggi il protocollo su GitHub ↗",
    unknown:"Percorso inesistente",unknownLead:"Questa vista non fa parte del prototipo. Torna alla Home.",
    notAFullSearch:"Questo è un prototipo della navigazione, non una copia funzionante dei dataset scientifici.",
    definitionsNote:"La navigazione mostra le relazioni; i dati restano nelle applicazioni originali."
  },
  en:{
    skip:"Skip to content",language:"Language",notLive:"Isolated prototype: no changes to the public website",
    testLink:"Five navigation tasks ↗",navUnderstand:"Understand",navExplore:"Explore",
    navStories:"Stories & issues",navRound:"2026 round",navResearch:"Research",
    footerNote:"Information architecture study, not a new scientific release. The full material remains on the original site.",
    originalSite:"Public website ↗",projectDocs:"Documentation ↗",
    homeKicker:"One atlas, several ways in",homeTitle:"Start with your question.",
    homeLead:"What do you need? A clear explanation, a name in the DNS, a story worth examining or a reliable citation? Navigation should support curiosity without weakening scientific precision.",
    homeStart:"Start with the basics",homeBrowse:"Explore a name",
    visualLabel:"Same evidence, different reading paths",visualTitle:"From question to evidence",
    visualSteps:["Reader's question","Accessible explanation","Object and relationships","Data, sources and method"],
    visualFoot:"Linked reading paths, not two separate websites.",
    chooseTitle:"What brings you here?",chooseLead:"Three starting points. No knowledge of ICANN jargon required.",
    choices:[["I'm new to TLDs","Start with how the Internet works and what a name means.","#/capire"],["I'm looking for a name or application","Reach the data without conflating strings, applications and TLDs.","#/esplorare"],["I want to verify the research","Find methods, downloads, papers and permanent identifiers.","#/ricerca"]],
    mapKicker:"Proposed architecture",mapTitle:"Five areas, one evidence base",
    mapLead:"Navigation follows reader intent, not the order in which pages were created.",
    openArea:"Explore this area →",jumpTitle:"Two real examples",jumpLead:"Rigorous content with a short entry point and optional deeper reading.",
    demoAccess:"Guide · Who controls access to the Internet?",demoCounts:"Field note · Why don't the counts match?",
    demoOpen:"Open the prototype →",demoDisclaimer:"These are short renditions of existing articles. Their original pages remain the authoritative sources.",
    homeBack:"Home",navOpen:"Open original resource ↗",openDemo:"Open the sample →",here:"You are here",
    typesTitle:"Different objects, different questions",
    distinction:"An applied-for string is not automatically a delegated TLD, and more than one application may concern the same string.",
    terms:[["String","The label being requested, for example .lugano."],["Application","An entity's submission to ICANN, identified by its Application ID."],["TLD","A top-level domain with a documented status in DNS history."],["APS row","A published record, potentially a -R alternative rather than another application."]],
    relationTitle:"The essential relationship",relationLabels:["String","Application","Delegation"],
    relationValues:[".lugano","CDL2651T-T31516","Not established"],
    relationWarning:"An application does NOT prove a string has been delegated.",
    baselineLabel:"Publication snapshot",baselineNote:"Evidence dated 7–11 October 2026; not final results of the round.",
    sectionPages:{
      capire:["Foundations","Understand before you investigate","Internet, DNS, rights, rules and actors, from the most accessible guide to governance questions.","Guides"],
      esplorare:["Objects and data","Find a name, then understand what it means","TLDs, requested strings and applications are connected but distinct entities.","Tools"],
      storie:["Interpretation and cases","DNS is also about power, money and society","Economics, communities, identity, disputes and decisions: every narrative links back to evidence.","Themes"],
      round:["Following the process","The 2026 round as it unfolds","Separate documented events, snapshots and open questions. .lugano is one observable case, not the centre of everything.","Follow the process"],
      ricerca:["Publication and methods","An atlas you can verify and cite","Technical versions keep evolving; archived scientific releases have independent, immutable identities.","Research tools"]
    },
    resources:{
      basics:["How the Internet works","From browser to DNS and the root, in a guided explanation.","Introduction"],
      roles:["Who does what?","ICANN, registry, registrar and registrant have different roles.","Guide"],
      access:["Who controls Internet access?","DNS filtering, network blocking and domain suspension differ.","Sample guide"],
      sanctions:["Sanctions and DNS","How a global system interacts with national legal obligations.","Guide"],
      glossary:["Essential glossary","Definitions that keep entities and procedures distinct.","Reference"],
      explorer:["TLD Explorer","Investigate TLD records, status, history and profiles.","Tool"],
      atlas:["2026 Application Atlas","Search published APS records by ID, applicant and string.","Tool"],
      archaeology:["Application Archaeology","Follow applications from the 2000, 2004 and 2012 rounds.","History"],
      profiles:["Profiles and life histories","From applications to delegation, where documented.","Data"],
      economics:["Economics of the dot","Business models, cycles, portfolios and the gTLD cemetery.","Analysis"],
      social:["Social life","Language, communities, belonging and inclusion.","Analysis"],
      cities:["Cities and territories","The dot as public digital space and shared resource.","Theme"],
      geography:["Geography of power","Operators, concentration and namespace control.","Analysis"],
      disputes:["Disputed dots","Governance conflicts, sources and outcomes.","Cases"],
      outcomes:["Application outcomes","Refusals, withdrawals, interruptions and distinct states.","Cases"],
      strange:["Strange Internet","Oddities that help us understand the rules.","Curiosities"],
      overview2026:["Round overview","Current numbers with clear snapshot limitations.","Snapshot"],
      timeline2026:["Timeline","Observed milestones and events in the process.","Timeline"],
      fieldnotes:["Field Notes","Dated investigations, observations and unanswered questions.","Editorial series"],
      counts:["Why the counts don't match","Why 1,615, 1,614 and 2,783 are different numbers.","Sample note"],
      lugano:["The .lugano case","An application observed from within, without predicting an outcome.","Case"],
      method:["Method and sources","How facts, interpretations and visions are distinguished.","Method"],
      paper:["Working paper","Research questions, findings and limitations.","Publication"],
      researchPortal:["Research release RR2","Scholarly identity and version-specific DOI.","Archive"],
      datasets:["Downloadable datasets","Technical package, manifests and reproducible files.","Data"]
    },
    art:{
      access:{
        type:"General guide",kicker:"Understand · Internet access",title:"Who can prevent access to a website?",
        lead:"One practical question, multiple technical layers. This guide is not a field note about a single 2026 incident.",
        short:"A website may become unreachable for very different reasons: a suspended registration, filtered DNS response, network block, failed encrypted connection or unavailable service. ICANN does not independently control all these layers. Before assigning responsibility, identify where the interruption takes place and which evidence supports the diagnosis.",
        deep:["First, a name is registered. A registry and registrar can affect its registration status under their respective responsibilities. This is not the same as removing an entire top-level domain.","A user visit also involves a DNS resolver, IP routing, a potential TLS connection, hosting and the application itself. Interference at one point does not prove interference elsewhere.","Network observations do not always distinguish censorship, malfunction and service failure. Country-specific claims require dates, measurement methods, evidence and stated limits."],
        caveat:"This is an educational synopsis. Read the full article for the seven interactive scenarios, documented cases and detailed technical evidence.",
        sourceIntro:"The two original published guides contain the underlying sources and case-specific qualifications.",
        more:["Full guide to Internet access control","Related sanctions and DNS guide"],
        related:["#/capire","#/storie"]
      },
      counts:{
        type:"Field note",kicker:"2026 round · Investigation",title:"One application is missing. But there are two questions.",
        lead:"Comparing official totals, a public listing and secondary snapshots, without inventing a convenient explanation.",
        short:"ICANN reported 1,616 applications on 22 September 2026 and 1,615 at Reveal Day on 7 October. Its public APS export captured on 11 October contained 1,614 base Application IDs and 1,169 replacement-string rows, or 2,783 rows in all. The .wdo application was reported separately as under administrative review and absent from the listing. That helps explain the difference between the official total and the public list, but not the earlier drop from 1,616 to 1,615.",
        deep:["First compare the two official aggregates: 1,616 paid applications as of 22 September versus 1,615 at Reveal Day. Reviewed sources do not identify the cause of that one-application change.","Next compare the Reveal Day total with the subsequent public APS listing: 1,615 versus 1,614 published base IDs. ICANN explicitly notes that .wdo is not shown while an administrative check is ongoing.","Finally, distinguish units: the 1,169 -R records are replacement-string options, not 1,169 additional paid applications. Rows, applications, applicants and unique strings must never be counted interchangeably."],
        caveat:"Evidence status: the 1,616 → 1,615 change is unresolved in this dated snapshot. Neither sanctions nor a legal dispute is asserted as its cause.",
        sourceIntro:"These are dated observations. Compare them with newer ICANN publications as the 2026 round proceeds.",
        more:["Full note, sources and revision history","Official APS applications and statistics"],
        related:["#/round","#/esplorare"]
      }
    },
    levels:["In brief","Go deeper","Sources, limits and checks"],
    originalArticle:"Read the original article ↗",relatedTitle:"Explore related areas",
    snapshot:["1,615","1,614","2,783"],snapshotLabels:["ICANN total at Reveal Day","Base Application IDs in public APS list","Rows including -R alternatives"],
    testKicker:"Evaluation protocol",testTitle:"Five real journeys before redesign",
    testLead:"Validating this architecture requires people who did not build the site. These are facilitator prompts, not completed study results.",
    tasks:[
      ["Understand a TLD","Start on the homepage and explain a TLD versus a registered domain name."],
      ["Find an application","Locate .lugano and its official application without assuming it is delegated."],
      ["Distinguish objects","Explain applications, strings and APS rows using the 2026 figures."],
      ["Interpret a dispute","Find a case, cite one source and distinguish facts from unresolved questions."],
      ["Cite the atlas","Find the RR2-specific DOI, current technical release and one methodological limitation."]
    ],
    testRules:"Record success, conceptual errors, backtracking, elapsed time and correct use of evidence. Compare existing site and prototype without guiding participants.",
    testBaseline:"Open the existing site ↗",testDocuments:"Read the evaluation protocol ↗",
    unknown:"Unknown route",unknownLead:"This view is not part of the demonstrator. Return to the homepage.",
    notAFullSearch:"This prototype illustrates navigation; it is not a working copy of the scientific datasets.",
    definitionsNote:"The prototype explains relationships; authoritative data stays in the original applications."
  },
  de:{
    skip:"Zum Inhalt springen",language:"Sprache",notLive:"Isolierter Prototyp: keine Änderungen an der öffentlichen Website",
    testLink:"Fünf Navigationsaufgaben ↗",navUnderstand:"Verstehen",navExplore:"Erkunden",
    navStories:"Geschichten & Fragen",navRound:"Runde 2026",navResearch:"Forschung",
    footerNote:"Studie zur Informationsarchitektur, keine neue Forschungsrelease. Die vollständigen Inhalte bleiben auf der Originalseite.",
    originalSite:"Öffentliche Website ↗",projectDocs:"Dokumentation ↗",
    homeKicker:"Ein Atlas, mehrere Zugänge",homeTitle:"Am Anfang steht Ihre Frage.",
    homeLead:"Suchen Sie eine einfache Erklärung, einen Namen im DNS, einen interessanten Fall oder zitierfähige Quellen? Die Navigation soll Orientierung bieten, ohne Genauigkeit zu verlieren.",
    homeStart:"Mit Grundlagen beginnen",homeBrowse:"Einen Namen erkunden",
    visualLabel:"Eine Wissensbasis, verschiedene Lesetiefen",visualTitle:"Von der Frage zum Beleg",
    visualSteps:["Frage der Lesenden","Verständliche Antwort","Objekt und Beziehungen","Daten, Quellen und Methode"],
    visualFoot:"Verbundene Wege statt zweier getrennter Websites.",
    chooseTitle:"Womit möchten Sie beginnen?",chooseLead:"Drei Einstiege ohne ICANN-Fachjargon.",
    choices:[["Ich kenne TLDs nicht","Erfahren Sie, wie Internet und Domainnamen funktionieren.","#/capire"],["Ich suche einen Namen oder Antrag","Unterscheiden Sie Strings, Anträge und delegierte TLDs.","#/esplorare"],["Ich will Quellen prüfen","Finden Sie Methoden, Daten und dauerhafte Kennungen.","#/ricerca"]],
    mapKicker:"Vorgeschlagene Architektur",mapTitle:"Fünf Bereiche, eine Wissensbasis",
    mapLead:"Die Navigation richtet sich nach dem Ziel der Lesenden, nicht nach der Entstehungsgeschichte der Seiten.",
    openArea:"Bereich erkunden →",jumpTitle:"Zwei konkrete Beispiele",jumpLead:"Verständlicher Einstieg mit optionalen Vertiefungen und Originalquellen.",
    demoAccess:"Leitfaden · Wer kontrolliert den Internetzugang?",demoCounts:"Feldnotiz · Warum stimmen die Zahlen nicht überein?",
    demoOpen:"Prototyp öffnen →",demoDisclaimer:"Diese Kurzfassungen verweisen für die vollständigen Belege auf die Originalartikel.",
    homeBack:"Startseite",navOpen:"Originalressource öffnen ↗",openDemo:"Beispiel öffnen →",here:"Sie sind hier",
    typesTitle:"Verschiedene Objekte, verschiedene Fragen",
    distinction:"Ein beantragter String ist nicht automatisch eine delegierte TLD. Mehrere Anträge können denselben String betreffen.",
    terms:[["String","Die beantragte Zeichenfolge, etwa .lugano."],["Antrag","Die Einreichung einer Organisation bei ICANN mit eigener Application ID."],["TLD","Eine Top-Level-Domain mit dokumentiertem Status in der DNS-Geschichte."],["APS-Zeile","Ein publizierter Datensatz, möglicherweise eine -R-Alternative statt eines neuen Antrags."]],
    relationTitle:"Die zentrale Beziehung",relationLabels:["String","Antrag","Delegierung"],
    relationValues:[".lugano","CDL2651T-T31516","Nicht belegt"],
    relationWarning:"Ein Antrag beweist NICHT, dass ein String bereits delegiert ist.",
    baselineLabel:"Veröffentlichungsstand",baselineNote:"Daten vom 7.–11. Oktober 2026, keine endgültigen Ergebnisse.",
    sectionPages:{
      capire:["Grundlagen","Erst verstehen, dann vertiefen","Internet, DNS, Rechte, Regeln und Akteure: von einfachen Erklärungen bis zur Governance.","Leitfäden"],
      esplorare:["Objekte und Daten","Namen finden und richtig einordnen","TLDs, beantragte Strings und Anträge hängen zusammen, sind aber nicht dasselbe.","Werkzeuge"],
      storie:["Interpretationen und Fälle","DNS handelt auch von Macht, Geld und Gesellschaft","Wirtschaft, Gemeinschaften, Identität und Streitfälle: Geschichten mit Quellen.","Themen"],
      round:["Den Prozess beobachten","Die Runde 2026 in Echtzeit verstehen","Bestätigte Ereignisse, Momentaufnahmen und offene Fragen unterscheiden.","Prozess verfolgen"],
      ricerca:["Publikation und Methode","Ein überprüfbarer und zitierbarer Atlas","Die technische Website entwickelt sich; archivierte Forschungsreleases besitzen eigene feste Identitäten.","Forschungsmaterial"]
    },
    resources:{
      basics:["Internet in wenigen Schritten","Vom Browser über DNS zur Root-Zone.","Einführung"],
      roles:["Wer macht was?","Die Rollen von ICANN, Registry, Registrar und Domaininhabern.","Leitfaden"],
      access:["Wer kontrolliert den Internetzugang?","DNS-Filter, Netzsperren und Domainsperrungen unterscheiden.","Musterleitfaden"],
      sanctions:["Sanktionen und DNS","Wie globale Infrastruktur nationalem Recht begegnet.","Leitfaden"],
      glossary:["Wichtigste Begriffe","Präzise Definitionen von Objekten und Verfahren.","Referenz"],
      explorer:["TLD Explorer","Einträge, Status und Lebensgeschichte von TLDs erkunden.","Werkzeug"],
      atlas:["Antragsatlas 2026","Offizielle APS-Daten nach ID, Antragsteller und String durchsuchen.","Werkzeug"],
      archaeology:["Application Archaeology","Anträge aus 2000, 2004 und 2012 verfolgen.","Geschichte"],
      profiles:["Profile und Lebensläufe","Vom Antrag zur Delegierung, sofern belegt.","Daten"],
      economics:["Ökonomie des Punkts","Geschäftsmodelle, Zyklen, Portfolios und gTLD-Friedhof.","Analyse"],
      social:["Soziale Dimension","Sprachen, Gemeinschaften und Teilhabe.","Analyse"],
      cities:["Städte und Regionen","Domains als digitale öffentliche Ressource.","Thema"],
      geography:["Geografie der Macht","Konzentration und Kontrolle des Namensraums.","Analyse"],
      disputes:["Streitfälle","Governance-Konflikte mit Quellen und Ergebnissen.","Fälle"],
      outcomes:["Antragsergebnisse","Ablehnungen, Rückzüge und andere Zustände.","Fälle"],
      strange:["Kurioses Internet","Anomalien erklären Regeln.","Kuriositäten"],
      overview2026:["Rundenüberblick","Aktuelle Zahlen mit klarem Zeitbezug.","Momentaufnahme"],
      timeline2026:["Chronologie","Dokumentierte Stationen des Verfahrens.","Chronologie"],
      fieldnotes:["Feldnotizen","Datierte Untersuchungen und offene Fragen.","Redaktionelle Reihe"],
      counts:["Unterschiedliche Antragszahlen","Warum 1.615, 1.614 und 2.783 keine gleichen Größen sind.","Muster-Feldnotiz"],
      lugano:["Fall .lugano","Antrag aus der Innenperspektive, ohne Ergebnisprognose.","Fall"],
      method:["Methode und Quellen","Fakten, Deutungen und Visionen trennen.","Methode"],
      paper:["Working Paper","Forschungsfragen, Befunde und Grenzen.","Publikation"],
      researchPortal:["Research Release RR2","Archivierte Forschungsfassung und eigener DOI.","Archiv"],
      datasets:["Datensätze herunterladen","Technisches Paket, Manifeste und Dateien.","Daten"]
    },
    art:{
      access:{
        type:"Allgemeiner Leitfaden",kicker:"Verstehen · Internetzugang",title:"Wer kann den Zugang zu einer Website verhindern?",
        lead:"Eine Frage, mehrere technische Ebenen. Kein Bericht über einen einzelnen Vorfall der Runde 2026.",
        short:"Eine Website kann aus verschiedenen Gründen unerreichbar sein: gesperrte Domainregistrierung, gefilterte DNS-Antwort, Netzsperre, gescheiterte verschlüsselte Verbindung oder Ausfall des Dienstes. ICANN kontrolliert diese Ebenen nicht allein. Um Verantwortlichkeiten zu beurteilen, muss zunächst die betroffene Ebene und die Beweislage geklärt werden.",
        deep:["Registry und Registrar haben unterschiedliche Kompetenzen hinsichtlich einer Domainregistrierung. Eine einzelne Registrierung zu sperren ist nicht dasselbe wie die Entfernung einer gesamten TLD.","Beim Seitenaufruf spielen DNS-Resolver, IP-Routing, TLS, Hosting und die Anwendung eine Rolle. Eine Unterbrechung an einer Stelle beweist keine Störung auf einer anderen Ebene.","Netzmessungen können Zensur, technische Fehler und Dienstausfälle nicht immer eindeutig unterscheiden. Es braucht Daten, Messmethoden, Quellen und klar benannte Unsicherheiten."],
        caveat:"Diese Zusammenfassung ist didaktisch. Für die sieben interaktiven Szenarien und die detaillierten Quellen den vollständigen Artikel lesen.",
        sourceIntro:"Die beiden Originalartikel enthalten die ausführlichen Nachweise und Einschränkungen.",
        more:["Vollständiger Leitfaden zum Internetzugang","Verwandter Leitfaden zu Sanktionen und DNS"],
        related:["#/capire","#/storie"]
      },
      counts:{
        type:"Feldnotiz",kicker:"Runde 2026 · Untersuchung",title:"Eine Bewerbung fehlt. Aber es gibt zwei Fragen.",
        lead:"Offizielle Zahlen, öffentliche Liste und Sekundärdaten vergleichen, ohne ungeklärte Abweichungen zu erklären.",
        short:"ICANN nannte am 22. September 2026 1.616 Anträge und am Reveal Day vom 7. Oktober 1.615. Der öffentliche APS-Export vom 11. Oktober enthielt 1.614 Basis-Application-IDs und 1.169 Zeilen mit Ersatzstrings, insgesamt 2.783 Zeilen. Der Antrag .wdo wurde wegen einer administrativen Prüfung nicht in der öffentlichen Liste angezeigt. Dies hilft beim Vergleich von Gesamtsumme und Liste, erklärt aber nicht den Rückgang von 1.616 auf 1.615.",
        deep:["Zuerst sind die offiziellen Gesamtsummen verschiedener Tage zu vergleichen: 1.616 bezahlte Anträge am 22. September und 1.615 am Reveal Day. Eine bestätigte Ursache der Abweichung liegt hier nicht vor.","Dann folgt der Vergleich zwischen Reveal-Day-Zahl und öffentlicher APS-Liste: 1.615 gegenüber 1.614 publizierten Basis-IDs. ICANN weist auf den administrativ geprüften Fall .wdo hin.","Schließlich die Zähleinheiten: 1.169 -R-Datensätze betreffen alternative Strings, nicht zusätzliche bezahlte Anträge. Zeilen, Anträge, Antragsteller und Strings sind nicht austauschbar."],
        caveat:"Stand der Belege: 1.616 → 1.615 bleibt in dieser Momentaufnahme ungeklärt. Weder Sanktionen noch ein Rechtsstreit werden als Ursache behauptet.",
        sourceIntro:"Datierte Beobachtungen: spätere ICANN-Publikationen können den Kenntnisstand verändern.",
        more:["Vollständige Feldnotiz mit Quellen","Offizielle APS-Anträge und Statistik"],
        related:["#/round","#/esplorare"]
      }
    },
    levels:["Kurz erklärt","Mehr erfahren","Quellen, Grenzen und Prüfung"],
    originalArticle:"Originalartikel lesen ↗",relatedTitle:"Verwandte Bereiche",
    snapshot:["1.615","1.614","2.783"],snapshotLabels:["Offizielle Anträge am Reveal Day","Basis-Application-IDs der APS-Liste","Zeilen einschließlich Ersatzstrings"],
    testKicker:"Testprotokoll",testTitle:"Fünf echte Nutzerwege vor dem Redesign",
    testLead:"Für einen Nachweis braucht es unabhängige Testpersonen. Diese Aufgaben sind ein Plan, keine bereits gemessenen Ergebnisse.",
    tasks:[
      ["TLD verstehen","Erklären, was eine TLD von einer Domainregistrierung unterscheidet."],
      ["Antrag finden",".lugano mit offizieller Application ID finden, ohne Delegierung anzunehmen."],
      ["Objekte unterscheiden","Anträge, Strings und APS-Zeilen anhand der Zahlen 2026 unterscheiden."],
      ["Streitfall prüfen","Fall, Quelle und ungesicherte Aussage identifizieren."],
      ["Atlas zitieren","Versions-DOI von RR2, technische Release und eine Methodengrenze finden."]
    ],
    testRules:"Erfolg, Denkfehler, Rückwege, Zeit und Belegqualität erfassen. Prototyp und bisherige Website ohne Hilfestellung vergleichen.",
    testBaseline:"Bestehende Website öffnen ↗",testDocuments:"Testprotokoll auf GitHub ↗",
    unknown:"Unbekannte Ansicht",unknownLead:"Diese Ansicht ist kein Teil des Prototyps. Bitte zur Startseite zurückkehren.",
    notAFullSearch:"Dieser Prototyp demonstriert Navigation, nicht die eigentliche Datenbank.",
    definitionsNote:"Die Beziehungen werden erklärt, die maßgeblichen Daten bleiben in den bestehenden Anwendungen."
  },
  fr:{
    skip:"Aller au contenu",language:"Langue",notLive:"Prototype isolé : aucune modification du site public",
    testLink:"Cinq parcours de navigation ↗",navUnderstand:"Comprendre",navExplore:"Explorer",
    navStories:"Histoires & enjeux",navRound:"Cycle 2026",navResearch:"Recherche",
    footerNote:"Étude d'architecture de l'information, pas une nouvelle publication scientifique. Les contenus complets restent sur le site original.",
    originalSite:"Site public ↗",projectDocs:"Documentation ↗",
    homeKicker:"Un atlas, plusieurs portes d'entrée",homeTitle:"Tout commence par votre question.",
    homeLead:"Vous cherchez une explication simple, un nom dans le DNS, un récit à approfondir ou des sources à citer ? La navigation doit faciliter l'accès sans sacrifier la rigueur.",
    homeStart:"Partir des bases",homeBrowse:"Explorer un nom",
    visualLabel:"Mêmes connaissances, lectures différentes",visualTitle:"De la question à la preuve",
    visualSteps:["Question du lecteur","Explication accessible","Objet et relations","Données, sources et méthode"],
    visualFoot:"Des parcours reliés, pas deux sites distincts.",
    chooseTitle:"Par où commencer ?",chooseLead:"Trois accès rapides, sans jargon ICANN.",
    choices:[["Je découvre les TLD","Comprendre Internet et la signification d'un nom.","#/capire"],["Je cherche un nom ou une candidature","Explorer les données sans confondre objets et dossiers.","#/esplorare"],["Je veux vérifier les sources","Accéder aux méthodes, jeux de données et citations.","#/ricerca"]],
    mapKicker:"Architecture proposée",mapTitle:"Cinq espaces, une seule base de connaissance",
    mapLead:"L'organisation suit l'intention du visiteur, pas la chronologie de rédaction.",
    openArea:"Explorer cet espace →",jumpTitle:"Deux exemples concrets",jumpLead:"Une entrée simple et des approfondissements accessibles à la demande.",
    demoAccess:"Guide · Qui contrôle l'accès à Internet ?",demoCounts:"Note de terrain · Pourquoi les totaux diffèrent-ils ?",
    demoOpen:"Ouvrir le prototype →",demoDisclaimer:"Ces résumés renvoient aux articles d'origine pour les détails et les sources.",
    homeBack:"Accueil",navOpen:"Ouvrir la ressource originale ↗",openDemo:"Voir l'exemple →",here:"Vous êtes ici",
    typesTitle:"Des objets différents, des questions différentes",
    distinction:"Une chaîne demandée ne devient pas automatiquement un TLD délégué. Plusieurs candidatures peuvent viser la même chaîne.",
    terms:[["Chaîne","Le libellé demandé, par exemple .lugano."],["Candidature","Une demande soumise à ICANN, identifiée par un Application ID."],["TLD","Un domaine de premier niveau avec un état documenté dans l'histoire du DNS."],["Ligne APS","Un enregistrement publié, parfois une option -R, sans nouvelle candidature."]],
    relationTitle:"La relation essentielle",relationLabels:["Chaîne","Candidature","Délégation"],
    relationValues:[".lugano","CDL2651T-T31516","Non établie"],
    relationWarning:"Une candidature NE prouve PAS qu'une chaîne est déléguée.",
    baselineLabel:"Instantané de publication",baselineNote:"Données observées du 7 au 11 octobre 2026, pas les résultats définitifs.",
    sectionPages:{
      capire:["Fondamentaux","Comprendre avant d'approfondir","Internet, DNS, droits, règles et acteurs, des bases aux enjeux de gouvernance.","Guides"],
      esplorare:["Objets et données","Trouver un nom, puis comprendre ce qu'il représente","TLD, chaînes demandées et candidatures sont reliés, mais différents.","Outils"],
      storie:["Analyses et cas","Le DNS concerne aussi le pouvoir, l'argent et la société","Économie, communautés, identité et controverses : chaque récit renvoie aux sources.","Thèmes"],
      round:["Observation du processus","Le cycle 2026 en cours","Distinguer les faits documentés, les instantanés et les questions ouvertes.","Suivre le processus"],
      ricerca:["Publication et méthode","Un atlas vérifiable et citable","Les versions techniques évoluent ; les publications scientifiques archivées conservent leur identité.","Ressources scientifiques"]
    },
    resources:{
      basics:["Internet en quelques étapes","Du navigateur à la racine DNS, avec un parcours guidé.","Introduction"],
      roles:["Qui fait quoi ?","ICANN, registres, bureaux d'enregistrement et titulaires.","Guide"],
      access:["Qui contrôle l'accès à Internet ?","Filtrage DNS, blocages réseau et suspension d'un nom.","Guide pilote"],
      sanctions:["Sanctions et DNS","Comment une infrastructure mondiale rencontre les lois nationales.","Guide"],
      glossary:["Glossaire essentiel","Des définitions précises pour chaque objet et procédure.","Référence"],
      explorer:["TLD Explorer","Explorer les fiches, états et histoires des TLD.","Outil"],
      atlas:["Atlas des candidatures 2026","Rechercher par ID, demandeur et chaîne dans l'APS.","Outil"],
      archaeology:["Archéologie des candidatures","Retracer les demandes de 2000, 2004 et 2012.","Histoire"],
      profiles:["Profils et parcours","De la candidature à la délégation, lorsque documentée.","Données"],
      economics:["Économie du point","Modèles, cycles, portefeuilles et cimetière des gTLD.","Analyse"],
      social:["Vie sociale","Langues, communautés, appartenance et inclusion.","Analyse"],
      cities:["Villes et territoires","Le point comme ressource numérique publique.","Thème"],
      geography:["Géographie du pouvoir","Opérateurs, concentration et contrôle des noms.","Analyse"],
      disputes:["Contentieux","Conflits de gouvernance, sources et issues.","Cas"],
      outcomes:["Sort des candidatures","Rejets, abandons et situations distinctes.","Cas"],
      strange:["L'Internet insolite","Des anomalies révélatrices du fonctionnement des règles.","Curiosités"],
      overview2026:["Vue du cycle","Statistiques datées et limites explicites.","Instantané"],
      timeline2026:["Chronologie","Événements et étapes documentés.","Chronologie"],
      fieldnotes:["Notes de terrain","Enquêtes datées et questions non résolues.","Série éditoriale"],
      counts:["Des totaux qui diffèrent","Pourquoi 1 615, 1 614 et 2 783 ne désignent pas la même chose.","Note pilote"],
      lugano:["Le cas .lugano","Suivi d'une candidature de l'intérieur, sans préjuger de l'issue.","Cas"],
      method:["Méthode et sources","Distinguer faits, lectures et visions.","Méthode"],
      paper:["Working paper","Problématique, résultats et limites.","Publication"],
      researchPortal:["Publication scientifique RR2","Version archivée et DOI spécifique.","Archive"],
      datasets:["Jeux de données","Paquet technique, manifestes et fichiers.","Données"]
    },
    art:{
      access:{
        type:"Guide général",kicker:"Comprendre · Accès à Internet",title:"Qui peut empêcher l'accès à un site web ?",
        lead:"Une question concrète, plusieurs couches techniques. Ce guide ne rapporte pas un incident unique de 2026.",
        short:"Un site peut devenir inaccessible pour différentes raisons : suspension de l'enregistrement, filtrage DNS, blocage réseau, échec d'une connexion chiffrée ou indisponibilité du service. ICANN ne contrôle pas seule tous ces niveaux. Pour attribuer une responsabilité, il faut identifier la couche concernée et les preuves disponibles.",
        deep:["Le registre et le bureau d'enregistrement exercent des responsabilités distinctes sur un nom de domaine. Suspendre un enregistrement ne revient pas à supprimer un TLD entier.","La visite sollicite aussi un résolveur DNS, le routage IP, une éventuelle connexion TLS, l'hébergement et l'application. Un obstacle à une étape ne démontre pas un blocage des autres.","Les mesures réseau ne séparent pas toujours censure, panne et indisponibilité. Les conclusions sur un pays exigent date, méthode, sources et incertitudes."],
        caveat:"Il s'agit d'une synthèse pédagogique. Consultez l'article complet pour les sept scénarios et les sources détaillées.",
        sourceIntro:"Les deux guides originaux contiennent les sources et les nuances propres à chaque cas.",
        more:["Guide complet sur le contrôle de l'accès","Guide associé : sanctions et DNS"],
        related:["#/capire","#/storie"]
      },
      counts:{
        type:"Note de terrain",kicker:"Cycle 2026 · Enquête",title:"Une candidature manque. Mais il y a deux questions.",
        lead:"Comparer les chiffres officiels, la liste publique et les instantanés secondaires sans inventer d'explication.",
        short:"ICANN indiquait 1 616 candidatures le 22 septembre 2026, puis 1 615 au Reveal Day du 7 octobre. L'export APS public relevé le 11 octobre contenait 1 614 Application IDs de base et 1 169 lignes d'alternatives, soit 2 783 lignes. La candidature .wdo était absente de la liste pendant une vérification administrative. Cela éclaire l'écart entre total officiel et liste visible, mais pas la baisse précédente de 1 616 à 1 615.",
        deep:["Premier écart : 1 616 candidatures payées au 22 septembre contre 1 615 au Reveal Day. Les sources examinées n'identifient pas la cause de cette diminution.","Deuxième écart : 1 615 au total contre 1 614 identifiants de base dans la liste APS. ICANN signale que .wdo reste soumis à vérification administrative et n'est pas affiché.","Les 1 169 lignes -R décrivent des alternatives de chaîne, pas des candidatures payées supplémentaires. Lignes, dossiers, demandeurs et chaînes uniques ne sont pas des unités interchangeables."],
        caveat:"État des preuves : le passage de 1 616 à 1 615 reste inexpliqué dans cet instantané daté. Aucune cause liée aux sanctions ou à un litige n'est affirmée.",
        sourceIntro:"Observations datées à confronter avec les publications ICANN ultérieures.",
        more:["Note complète, sources et révisions","Candidatures APS et statistiques officielles"],
        related:["#/round","#/esplorare"]
      }
    },
    levels:["En bref","Approfondir","Sources, limites et vérification"],
    originalArticle:"Lire l'article original ↗",relatedTitle:"Autres pistes",
    snapshot:["1 615","1 614","2 783"],snapshotLabels:["Total ICANN au Reveal Day","Application IDs de base dans l'APS","Lignes incluant les alternatives -R"],
    testKicker:"Protocole de validation",testTitle:"Cinq parcours réels avant le redesign",
    testLead:"Pour valider cette structure, il faut des personnes indépendantes du projet. Voici les consignes, pas les résultats d'un test accompli.",
    tasks:[
      ["Comprendre un TLD","Expliquer la différence entre un TLD et un nom de domaine enregistré."],
      ["Trouver une candidature","Trouver .lugano et son identifiant sans supposer une délégation."],
      ["Distinguer les objets","Expliquer candidatures, chaînes et lignes APS avec les chiffres 2026."],
      ["Interpréter un contentieux","Trouver un cas, citer une source et identifier les points incertains."],
      ["Citer l'atlas","Trouver le DOI de RR2, la version technique et une limite de méthode."]
    ],
    testRules:"Noter réussite, erreurs conceptuelles, retours en arrière, temps et qualité des preuves. Comparer le prototype et le site actuel sans guider.",
    testBaseline:"Ouvrir le site actuel ↗",testDocuments:"Lire le protocole sur GitHub ↗",
    unknown:"Page inconnue",unknownLead:"Cette vue ne fait pas partie du prototype. Retournez à l'accueil.",
    notAFullSearch:"Ce prototype illustre la navigation et ne réplique pas les jeux de données scientifiques.",
    definitionsNote:"Les relations sont explicitées ; les données font autorité dans les applications d'origine."
  }
};

let locale = "it";
const $ = (id) => document.getElementById(id);
const safe = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, function(c) {
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
});
const txt = () => I[locale];
const hrefFor = (key) => {
  const p = locale + "/";
  const livePages = {
    basics:p+"?tab=overview#internet-basics", roles:p+"?tab=how#how-part-3",
    access:"behind-the-round/"+p+"who-controls-internet-access/",
    sanctions:"behind-the-round/"+p+"sanctions-and-dns/",
    glossary:p+"?tab=how#how-glossary",explorer:p+"?tab=explore#explore",
    atlas:"applications/"+p,archaeology:p+"?tab=timeline#timeline",
    economics:p+"?tab=economics#economics",social:p+"?tab=social#social",
    cities:p+"?tab=cities#cities",geography:p+"?tab=geography#geography",
    disputes:p+"?tab=disputes#disputes",outcomes:p+"?tab=refusals#refusals",
    strange:p+"?tab=strange#strange",overview2026:p+"?tab=reveal#reveal",
    timeline2026:"inside-the-round/"+p,fieldnotes:"behind-the-round/"+p,
    lugano:p+"?tab=lugano#lugano",method:p+"?tab=sources#sources",
    paper:"research/connecting-the-dots-working-paper-v1.html",
    researchPortal:"research/",datasets:p+"?tab=resources#resources"
  };
  return LIVE + (livePages[key] || p);
};
const external = (url,label,classes) =>
  '<a class="'+safe(classes===undefined?"button":classes)+'" href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">'+safe(label)+'</a>';
const internal = (url,label,classes) =>
  '<a class="'+safe(classes===undefined?"button":classes)+'" href="'+safe(url)+'">'+safe(label)+'</a>';
const crumbs = (arr) => '<nav class="breadcrumb" aria-label="Breadcrumb">' +
  internal("#/",txt().homeBack,"") + arr.map((o) => '<span aria-hidden="true">/</span>' +
  (o.link ? internal(o.link,o.label,"") : '<span aria-current="page">'+safe(o.label)+'</span>')).join("") + '</nav>';
const pageHead = (kicker,title,lead) =>
  '<div class="page-head"><div class="eyebrow">'+safe(kicker)+'</div><h1>'+safe(title)+'</h1><p class="lead">'+safe(lead)+'</p></div>';
const areaLabel = (id) => txt()[{
  capire:"navUnderstand",esplorare:"navExplore",storie:"navStories",round:"navRound",ricerca:"navResearch"
}[id]];
const resourceCard = (key) => {
  const r = txt().resources[key], target = RESOURCE_TARGETS[key];
  const inLab = target.indexOf("#/") === 0;
  const anchor = inLab ? internal(target,txt().openDemo,"card-link") :
    external(hrefFor(target),txt().navOpen,"card-link");
  return '<article class="card interactive"><div class="card-tag">'+safe(r[2])+'</div><h3>'+safe(r[0])+'</h3>'+
    '<p>'+safe(r[1])+'</p>'+anchor+'</article>';
};
const topCard = (id,index) => {
  const page = txt().sectionPages[id],label=areaLabel(id);
  return '<article class="card interactive"><div class="card-index">'+String(index+1).padStart(2,"0")+'</div>'+
    '<h3>'+safe(label)+'</h3><p>'+safe(page[2])+'</p>'+internal("#/"+id,txt().openArea,"card-link")+'</article>';
};
function home() {
  const t=txt();
  return '<section class="hero"><div class="hero-copy"><div class="eyebrow">'+safe(t.homeKicker)+'</div>'+
    '<h1>'+safe(t.homeTitle)+'</h1><p class="lead">'+safe(t.homeLead)+'</p>'+
    '<div class="hero-actions">'+internal("#/capire",t.homeStart,"button primary")+
    internal("#/esplorare",t.homeBrowse,"button")+'</div></div>'+
    '<div class="hero-visual" aria-label="'+safe(t.visualTitle)+'"><div class="visual-label">'+safe(t.visualLabel)+
    '</div><div class="visual-heading">'+safe(t.visualTitle)+'</div><div class="visual-stack">'+
    t.visualSteps.map((step,i)=>'<div class="visual-layer"><b>'+String(i+1).padStart(2,"0")+'</b><span>'+safe(step)+'</span></div>').join("")+
    '</div><p class="visual-footnote">'+safe(t.visualFoot)+'</p></div></section>'+
    '<section class="segment" aria-labelledby="choices-heading"><div class="section-heading"><div><div class="eyebrow">'+safe(t.here)+
    '</div><h2 id="choices-heading">'+safe(t.chooseTitle)+'</h2><p>'+safe(t.chooseLead)+'</p></div></div>'+
    '<div class="grid">'+t.choices.map((c,i)=>'<article class="card interactive"><div class="card-index">'+String(i+1).padStart(2,"0")+
    '</div><h3>'+safe(c[0])+'</h3><p>'+safe(c[1])+'</p>'+internal(c[2],t.openArea,"card-link")+'</article>').join("")+
    '</div></section>'+
    '<section class="segment" aria-labelledby="areas-heading"><div class="section-heading"><div><div class="eyebrow">'+safe(t.mapKicker)+
    '</div><h2 id="areas-heading">'+safe(t.mapTitle)+'</h2><p>'+safe(t.mapLead)+'</p></div></div>'+
    '<div class="grid">'+AREAS.map(topCard).join("")+'</div></section>'+
    '<section class="segment" aria-labelledby="pilot-heading"><div class="section-heading"><div><h2 id="pilot-heading">'+safe(t.jumpTitle)+
    '</h2><p>'+safe(t.jumpLead)+'</p></div></div><div class="grid two">'+
    '<article class="card interactive"><div class="card-tag">'+safe(t.art.access.type)+'</div><h3>'+safe(t.demoAccess)+
    '</h3><p>'+safe(t.art.access.lead)+'</p>'+internal("#/guida-accesso",t.demoOpen,"card-link")+'</article>'+
    '<article class="card interactive"><div class="card-tag">'+safe(t.art.counts.type)+'</div><h3>'+safe(t.demoCounts)+
    '</h3><p>'+safe(t.art.counts.lead)+'</p>'+internal("#/nota-conteggi",t.demoOpen,"card-link")+'</article>'+
    '</div><div class="info-strip"><p>'+safe(t.demoDisclaimer)+'</p></div></section>';
}
function relationship() {
  const t=txt();
  return '<section class="segment" aria-labelledby="relationship-heading"><h2 id="relationship-heading">'+safe(t.relationTitle)+'</h2>'+
    '<div class="relation-path">'+t.relationLabels.map((label,i)=>{
      const r='<div class="relation-node"><span class="mini">'+safe(label)+'</span><strong>'+safe(t.relationValues[i])+'</strong></div>';
      return i===0?r:'<div class="relation-arrow" aria-hidden="true">→</div>'+r;
    }).join("")+'</div>'+
    '<p class="relation-note">'+safe(t.relationWarning)+'</p></section>';
}
function terms() {
  const t=txt();
  return '<section class="segment"><h2>'+safe(t.typesTitle)+'</h2><p class="muted">'+safe(t.distinction)+'</p>'+
    '<div class="grid two">'+t.terms.map((r)=>'<article class="card"><h3>'+safe(r[0])+'</h3><p>'+safe(r[1])+'</p></article>').join("")+
    '</div></section>';
}
function snapshot() {
  const t=txt();
  return '<section class="segment"><div class="eyebrow">'+safe(t.baselineLabel)+'</div><div class="fact-grid">'+
    t.snapshot.map((n,i)=>'<div class="fact-box"><div class="metric">'+safe(n)+'</div><div class="caption">'+safe(t.snapshotLabels[i])+'</div></div>').join("")+
    '</div><p class="relation-note">'+safe(t.baselineNote)+'</p></section>';
}
function area(id) {
  const t=txt(),p=t.sectionPages[id];
  let out=crumbs([{label:areaLabel(id)}])+pageHead(p[0],p[1],p[2]);
  if(id==="esplorare") out+=relationship();
  if(id==="round") out+=snapshot();
  out+='<section class="segment"><h2>'+safe(p[3])+'</h2><div class="grid">'+AREA_RESOURCES[id].map(resourceCard).join("")+'</div></section>';
  if(id==="capire"||id==="esplorare")out+=terms();
  out+='<div class="info-strip"><strong>IA LAB · 01</strong><p>'+safe(t.notAFullSearch)+'</p></div>';
  return out;
}
const articleSources = {
  access:(l)=>[
    [hrefFor("access"),I[l].art.access.more[0]],
    [hrefFor("sanctions"),I[l].art.access.more[1]]
  ],
  counts:(l)=>[
    [hrefFor("fieldnotes"),I[l].art.counts.more[0]],
    ["https://newgtldprogram-aps.icann.org/applications",I[l].art.counts.more[1]],
    ["https://newgtldprogram-aps.icann.org/statistics","ICANN APS Statistics"]
  ]
};
function article(which) {
  const t=txt(),d=t.art[which],from=which==="access"?"capire":"round";
  const arr=articleSources[which](locale);
  const short='<section class="reading-block always" aria-labelledby="brief-title"><h2 id="brief-title">'+safe(t.levels[0])+
    '</h2><p>'+safe(d.short)+'</p></section>';
  const deep='<section class="reading-block"><details id="depth-explain"><summary>'+safe(t.levels[1])+
    '</summary><div class="reading-body">'+d.deep.map((p)=>'<p>'+safe(p)+'</p>').join("")+'</div></details></section>';
  const sources='<section class="reading-block"><details id="depth-evidence"><summary>'+safe(t.levels[2])+
    '</summary><div class="reading-body"><p>'+safe(d.sourceIntro)+'</p><p class="evidence-note">'+safe(d.caveat)+
    '</p><ul class="source-list">'+arr.map((s)=>'<li>'+external(s[0],s[1],"")+'</li>').join("")+
    '</ul></div></details></section>';
  const sourceUrl=hrefFor(which==="access"?"access":"fieldnotes");
  return '<div class="article">'+crumbs([{label:areaLabel(from),link:"#/"+from},{label:d.type}])+
    '<div class="page-head"><div class="type-line"><span class="pill blue">'+safe(d.type)+
    '</span><span class="pill mint">FACT / READING</span></div><div class="eyebrow">'+safe(d.kicker)+
    '</div><h1>'+safe(d.title)+'</h1><p class="lead">'+safe(d.lead)+'</p></div>'+short+deep+sources+
    '<div class="info-strip"><strong>'+safe(t.baselineLabel)+'</strong><p>'+safe(t.baselineNote)+'</p></div>'+
    '<div class="hero-actions">'+external(sourceUrl,t.originalArticle,"button primary")+'</div>'+
    '<section class="related"><h2>'+safe(t.relatedTitle)+'</h2><div class="related-links">'+d.related.map((r)=>internal(r,areaLabel(r.slice(2)),"")).join("")+
    '</div></section></div>';
}
function tasksPage() {
  const t=txt();
  return crumbs([{label:t.testTitle}])+pageHead(t.testKicker,t.testTitle,t.testLead)+
    '<div class="card">'+t.tasks.map((v,i)=>'<div class="task-item"><div class="task-number">'+String(i+1).padStart(2,"0")+
    '</div><div><h3>'+safe(v[0])+'</h3><p>'+safe(v[1])+'</p></div></div>').join("")+'</div>'+
    '<div class="info-strip"><strong>Baseline vs IA Lab</strong><p>'+safe(t.testRules)+'</p></div>'+
    '<div class="hero-actions">'+external(LIVE,t.testBaseline,"button primary")+
    external("https://github.com/robertbregy/Connecting-the-Dots/blob/feat/ia-rearchitecture-20261012/docs/IA_VALIDATION_AND_ROLLOUT.md",t.testDocuments,"button")+
    '</div>';
}
function currentRoute() {
  const p=location.hash.startsWith("#/")?location.hash.slice(2).split("?")[0]:"";
  return p.replace(/^\/+|\/+$/g,"");
}
function render() {
  const t=txt(),p=currentRoute();
  const stage=$("main");
  let section=p;
  if(!p){stage.innerHTML=home();section="";}
  else if(AREAS.includes(p))stage.innerHTML=area(p);
  else if(p==="guida-accesso"){stage.innerHTML=article("access");section="capire";}
  else if(p==="nota-conteggi"){stage.innerHTML=article("counts");section="round";}
  else if(p==="test"){stage.innerHTML=tasksPage();section="";}
  else{stage.innerHTML=crumbs([])+pageHead("",t.unknown,t.unknownLead)+internal("#/",t.homeBack,"button");section="";}
  document.querySelectorAll("[data-section]").forEach((n)=>{
    if(n.dataset.section===section)n.setAttribute("aria-current","page");
    else n.removeAttribute("aria-current");
  });
  if(document.activeElement && document.activeElement.closest(".nav-bar")) {
    stage.focus({preventScroll:true});
  }
  window.scrollTo({top:0,behavior:"auto"});
}
function updateLanguage(next) {
  locale = Object.prototype.hasOwnProperty.call(I,next)?next:"it";
  document.documentElement.lang=locale;
  $("locale").value=locale;
  const t=txt();
  document.querySelectorAll("[data-i18n]").forEach((n)=> {
    const k=n.dataset.i18n;
    if(k in t)n.textContent=t[k];
  });
  document.title="Connecting the Dots | IA Lab · "+t.homeBack;
  document.querySelector(".brand").setAttribute("aria-label","Connecting the Dots · "+t.homeBack);
  document.querySelector(".nav-bar").setAttribute("aria-label",NAV_LABELS[locale]);
  $("theme-toggle").setAttribute("aria-label",THEME_LABELS[locale][document.documentElement.dataset.theme==="dark"?"light":"dark"]);
  try {
    const u = new URL(location.href);
    u.searchParams.set("lang",locale);
    history.replaceState(null,"",u.pathname+u.search+u.hash);
  } catch (_) {}
  render();
}
function toggleTheme() {
  const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
  document.documentElement.dataset.theme=next;
  $("theme-toggle").setAttribute("aria-label",THEME_LABELS[locale][next==="dark"?"light":"dark"]);
  try {localStorage.setItem("ctd-ia-theme",next);}catch(_){}
}
function init() {
  const wanted=new URLSearchParams(location.search).get("lang")||"it";
  $("locale").addEventListener("change",function(e){updateLanguage(e.target.value)});
  $("theme-toggle").addEventListener("click",toggleTheme);
  try {if(localStorage.getItem("ctd-ia-theme")==="dark")toggleTheme()}catch(_){}
  window.addEventListener("hashchange",render);
  updateLanguage(wanted);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
