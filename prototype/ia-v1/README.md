# IA Lab 01 — prototipo navigabile isolato

**Status:** proposta sperimentale, NON pubblicata in produzione. **Baseline:** \`main\` alla versione tecnica **v0.7.78**, 12 ottobre 2026. Questo percorso risiede soltanto nel ramo \`feat/ia-rearchitecture-20261012\`.

## Cosa dimostra

Un unico sistema di conoscenza con cinque ingressi per scopo:

1. Capire / Understand
2. Esplorare / Explore
3. Storie e questioni / Stories & issues
4. Round 2026
5. Ricerca / Research

La Home presenta percorsi di ingresso basati sull'intento. Le schede trasversali sono collegate alle pagine canoniche già pubblicate: **non esiste un secondo dataset**. Le due pagine pilota (**controllo dell'accesso a Internet** e **discrepanza dei conteggi Reveal Day**) offrono una sintesi sempre visibile, un approfondimento opzionale e fonti/limiti apribili. Il selettore di lingua serve IT, EN, DE e FR; il tema chiaro/scuro resta disponibile.

Questo esperimento **non** simula una ricerca completa, non modifica un oggetto scientifico, non costruisce nuovi dati e non anticipa lo stato delle candidature 2026.

## Come aprire

**Metodo semplice:** scaricare il file \`standalone.html\` dal ramo GitHub e aprirlo nel browser. È un file HTML autonomo: CSS e JavaScript sono incorporati. Tutti i link a ICANN e al sito pubblico restano link esterni e non richiedono dati duplicati.

**Metodo sviluppatore:** con una copia del repository su questo ramo:

\`\`\`sh
python3 -m http.server 8128
\`\`\`

Aprire \`http://localhost:8128/prototype/ia-v1/index.html?lang=it#/\`.

Le route dimostrative rimangono all'interno della sola pagina e supportano deep link del tipo:

- \`?lang=it#/capire\`
- \`?lang=it#/esplorare\`
- \`?lang=it#/storie\`
- \`?lang=it#/round\`
- \`?lang=it#/ricerca\`
- \`?lang=it#/guida-accesso\`
- \`?lang=it#/nota-conteggi\`
- \`?lang=it#/test\`

Il sito pubblico è deliberatamente **separato** dal prototipo: nessuna route nuova è inserita in sitemap, nessun redirect è attivato, nessun permalink esistente è sostituito.

## Verifica tecnica

\`\`\`sh
node --check prototype/ia-v1/app.js
node prototype/ia-v1/qa.cjs
node prototype/ia-v1/build-standalone.cjs --check
\`\`\`

Un workflow sul ramo \`.github/workflows/ia-prototype.yml\` esegue inoltre Chromium + controlli WCAG A/AA, rotte in quattro lingue, mobile e desktop, disclosure, selettore lingua e tema, e salva screenshot e rapporti come artifact.

**Attenzione:** verifiche browser automatiche ≠ test di comprensione con utenti. Non dichiarare la UX validata fino alle prove con partecipanti esterni definite in \`docs/IA_VALIDATION_AND_ROLLOUT.md\`.

## Criteri del prototipo

- **Separazione delle entità:** TLD ≠ stringa ≠ candidatura ≠ record APS.
- **Una sola fonte scientifica:** il prototipo rinvia agli strumenti di produzione e conserva stato e provenienza delle osservazioni.
- **Riclassificazione senza rinominare URL:** la guida generale sulle sanzioni rimane collegabile dal suo indirizzo \`behind-the-round\` ma viene concettualmente classificata in Capire.
- **Lettura progressiva:** sintesi, spiegazione, fonti. Non due siti né un interruttore globale obbligatorio.
- **Accessibilità:** link reali, menu e disclosure usabili da tastiera, ancore stabili, leggibilità e supporto del tema scuro.
- **Sicurezza:** niente scritture su \`main\`, niente cambi ai tag RR1/RR2, nessuna raccolta o invio di dati degli utenti.

## Scope e limiti dell'esperimento

I numeri 2026 nelle due pagine pilota derivano dal corpus documentato della baseline e restano esplicitamente datati. I riferimenti esterni possono mutare dopo la data di osservazione. Quando si implementerà la nuova IA nel progetto reale, le schede dovranno usare il registro contenuti canonico e non duplicare la prosa come fa, inevitabilmente, una demo autonoma.

**Next decision gate:** confronto umano, con metriche e osservazioni, tra la UI corrente e questa architettura. Nessuna migrazione a produzione soltanto perché il prototipo supera i test tecnici.
