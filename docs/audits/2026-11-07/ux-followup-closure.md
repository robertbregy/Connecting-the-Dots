# Connecting the Dots: chiusura del supplemento UX del 7 novembre 2026

## Stato della pubblicazione

Prodotto verificato: **0.7.99**, commit di produzione `fbbbecf7d9f03d65e7e3026afcc083a353f196f0`. Il supplemento modifica esclusivamente file di QA e documentazione nei rami `qa/ux-followup-20261107` e `qa/focus-confirmation-20261107`. **Le tre correzioni CSS non sono pubblicate.** Non sono stati modificati main, contenuti, dataset o archivi scientifici.

## Esiti verificati

- **120 scenari di reflow e spaziatura**: quattro lingue, due temi, cinque viste e tre profili. Verificati prima gli hash di 21 file pubblici. Nessuno scorrimento orizzontale dell'intera pagina; nessun nuovo taglio rilevato dall'euristica di spaziatura. Sono emersi segnali di copertura del focus da approfondire. [Run 42352325280](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42352325280).
- **48 confronti del focus**: primi 14 Tab per condizione. Difetto riprodotto in 32 condizioni; le altre 16 sono controlli non affetti. Il candidato ha zero controlli coperti nei 48 casi e conserva la completa sequenza osservata di Tab. [Run riuscito 42353464063](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42353464063).
- **48 confronti finali dei riquadri delle metriche**: quattro lingue, due temi, Atlas incorporato/autonomo e larghezze 320/360/390. Tutti superati, senza sbordamento, senza divisioni arbitrarie delle componenti delle parole e con testi e numeri identici. La baseline presenta quattro condizioni con etichette fuori dal proprio riquadro.
- **16 controlli dell'ordine reale dei CSS**, piu quattro controlli dei token: tutti superati. Le regole candidate sono state aggiunte alla risposta del rispettivo foglio di stile nella sua posizione originale, non in fondo al documento. [Run finale riuscito 42354145162](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42354145162), commit QA `5128718b2c8dbfb7545ca8a809617087fb14c494`.
- **Otto scansioni di contrasto mirate**: zero violazioni certe restituite; alcuni elementi risultavano incompleti. L'icona del cambio tema ha contrasto calcolato sui colori CSS di circa 18,74:1 nel tema chiaro e 16,44:1 nel tema scuro rispetto al proprio pulsante. Questo non certifica il contrasto dell'intero sito.

Le prove precedenti sul sito pubblico 0.7.99 sono state recuperate, non attribuite a una nuova esecuzione: [run 42324163813](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42324163813), con esperienza, pubblico e responsive riusciti; 32 scenari responsive, quattro percorsi senza JavaScript e 64 scansioni axe, oltre agli otto scenari di esperienza.

## Difetti e decisioni

**F01, priorita alta: focus coperto in viewport bassi.** A 320x256 il menu persistente copre il pulsante della Home e il collegamento di Economia raggiunti da tastiera. La regola candidata rende statico soltanto il menu principale per altezze fino a 500 pixel CSS. Il selettore `html .iaPrimaryNav` evita che il successivo audience.css annulli la correzione. Le coperture traslucide richiedono interpretazione visiva: il solo hit-test non equivale a una certificazione di violazione WCAG.

**F02, priorita alta: skip link dell'Atlas coperto.** Il collegamento 'Vai al contenuto principale' riceve focus dietro l'intestazione persistente, anche a 390x844. La regola `.apsSkip:focus { z-index: 100; }` lo porta sopra l'intestazione mantenendo testo, destinazione e ordine.

**F03, priorita media: etichette lunghe nei riquadri nativi.** A 320 pixel le etichette tedesche e francesi escono dal proprio riquadro. Non provocano necessariamente scorrimento dell'intera pagina. La soluzione finale usa una colonna nell'Atlas incorporato fino a 360 pixel, senza modificare l'Atlas autonomo, i numeri o le descrizioni. Si accetta maggiore altezza verticale sui telefoni stretti per mantenere parole leggibili.

File candidati: `qa/style-accessibility-additions.css` e `qa/atlas-accessibility-additions.css`. L'applicazione prevista aggiunge 493 byte complessivi a due fogli di stile. Non costituisce ancora una release: servono versione tecnica, riferimenti agli asset, review e guardie coerenti, build, regressioni e confronto dei file realmente pubblicati. Non sovrascrivere gli ZIP storici.

## Aspetto e contenuti

La revisione visiva delle schermate conservate conferma un'identita grafica coerente tra Home, Explorer e .lugano. Non suggerisce un ridisegno generale. La gerarchia e la riduzione delle ripetizioni sono prioritarie rispetto all'aggiunta di nuovi pannelli. Questo e un giudizio euristico, non una misura di comprensione o abbandono.

**E01, duplicazione puntuale:** in tutte e quattro le lingue Economia ripete lo stesso titolo come H2 e H3. In italiano: 'Quanto sono diffusi i TLD?'. Conservare l'H2 e l'ancora `economics-reach`; proposta per l'H3: 'Due classifiche, due misure' / 'Two rankings, two measures' / 'Zwei Ranglisten, zwei Messgrossen' / 'Deux classements, deux mesures'. Non cambiare denominatori, fonti o date.

**E02, densita:** Economia italiana contiene circa 6.861 parole nel DOM completo, inclusi gli approfondimenti chiusi, e 112 elementi details. Non sono tutte parole visibili all'ingresso e non e una stima del tempo di lettura. Conservare l'ordine in sei passaggi e le prove; consolidare introduzioni ripetute e spiegare i termini specialistici al primo uso pertinente.

**E03, ingressi:** Home dispone gia di guida breve, ricerca, accesso scientifico e percorsi successivi. Mantenere distinguibili le intenzioni capire/cercare/usare la ricerca; attribuire ai blocchi successivi funzioni diverse, senza aggiungere altre scelte equivalenti. L'eventuale difficolta dei lettori resta da misurare.

La relazione precedente `docs/experience-audit-2026-11-07.md` documenta il campione di dodici affermazioni sensibili e le correzioni gia integrate nella 0.7.99. Questo supplemento non ricertifica ogni cifra economica, fonte esterna o traduzione.

## Tentativi conservati e limiti

La prima correzione dei riquadri usava overflow-wrap:anywhere: passava i test geometrici ma spezzava male le parole tedesche. E stata scartata dopo la revisione delle immagini. Il primo test del focus richiedeva erroneamente un difetto anche nelle condizioni di controllo; il run 42353155830 resta conservato. Il primo test nell'ordine reale degli stili, 42353751604, ha correttamente rilevato la sovrascrittura da audience.css. Il run 42353886914 superava geometria e conservazione, ma il rilevatore segnalava dieci falsi positivi sui normali a capo in corrispondenza dei trattini. Il test finale controlla ogni componente del composto, senza esentare l'intera parola.

Artifact finale: ID **13566463692**, SHA-256 **11b1c8bec474bd05ba1dc078c8d55b742e289000276151de90117376b307f60e**. Report finale: 48/48 scenari, 16 verifiche di ordine CSS, quattro prove dei token, nessun errore.

Zero partecipanti umani. Nessuna sessione VoiceOver/NVDA, dispositivo fisico, prova di zoom nativo, audit completo Safari/Firefox, misura dei visitatori o penetration test. I viewport bassi rappresentano equivalenti geometrici dell'ingrandimento. I controlli del focus coprono i primi 14 Tab, non ogni interazione possibile. Nessuna certificazione WCAG e attribuita.

Il browser locale non consentiva navigazione; i tentativi locali bloccati non sono conteggiati. Le prove effettive sono quelle eseguite con Chromium su GitHub Actions contro le pagine pubbliche, verificando prima i file e applicando la patch soltanto al browser di prova.

Riferimenti: [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
