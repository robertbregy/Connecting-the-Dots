# Audit dell'architettura informativa | Connecting the Dots

**Stato:** diagnosi documentale e del codice, senza modifiche al sito.
**Data:** 12 ottobre 2026.
**Baseline esaminata:** ramo main, commit ec231cc12d35fa91ff5340ad057a483ce23a5ca4, versione tecnica 0.7.78.
**Ambito:** architettura informativa, tassonomia, percorsi, coerenza editoriale, interfacce e debito di navigazione. Non è un test di usabilità con persone né un audit WCAG eseguito in questa fase.

## 1. Perimetro verificato

- 21 sezioni di primo livello nella pagina principale (src/index.web.html).
- 26 voci di collegamento nel menu desktop, distribuite fra 3 accessi diretti e 4 gruppi a tendina; la stessa sezione può comparire più volte con ancore diverse.
- 113 occorrenze strutturali di pannelli nella pagina sorgente, incluse sottosezioni e pannelli annidati; è una misura del livello di articolazione, non un conteggio di articoli.
- 39 URL canonici nel sitemap, tutti associati a file HTML presenti nel repository. Il file index.html alla radice rappresenta un ulteriore ingresso/alias non censito come URL canonico separato.
- Quattro lingue nel portale principale e nelle pagine del processo 2026 e dell'Atlante candidature; explorer/index.html, research/index.html e il working paper HTML sono attualmente ingressi autonomi in inglese.
- Il codice comprende un'applicazione in-page a schede, pagine autonome generate da script specifici, dataset scientifici, versioni archiviate e almeno tre diversi tipi di esperienza interattiva.

Le cifre descrivono la baseline del repository al commit indicato, non un test live della pubblicazione GitHub Pages.

### Famiglie di URL pubblicate nel sitemap

| Famiglia | URL | Oggetto editoriale |
| --- | ---: | --- |
| /{en,it,de,fr}/ | 4 | Portale e 21 sezioni per lingua |
| /applications/{en,it,de,fr}/ | 4 | Atlante applicazioni ICANN 2026 |
| /inside-the-round/{en,it,de,fr}/ | 4 | Cronologia 2026 |
| /behind-the-round/{en,it,de,fr}/ | 4 | Raccolta Note dal campo |
| /behind-the-round/{lang}/objectors-eoi/ | 4 | Nota / indagine sul processo 2026 |
| /behind-the-round/{lang}/replacement-strings/ | 4 | Nota / indagine sul processo 2026 |
| /behind-the-round/{lang}/wdo-identity/ | 4 | Caso specifico .wdo |
| /behind-the-round/{lang}/sanctions-and-dns/ | 4 | Guida generale alle sanzioni e al DNS |
| /behind-the-round/{lang}/who-controls-internet-access/ | 4 | Guida generale sul controllo dell'accesso |
| /explorer/ | 1 | Pagina introduttiva autonoma (EN) |
| /research/ | 1 | Pagina scientifica autonoma (EN) |
| /research/connecting-the-dots-working-paper-v1.html | 1 | Working paper autonomo (EN) |
| **Totale** | **39** | |

### Inventario delle 21 sezioni del portale

| ID sorgente | Contenuto identificato | Funzione prevalente | Collocazione concettuale proposta |
| --- | --- | --- | --- |
| overview | Home, domande, simulazione Internet | Onboarding | Inizio / Capire |
| explore | TLD Explorer, schede, accesso all'Atlante | Strumento | Esplorare |
| timeline | Archeologia delle candidature, 2000/2004/2012/2026 | Storia / dataset | Esplorare > Storia |
| how | Definizioni, ruoli, procedure, registrazione, governance, glossario, esempi .lugano | Guida trasversale | Capire + link contestuali |
| beyond | DNS invisibile, IDN, universi alternativi | Guida / approfondimento | Capire / Storie |
| cities | City TLD e ruolo pubblico | Tema | Storie e questioni > Città |
| geography | Potere, mappa, operatori, concentrazione | Tema analitico | Storie e questioni > Geografia |
| economics | Meccanismi economici, cicli, cimitero dei gTLD | Tema analitico | Storie e questioni > Economia |
| social | Casi sociali, comunità e linguaggi | Tema analitico | Storie e questioni > Società |
| contention | Candidature concorrenti, contese di stringhe | Meccanismo / casi | Storie e questioni > Concorrenza |
| refusals | Esiti, scarti e casi di candidature non riuscite | Meccanismo / casi | Storie e questioni > Esiti |
| disputes | Controversie di governance e obiezioni | Meccanismo / casi | Storie e questioni > Controversie |
| strange | Stranezze, derive e anomalie | Raccolta narrativa | Storie e questioni > Curiosità |
| reveal | Dati e contesto del Reveal Day 2026 | Evento / fotografia temporale | Il round 2026 |
| inside-round | Cronologia e osservazione partecipante | Serie temporale | Il round 2026 > Cronologia |
| behind-round | Note dal campo e link alle indagini | Serie editoriale | Il round 2026 > Note dal campo |
| lugano | Stato candidatura, visione, precauzioni e domande | Caso di studio trasversale | Il round 2026 + Storie > Città |
| research | Identità scientifica, RR2, DOI, metodi | Metaricerca | Ricerca |
| paper | Presentazione e accesso al working paper | Documento | Ricerca > Paper |
| resources | Risorse, dataset e download | Materiali | Ricerca > Dati e download |
| sources | Metodologia, provenienza, revisioni e correzioni | Metaricerca | Ricerca > Metodo e fonti |

## 2. Diagnosi: problemi distinti dalle ipotesi

### P1. Sovrapposizione di principi di navigazione — verificata strutturalmente

La navigazione combina strumenti (Explorer), processi (round), temi (Economia), contenuti editoriali (Field Notes), documenti (Paper) e pagine di metodo (Fonti). Questo obbliga spesso il lettore a conoscere la logica interna del progetto prima di scegliere un percorso.

### P1. Distinzioni di oggetto che richiedono una grammatica comune

TLD delegato, stringa richiesta, candidatura (Application ID), applicant e riga APS sono entità differenti. Il nuovo Application Atlas è corretto nel distinguere base ID e record alternativi, ma convive con TLD Explorer e Application Archaeology, ciascuno con un punto d'ingresso e una prospettiva differente. Occorre rendere esplicito quando si passa da una stringa a una candidatura e a un TLD effettivamente delegato.

### P1. Ridondanza di ingressi scientifici e rischio di riferimenti non aggiornati

Il portale contiene research, paper, resources e sources; esistono anche /research/ e il paper autonomo. **Evidenza puntuale da verificare prima di correggere:** /research/index.html e il working paper HTML contengono un collegamento al data pack v0.7.77, benché nel repository sia presente il data pack v0.7.78. docs/READER_TASKS.md cita v0.7.77; research/README.md descrive ancora il sito tecnico v0.7.75. Potrebbero essere riferimenti storici intenzionali solo dove esplicitamente dichiarati tali; non aggiornare automaticamente RR1/RR2 o citazioni congelate.

### P2. Guide generali collocate nella raccolta di osservazione sul round — verificata

Le guide sulle sanzioni e sul controllo dell'accesso a Internet sono attualmente ospitate sotto /behind-the-round/{lang}/. Sono contenuti di governance trasversali, non Field Notes datate su un episodio singolo. L'indirizzo storico non va cancellato: separare appartenenza concettuale e URL fisico.

### P2. Confini tematici che oggi dipendono dal lettore

- Timeline dell'archeologia delle candidature vs Cronologia del round 2026.
- Città vs Geografia / concentrazione.
- Economia introduttiva nel percorso Come funziona vs sezione Economia.
- Concorrenza di stringhe (contention) vs Controversie (disputes) vs Esiti/Scarti (refusals).
- Metodologia nel portale vs pagina di ricerca autonoma.
Sono separazioni in buona parte scientificamente utili; il problema non si risolve fondendo dati differenti ma spiegando le relazioni.

### P2. Trattamento delle lingue nelle pagine autonome

La pagina principale è localizzata in quattro lingue; le pagine /explorer/ e /research/ e il working paper HTML restano ingressi autonomi in inglese. Non è un errore automatico, ma richiede segnali di lingua e ritorno al percorso originario chiari. Non inventare traduzioni scientifiche senza revisione.

### Non ancora accertato con utenti

- Quali voci risultano incomprensibili agli inesperti.
- Se un interruttore globale Base/Avanzato migliori o peggiori la scoperta.
- Il tasso di fallimento dei cinque compiti utente.
- Tempi, confusione, backtracking, accessibilità cognitiva e fluidità nella navigazione mobile.

Il repository dispone di test browser e WCAG, ma non costituiscono prove di comprensione con persone. Questo documento non afferma che tali test siano stati eseguiti qui.

## 3. Tassonomia minima proposta

Ogni oggetto deve avere un **tipo primario stabile**, più molteplici contesti editoriali; le etichette di tema non devono sostituire il tipo dell'oggetto.

| Tipo | Identità canonica | Confusione da evitare |
| --- | --- | --- |
| TLD | Nome + storia della delega | Non tutte le stringhe richieste sono TLD |
| Stringa | Etichetta DNS normalizzata | Non equivale a una singola candidatura |
| Candidatura | Round + Application ID originale | Un record sostitutivo -R non è una nuova candidatura |
| Soggetto | Identificativo + fonti, se disponibile | Applicant non sempre equivale a registry/operator |
| Evento | Tipo + timestamp + fonte | Uno snapshot non equivale a una transizione provata |
| Caso | ID editoriale + oggetti e fatti collegati | Contesa, obiezione, fallimento e controversia non coincidono |
| Guida | ID editoriale + argomento | Un explainer non è automaticamente una Field Note |
| Field Note | Episodio + data + stato evidenze | Osservazione non equivale a certezza conclusiva |
| Fonte / release | ID + versione o data + provenienza | Versione sito, dataset e Research Release hanno identità differenti |

Tutti i contenuti devono mantenere etichette epistemiche coerenti (FACT, READING, VISION; ignoto/non verificato dove necessario).

## 4. Priorità operative

1. Definire classificazione, responsabilità e relazioni per ogni famiglia di contenuto, senza spostare file.
2. Prototipare una navigazione orientata a cinque compiti: capire, trovare, distinguere, interpretare, citare.
3. Progettare una testata e una pagina tipo che conservino tre densità di lettura: sintesi, spiegazione, fonti.
4. Validare in un test comparativo reale prima di promuovere cambiamenti UI.
5. Preparare una matrice URL / ancore / hreflang / SEO / link verso i dataset / DOI prima di qualunque migrazione.

## 5. Fonti interne controllate

- src/index.web.html, data/translations.json e data/manifest.json
- sitemap.xml, package.json e build.py
- applications/it/index.html, inside-the-round/it/index.html e behind-the-round/it/**/index.html
- explorer/index.html, research/index.html e research/connecting-the-dots-working-paper-v1.html
- docs/READER_TASKS.md, docs/PUBLISHING_SAFETY.md, docs/APPLICATION_ATLAS_2026.md
- .github/workflows/rebuild.yml e .github/workflows/audit-browser.yml

**Divieto operativo:** nessun cambiamento a main, ai dati o alle release RR1/RR2 sulla base di questo solo audit.