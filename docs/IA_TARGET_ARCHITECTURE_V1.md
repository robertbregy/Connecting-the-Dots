# Connecting the Dots — Proposta di architettura dell'esperienza (IA v1)

**12 ottobre 2026 · Design hypothesis · NON IMPLEMENTATA**
**Baseline:** main ec231cc12d35fa91ff5340ad057a483ce23a5ca4 · v0.7.78
**Vincolo:** un solo patrimonio scientifico, molte porte di accesso. Non creare due siti o duplicare i dataset.

## 1. North star

Un lettore che non conosce ICANN deve poter capire in pochi passaggi che cosa sta guardando; un ricercatore deve poter identificare fonte, unità di analisi, limiti e citazione senza perdere la precisione originaria. La semplicità non equivale a nascondere la complessità; equivale a rivelarla quando serve.

## 2. Navigazione proposta (etichette provvisorie)

1. **Capire** — Internet/DNS in pochi passaggi; che cos'è un TLD; ruoli e ciclo di vita; processo di candidatura; termini precisi; guide su accesso a Internet e sanzioni.
2. **Esplorare** — TLD Explorer; candidati e stringhe; Application Atlas 2026; archeologia 2000/2004/2012; storia ed eventi, profili e ricerca per oggetto.
3. **Storie e questioni** — Economia; Società; Città e territori; Geografia e potere; Contese; Esiti e rifiuti; Controversie; Curiosità. Facette tematiche e collegamenti agli oggetti dell'Atlante.
4. **Round 2026** — Panoramica, statistiche e snapshot; Cronologia; Note dal campo; .lugano, osservazione e limiti di ruolo.
5. **Ricerca** — Metodo; status delle evidenze; dataset, manifesti e data pack; lavoro scientifico e versioni RR1/RR2; DOI e citazioni; correzioni.

La Home non è una sesta biblioteca: è un instradatore a cinque scopi, con tre domande iniziali («Voglio capire», «Cerco un nome o una candidatura», «Cerco una storia / una fonte»). La tassonomia è basata sullo SCOPO; le facette («TLD», «società», «città», «2026») sono secondarie e trasversali.

## 3. Due profondità, non due mondi

**Non introdurre ora il toggle globale Base/Avanzato.** Prima testare la progressive disclosure in due pagine pilota.

- **In breve**, sempre visibile, da 60 a 110 parole: domanda, risposta, avvertenza critica.
- **Capire meglio**, spiegazione orientata a esempi, definizioni linkate e collegamenti agli oggetti.
- **Verificare**, dati, fonti primarie, snapshot, metodologia, cronologia delle revisioni e note sulle incertezze.

Questi tre blocchi non impongono il livello di competenza. Devono essere accessibili dalla tastiera e tramite URL/ancore stabili; la sintesi non può negare o semplificare impropriamente lo stato delle prove. Indicizzabilità e accessibilità devono essere conservate. Non rendere opache le fonti via JS.

## 4. Componente minimo per le pagine editoriali

- Titolo + etichetta del TIPO («Guida», «Nota dal campo», «Caso», «Analisi»).
- Domanda del lettore, risposta in breve, stato delle evidenze.
- Corpo principale con titoli e indice contestuale se necessario.
- «Cosa sappiamo / Cosa non sappiamo» per casi con dati incompleti.
- Fonti originali e data di osservazione; versione/editorial revision.
- «Esplora gli oggetti collegati»: uno stesso TLD può condurre a candidature, casi, temi e serie storiche.
- Navigazione gerarchica accessibile, link al contesto primario e ai contenuti correlati.
- Stato FACT / READING / VISION semantico, non ridotto al solo colore.

Template diversi per strumenti: Explorer, Atlas, simulazione e paper conservano esigenze UX distinte. Non imporre un template di articolo a interfacce interattive.

## 5. Esempi di riclassificazione, senza cambiare URL

| Oggetto | Categoria primaria nuova | Ulteriori accessi |
| --- | --- | --- |
| Sanctions and DNS | Capire > Guide > Governance e sanzioni | Round 2026 > Note correlate; Controversie |
| Who controls Internet access? | Capire > Guide > Filtri e controllo accesso | Società; Controversie; Simulazione |
| Reveal count discrepancy | Round 2026 > Note dal campo | Atlante 2026; Metodo > Snapshot |
| .wdo identity | Round 2026 > Note dal campo | Candidatura .wdo; Controversie (senza suggerire disputa accertata) |
| Objectors EOI issue | Round 2026 > Note dal campo | Processo ICANN; Governance |
| Replacement strings | Round 2026 > Note dal campo | Application Atlas > Replacement; Glossario |
| .lugano | Round 2026 > Caso .lugano | Città; Applicant; candidatura |
| Cimitero gTLD | Storie e questioni > Economia > Cicli | Esiti; Storia |
| RR2 | Ricerca > Release scientifiche | Paper; Citazione; Dataset |

**Regola canonica:** una pagina ha una classificazione primaria ma può comparire in più percorsi e raccolte. Non duplicare il testo e non distruggere i permalink esistenti. Fare il mapping logico prima di decidere redirect fisici.

## 6. Modello dati relazionale minimo

```text
TLD (identità storica) --events--> Evento di delega/ritiro
Stringa (etichetta) --requested_by--> Candidatura (round + base application ID)
Candidatura --applicant--> Soggetto
Candidatura --replacement_or_variant--> Stringa alternativa/variant
Caso --about--> [TLD | Stringa | Candidatura | Soggetto | Evento]
Articolo --about--> [Caso | Evento | Tema]
Tutti --supported_by--> Fonte (data + tipo + URL)
Snapshot --records--> osservazioni datate
Ricerca --cites--> [dataset snapshot | research release]
```

Implementazione futura: registro dei contenuti con `content_id`, `content_type`, `title_i18n`, `summary_i18n`, `canonical_url_by_lang`, `primary_area`, `topics`, `related_ids`, `source_ids`, `reviewed_at`, `evidence_state`, `status`, `last_observed_at`. Preferire riferimenti stabili ai join fatti con testi visualizzati. Separare i record ufficiali dalle interpretazioni editoriali.

## 7. Sicurezza del redesign

- Non alterare dati ufficiali ICANN/IANA, conteggi o provenienza come parte della migrazione UI.
- RR1/RR2, tag e DOI restano immutati. Le site release `0.x` restano distinte.
- Congelare mapping di tutti i 39 URL pubblicati e di ogni ancora/parametro `tab` realmente utilizzato; fare redirect solo dopo verifica del supporto effettivo su GitHub Pages.
- Migrazione progressiva: prima navigazione e collegamenti, poi template pilota, infine eventuale nuovo modello relazionale.
- Nessuna perdita di contenuto: misurare per ogni pagina la presenza di paragrafi, fonti, evidenze, relazioni e scaricamenti prima/dopo.
- Copertura mobile, tastiera, screen reader, contrasto, i18n e canonical/hreflang.
- Confrontare tempi, errori di interpretazione e tassi di riuscita con la baseline originale tramite cinque compiti reali.
- Release su `main` soltanto dopo QA, review esplicita e rollback pronto. Le sole modifiche a documentazione `docs/IA_*` non richiedono rebuild della pubblicazione.

## 8. Criteri di scelta tra opzioni

Confrontare **A: architettura attuale**, **B: nuova navigazione con disclosure per pagina**, **C: B più vero switch globale**. Preferire B finché C non dimostri un vantaggio misurabile e non introduca complessità di stato, percorsi SEO o accessibilità. Un mockup piacevole non è una prova di facilità d'uso.

## 9. Fuori ambito per questa fase

Non ricostruire tutto in React, non introdurre AI search, non spostare il filesystem, non moltiplicare le pagine, non alterare le versioni scientifiche. Prima classificare e dimostrare un vantaggio per chi legge.
