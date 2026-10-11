# IA Lab 02 · Cognitive walkthrough con otto personas simulate

**Valutazione del 12 ottobre 2026.** Baseline: pubblicazione tecnica v0.7.78, commit `ec231cc12d35fa91ff5340ad057a483ce23a5ca4`. Prototipo sul ramo `feat/ia-rearchitecture-20261012` e non pubblicato su `main`.

> **Limite metodologico vincolante:** le personas sono ruoli e modelli mentali costruiti dall'assistente, non persone reclutate. Non ci sono partecipanti umani, osservazioni naturali, tempi di completamento reali, interviste o punteggi di soddisfazione. I risultati dei browser script dimostrano soltanto stati e percorsi deterministici scelti a priori. Le difficoltà attese sono **inferenze euristiche**, non frequenze empiriche.

## Metodo

1. Estrarre dal sorgente reale il menu, i contenuti e le rotte della versione tecnica attuale.
2. Fissare otto profili con esigenze, linguaggio e dispositivi differenti, includendo prove contrarie alla nostra stessa ipotesi di redesign.
3. Percorrere con Chromium le route del prototipo e registrare link, testo di risposta, focus e visibilità delle voci; confrontare le possibilità della baseline senza giudicare le persone immaginarie come se fossero partecipanti.
4. Tenere separati: **F** fatti osservabili; **I** inferenze sul comportamento di un principiante/esperto; **D** decisioni progettuali proposte.
5. Nessuna percentuale di successo utenti; eventuali numeri si riferiscono soltanto a elementi DOM o test automatici.

Tracce script registrate in `audit-ia/persona-probes.json`, prodotte da `prototype/ia-v1/persona-probes.cjs` su GitHub Actions run [38183350336](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/38183350336). I file di baseline sono definiti separatamente in `prototype/ia-v1/baseline-probes.cjs`; non equiparare un percorso pilotato dal test a una scoperta spontanea.

## 1. Otto personas: diagnosi comparativa

### P01 · Curioso occasionale, smartphone, italiano

- **Compito:** «Cos'è il punto finale di .com in un indirizzo?»
- **F:** nella baseline il percorso interattivo «Dietro un clic» è già raggiungibile direttamente dalla Home. Nel prototipo iniziale Home → Capire mostrava una *card* «Internet in pochi passi» che rinviava alla spiegazione nel sito originale.
- **I:** la nuova etichetta è probabilmente più intuitiva, ma aveva aggiunto uno schermo intermedio. Un principiante non cerca una biblioteca di risorse; vuole una risposta immediata.
- **D / modifica già applicata al ramo:** aggiunta nella pagina Capire una risposta autonoma e corretta su `www.example.com`, con invito all'esperienza completa. La Home → Capire diventa un percorso utile anche senza abbandonare il prototipo.
- **Residuo:** il vero simulatore Internet resta nel sito pubblico, perché questo è un esperimento di IA, non una migrazione completa.

### P02 · Studente che cerca di distinguere concetti, smartphone, italiano

- **Compito:** «Una candidatura per .lugano significa che .lugano esiste già come TLD?»
- **F:** il prototipo mostra esplicitamente una relazione fra stringa, candidatura identificata e stato di delegazione, oltre a quattro definizioni. La prima simulazione ha riscontrato tutti e tre i nodi del percorso e tutte e quattro le schede definitorie.
- **I:** rendere la distinzione visibile nel punto di ingresso dovrebbe ridurre la confusione concettuale. Ma una freccia fra entità può sembrare una sequenza già completata: bisogna mantenere «non accertata» e ricordare che una stringa può avere più candidature.
- **D:** conservare il modello a entità; non permettere a una scheda TLD di diventare sinonimo di application o stringa.

### P03 · Giornalista che confronta conteggi, desktop, italiano

- **Compito:** «Perché ICANN dice 1.615 e l'elenco pubblico conta 1.614? Che cosa sono le 2.783 righe?»
- **F:** il percorso prototipo Menu → Round 2026 → Nota sui conteggi ha due interazioni; il testo breve distingue 1.616 (22 settembre), 1.615 (Reveal Day), 1.614 base ID e 1.169 record alternativi. Fonti ed evidenze si espandono separatamente.
- **I:** la lettura progressiva funziona bene per un articolo giornalistico: la prima risposta impedisce una conclusione falsa, i dettagli sono disponibili per la verifica.
- **D:** conservare lo stato «irrisolto» per la transizione 1.616 → 1.615. Non attribuire la differenza a OFAC, .wdo o errori amministrativi senza prova. Non trattare righe APS come candidature.
- **Residuo:** il lettore deve tornare alla pagina originaria per la cronologia completa delle revisioni; la demo non è la fonte canonica.

### P04 · Professionista DNS/ICANN, desktop, inglese

- **Compito:** «Apri l'Application Atlas 2026 e distingui Application ID, sostituzioni e varianti».
- **F:** il prototipo offre Menu → Explore → Application Atlas, poi apre la pagina `/applications/en/` del sito corrente. La baseline possiede già Explorer e collegamento all'Atlante.
- **I:** il raggruppamento degli strumenti è più coerente, ma il tempo/numero di passaggi end-to-end **non è dimostrato migliore**. L'interfaccia cambia a metà percorso e manca un contesto/breadcrumb comune.
- **D:** priorità alla continuità fra Explorer, Application Atlas e Archaeology, con identità dei record stabili e navigazione di ritorno. Non costruire un nuovo Explorer solo per cambiare il menu.

### P05 · Ricercatrice universitaria, desktop, inglese

- **Compito:** «Trova il DOI della release RR2 e distinguilo dalla versione tecnica del sito».
- **F:** il primo prototipo mostrava la *card* RR2, ma **non** il DOI nella pagina Ricerca; lo strumento aveva verificato `doiVisibleOnArea=false`. La baseline mostra già il DOI specifico di RR2 nella sezione Research, senza dover uscire verso un'altra pagina.
- **I:** sarebbe una regressione senza alcun vantaggio scientifico: nascondere un dato essenziale dietro un clic supplementare peggiora l'esperienza di un ricercatore.
- **D / modifica già applicata:** DOI specifico RR2 `10.5281/zenodo.23288603`, distinzione dalla release tecnica e collegamento al data pack v0.7.78 sono immediatamente accessibili nell'area Ricerca.
- **Residuo:** alcune pagine scientifiche autonome correnti citano ancora il pacchetto tecnico v0.7.77 mentre il v0.7.78 è disponibile. Occorre decidere se sono riferimenti storici deliberati o link da aggiornare; nessuna modifica alle release archiviate RR1/RR2.

### P06 · Docente che cerca controversie, smartphone, francese

- **Compito:** «Trova una disputa importante, verifica chi afferma cosa e controlla una fonte».
- **F:** la baseline mobile espone un selettore gerarchico con **26 opzioni**, compresa Controversies. Il prototipo porta a Histoires & enjeux → contentieux, che rimanda alla pagina tematica in francese. Nel primo prototipo a 390 px solo **2 delle 5** macroaree erano immediatamente visibili senza scorrere lateralmente.
- **I:** meno opzioni riduce il numero di categorie da scegliere, ma passare prima da «Storie» aggiunge un livello rispetto alla scorciatoia nel selettore attuale. Il vantaggio netto è da considerare **non provato**.
- **D / modifica:** mostrare sempre le cinque categorie sul mobile, senza scroll laterale occulto. Conservare accessi diretti a Controversie e Storie dalla Home e dai contenuti correlati.

### P07 · Cittadino interessato a censura e sanzioni, smartphone, tedesco

- **Compito:** «Chi può bloccare una registrazione o rendere irraggiungibile un sito?»
- **F:** nel prototipo il materiale è catalogato in Verstehen → guida accesso / Sanktionen und DNS; la guida generale continua ad avere un URL fisico sotto `behind-the-round`.
- **I:** l'inquadramento tematico generale risulta logicamente più giustificato della collocazione in una serie di osservazioni 2026. Ma il cambio a una pagina autonoma con struttura propria può dare l'impressione di aver lasciato il percorso.
- **D:** attribuire un tipo primario «Guida» e più collegamenti contestuali. **Non** rinominare gli URL pubblici ora: conservare canonical, hreflang e tutti i link esistenti.

### P08 · Lettore che usa la tastiera e tecnologie assistive, smartphone, italiano

- **Compito:** «Vai da Home a Capire e orientati nel nuovo contenuto».
- **F:** il test iniziale ha rilevato che dopo un cambio di route il focus si trovava sul `BODY`, e sul mobile IT solo **3 delle 5** macroaree erano completamente visibili. I precedenti test WCAG standard non avevano intercettato questa esperienza di navigazione.
- **I:** per utenti di tecnologie assistive, perdere il punto di lettura quando cambia una vista è un problema serio.
- **D / modifiche nel ramo:** nuovo focus programmato sull'H1 della vista raggiunta tramite routing; menu mobile con tutte e cinque le destinazioni su due righe. Il test successivo è stato rafforzato con attivazione reale da tastiera e verifica automatica del focus.
- **Limite:** non equivale a una prova svolta da una persona che utilizza quotidianamente uno screen reader.

## 2. Due punti su cui il prototipo NON ha ancora vinto

1. **Meno categorie ≠ meno passaggi.** Per il novizio, l'attuale Home offriva già un accesso diretto al percorso Internet; il prototipo iniziale inseriva un passaggio non necessario. Per chi cerca una controversia il menu mobile attuale permette una selezione diretta, anche se contiene molte opzioni.
2. **Ingresso migliore ≠ continuità end-to-end.** Dal nuovo menu molte voci rimandano a strumenti o articoli della versione corrente. Il prototipo dimostra una classificazione, non una nuova esperienza completa. I passaggi fra strumenti devono preservare lingua, identificatori, posizione, breadcrumb e contesto.

## 3. Esito del confronto euristico

| Dimensione | Giudizio | Confidenza |
| --- | --- | --- |
| Orientamento iniziale per intenzione | Promettente, con cinque aree chiare | Media, solo simulazione |
| Distinzione stringa / candidatura / TLD | Più esplicita nel prototipo | Alta sulla presenza dei contenuti; non sulla comprensione |
| Lettura progressiva delle note | Coerente e rispettosa delle incertezze | Media |
| Percorso completo tra Explorer, Atlas, Archaeology | Non ancora migliorato come sistema | Alta sul fatto che avvengono handoff esterni |
| Ricerca e citazione | Migliorata dopo l'aggiunta del DOI diretto | Alta sulla reperibilità; non sulla soddisfazione |
| Mobile e focus da tastiera | Difetti P0 identificati e corretti nel ramo | Verifica post-correzione da registrare separatamente |
| Modalità globale «Base/Avanzato» | Non giustificata da questa analisi | Alta come scelta prudenziale |

Non esiste un tasso di successo utenti da citare. Otto profili non significano otto visite indipendenti.

## 4. Decisione progettuale raccomandata

**Mantenere la tassonomia a cinque aree, ma non approvare ancora la sostituzione dell'intera navigazione.** Il valore sta nel modello unico di contenuti e relazioni, nel collegamento ai dati canonici e nella possibilità di accedere da domande semplici o da riferimenti scientifici. L'architettura finale deve mantenere scorciatoie esistenti che risultano già efficienti.

**Non introdurre l'interruttore Base/Avanzato globale.** Continuare con sintesi, approfondimento e verifica per singola pagina; consentire agli esperti l'accesso diretto a fonti e identificatori.

## 5. Criteri pratici in assenza di utenti reclutabili

Non bloccare all'infinito il progetto per mancanza di test umani. Procedere con evidenze di qualità diversa, dichiarandone il limite:

1. Walkthrough critico e avversariale multi-persona, senza fingere risposte registrate.
2. Browser test misurabili su scenari reali, con keyboard focus, contrasto, mobile e tutti i quattro idiomi.
3. Controlli di identità di dati e versioni: non confondere applicazioni, stringhe e TLD.
4. Migrazione reversibile per sezioni, con URL invariati; test di non regressione su dataset, fonti, menu e SEO.
5. Sorveglianza post-release di errori tecnici e link, senza interpretarla come misurazione della soddisfazione.

**Produzione:** nessuna modifica autorizzata sulla base della sola simulazione; il ramo resta isolato fino al superamento del QA dell'ultima versione e alla revisione delle regole di migrazione.
