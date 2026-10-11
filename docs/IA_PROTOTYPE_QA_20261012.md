# IA Lab 01 — registrazione delle verifiche

**Stato del prototipo:** controlli automatici superati; **non validato con utenti reali**.
**Data:** 12 ottobre 2026.
**Main di riferimento:** ec231cc12d35fa91ff5340ad057a483ce23a5ca4, versione tecnica 0.7.78.
**Commit del codice/prototipo testato:** \`5610c42cc9fc42aa0e835e898f8b699597447d01\`.
**Run:** https://github.com/robertbregy/Connecting-the-Dots/actions/runs/38183011984

## 1. Risultati automatici

| Verifica | Risultato | Ambito esatto |
| --- | --- | --- |
| Sintassi e struttura dei contenuti | PASS | Node check + modello delle quattro lingue; nessun missing nei testi e resource keys coperti dal test |
| Vie di navigazione in Chromium | 36 / 36 PASS | Quattro lingue × nove route del prototipo, ai viewport definiti dallo script |
| Accordion / progressive disclosure | 8 / 8 PASS | Due pagine pilota × quattro lingue, spiegazione e fonti espandibili |
| Audit axe WCAG A/AA | 24 / 24 PASS | Quattro lingue × Home + due articoli pilota × due temi chiaro/scuro |
| Interazione mobile, lingua, navigazione e tema | PASS | Ritorno sulla route dopo cambio lingua, selezione tab, tema scuro |
| HTML autonomo \`standalone.html\` | PASS | Build deterministica di CSS+JS inclusi e test Chromium della pagina autonoma |
| Errori rilevati nell'ultimo run | 0 | Browser, scanner e QA di regressione specifica del prototipo |

**Copertura dei viewport:** il suite attuale usa mobile a 390 px per IT/FR e desktop a 1440 px per EN/DE nella matrice delle 36 route. Non affermare che ogni combinazione lingua × dimensione × tema sia stata testata esaustivamente. Screenshot di quattro casi campione disponibili nell'artifact dell'esecuzione.

## 2. Difetti trovati e corretti

1. **Overflow mobile dell'header (390 px):** etichetta IA Lab e controlli in una riga troppo larga; corretta la versione mobile della testata.
2. **Harness Axe:** lo scanner richiedeva contesti Chromium espliciti anziché \`browser.newPage()\` diretto; corretto il test, non il sito.
3. **Contrasto del breadcrumb e del tag IA Lab:** piccoli testi insufficientemente leggibili nelle combinazioni iniziali; aumentato il contrasto.
4. **Contrasto durante il cambio di tema:** una transizione CSS breve dei pulsanti produceva colori intermedi con rapporto insufficiente. Eliminata la transizione non necessaria, quindi superato anche lo scan a tema scuro.
5. **Accessibilità i18n:** etichette screen-reader della navigazione e del tema aggiornate coerentemente quando cambia la lingua.
6. **Pacchetto standalone:** fonte e file autonomo tenuti identici con generazione riproducibile e controllo \`--check\`.

I run falliti durante lo sviluppo documentano i problemi, ma non vanno confusi con lo stato dell'ultima esecuzione.

## 3. Materiale prodotto

- \`prototype/ia-v1/index.html\` — scheletro HTML.
- \`prototype/ia-v1/styles.css\` — stili responsive e light/dark.
- \`prototype/ia-v1/app.js\` — quattro lingue, cinque aree, contenuti pilota e route.
- \`prototype/ia-v1/standalone.html\` — file HTML autonomo da scaricare e aprire localmente.
- \`prototype/ia-v1/build-standalone.cjs\` — generatore deterministico.
- \`prototype/ia-v1/qa.cjs\` — test statici, relazioni e i18n.
- \`prototype/ia-v1/browser-qa.cjs\` — test Chromium, WCAG e screenshot.
- \`.github/workflows/ia-prototype.yml\` — job isolato al ramo.

Le istruzioni d'uso sono in \`prototype/ia-v1/README.md\`. L'artifact del run contiene screenshot e \`audit-ia/report.json\`.

## 4. Criticità che i test automatici NON risolvono

- La comprensibilità reale delle cinque aree per un visitatore inesperto.
- La capacità dell'utente di distinguere una stringa da un'Application ID senza aiuto.
- Il rischio di confondere campo osservativo, guida generale e controversia ICANN.
- La capacità di citare una Research Release senza confonderla con la versione software.
- Il confronto misurato dei task con la navigazione della v0.7.78.

Questi punti richiedono prove indipendenti con persone, secondo \`docs/IA_VALIDATION_AND_ROLLOUT.md\`. I cinque task non sono stati somministrati a partecipanti reali.

## 5. Cancello di rilascio

**Non promuovere su main** sulla sola base di questi test tecnici.

Prima di una futura migrazione: osservazione con utenti e confronto baseline/prototipo, mappa permalink e ancore, protezione canonical/hreflang, nessuna perdita di contenuti, controllo dei link ai dati, sostanziale separazione fra tecnico e scientifico e piano di rollback.

RR1, RR2 e la v0.7.78 pubblicata rimangono fuori scope del prototipo.
