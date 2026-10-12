# IA Lab | Primo feedback esterno sul confronto A/B

**Data di ricezione:** 12 ottobre 2026  
**Status:** osservazioni ricevute, diagnosi editoriale, nessuna modifica a produzione.  
**Versioni testate:** A = sito pubblico, B = prototipo IA Lab autonomo.  
**Origine dei riscontri:** una scheda nelle fotografie (pagine 2 e 3), una scheda PDF compilata digitalmente (pagine 1-3). Gli originali non sono archiviati qui.  
**Cautele:** sono due **compilazioni**, ma non è accertato che appartengano a due persone differenti. Entrambe registrano ordine A→B; esiste rischio di apprendimento. Campione non rappresentativo, nessuna inferenza statistica.

## 1. Voti dichiarati

| Criterio (scala 1-5) | Foto A | Foto B | PDF A | PDF B |
| --- | ---: | ---: | ---: | ---: |
| Capire da dove iniziare | 3 | 5 | 3 | 5 |
| Trovare pagina/informazione | 3 | 5 | 3 | 5 |
| Comprendere menu e termini | 5 | 4 | 3 | 3 |
| Distinguere spiegazioni, dati, fonti | 4 | 4 | 3 | 3 |
| Ritrovare orientamento dopo un link | 5 | 5 | 3 | 4 |
| **Totale descrittivo, non indicatore scientifico** | **20/25** | **23/25** | **15/25** | **20/25** |

**Preferenza globale:**
- Foto: «dipende dal compito».
- PDF: B.

La foto mostra valutazioni molto buone della navigazione attuale e inferiori del nuovo menu: non è un'approvazione incondizionata di tutte le scelte della versione B.

## 2. Esito dichiarato dei cinque compiti

| Compito | Foto A | Foto B | PDF A | PDF B |
| --- | --- | --- | --- | --- |
| 1. .com e dominio registrato | Parziale | Trovato | Parziale | Trovato |
| 2. Caso .lugano | Trovato | Trovato | Trovato | Trovato |
| 3. Conteggi 1615, 1614, 2783 | Parziale | Trovato | Non trovato | Trovato |
| 4. Blocchi DNS e Internet | Parziale | Parziale | Trovato | Trovato, con passaggio ad A |
| 5. DOI RR2 vs versione tecnica | Trovato | Trovato | Parziale | Trovato |

**Nota di lettura:** la scheda fotografata usa grandi croci che in alcuni casi si sovrappongono a più parole. La tabella indica la categoria sulla quale appare centrata la croce. L'incertezza interpretativa non deve essere eliminata da una trascrizione troppo sicura. Il PDF usa indicazioni più esplicite con note testuali e permette una lettura più sicura.

### Commenti testuali della scheda PDF

1. **Spiegazione iniziale:** «In A viene spiegato cosa è un TLD ma non viene spiegato con chiarezza che quello che c'è prima di ".com" è il dominio registrato. In B lo trovi subito.»  
   Interpretazione: rafforzare la spiegazione concreta `www.example.com` in A. La formulazione scientificamente precisa è: `.com` = TLD; `example.com` = dominio registrato; `www` = label del nome host (spesso sottodominio).

2. **Conteggi:** «trovo in B i dati numerici, in A solo 1'615, ma trovo la spiegazione della differenza di un'unità».  
   Interpretazione: problema di reperibilità e presentazione congiunta delle unità di misura, non prova dell'assenza dei dati nelle fonti del sito A. Esplicitare date, natura degli snapshot, causa non confermata dell'eventuale passaggio 1616→1615, differenza fra 1615 ufficiali, 1614 Application ID pubblicati e 2783 righe incluse le alternative -R.

3. **Blocchi:** «B rimanda ad A».  
   Interpretazione: B è un prototipo di architettura con handoff a contenuti canonici. Il compito «trovato in B» NON implica che sia stato completato senza consultare A: non usare questi riscontri per rivendicare che il nuovo sistema sia già integralmente autosufficiente.

4. **Citazione RR2:** «in A complicato da trovare, in B trovato subito».  
   Interpretazione: nella versione attuale, mantenere DOI e distinzione release scientifica / versione tecnica direttamente reperibili dal percorso Ricerca e da dove il lettore si attende un riferimento bibliografico.

## 3. Diagnosi: che cosa funziona e cosa no

### Segnali robusti a livello descrittivo (presenti in entrambe le compilazioni)

- Il primo orientamento e la reperibilità del contenuto cercato hanno valutazioni migliori in B.
- La spiegazione puntuale di cosa sia un TLD e la sintesi delle tre quantità 2026 risultano più direttamente reperibili in B.
- Il compito .lugano è trovato in entrambe le versioni, quindi non mostra alcun vantaggio chiaro di B.
- La differenza fra «contenuto nella B» e «link dalla B a un contenuto in A» deve essere sempre dichiarata.

### Segnali discordanti o insufficienti

- **Menu e termini:** foto A 5/5 e B 4/5; PDF A 3/5 e B 3/5. Nessuna prova che il nuovo menu sia globalmente superiore; preservare le scorciatoie e la navigabilità esistenti.
- **Distinzione spiegazioni/dati/fonti:** parità in entrambe le schede, sia pure con voti diversi fra le compilazioni. La nuova interfaccia non ha ancora dimostrato un guadagno.
- **Riorientamento:** parità 5/5 nella foto, B +1 nel PDF. Non sufficientemente provata una superiorità stabile.
- **Compito 4:** fotografia giudica entrambi parziali; PDF giudica entrambi trovati, ma specifica handoff da B ad A.
- **Preferenza globale:** foto «dipende dal compito» e PDF «B». Nessun consenso univoco o validazione dell'intero redesign.

## 4. Implicazioni sul backlog (non implementate per effetto di questo file)

**IA-BETA-01 (P0):** in A/Capire, mostrare subito il parsing di `www.example.com` e la differenza tra TLD e dominio registrato, senza rimuovere il percorso Internet già riuscito.

**IA-BETA-02 (P0):** in A/Round 2026 o nel ponte verso la Nota dal campo, offrire un riquadro con 1615, 1614 e 2783, unità e date esplicite, link a fonte ICANN e spiegazione dello stato delle verifiche. No causalità inventate.

**IA-BETA-03 (P0):** offrire accesso immediato al DOI versione RR2 e alla distinzione rispetto alla versione tecnica, senza confondere il sito che evolve con la release scientifica congelata. Verificare prima eventuali riferimenti storici.

**IA-BETA-04 (P1):** etichettare «apre il sito completo» / «apre la fonte originale» nei passaggi prototipo→produzione; preservare lingua e contesto e offrire una via chiara di ritorno.

**IA-BETA-05 (P1):** prima di eliminare menu/ancore attuali, confrontare ogni scorciatoia con il nuovo percorso e non aumentare arbitrariamente i clic per esperti o visitatori occasionali.

**IA-BETA-06 (P1):** rafforzare terminologia della distinzione FACT / READING / VISION e controllo fonti: il questionario non mostra ancora miglioramento.

**IA-BETA-07 (P2):** rivedere il modulo per la prossima tornata: assegnare ordine A/B controbilanciato, permettere «sono passato da B ad A» esplicito, chiedere un esempio concreto obbligatorio di difficoltà, distinguere dispositivi effettivamente utilizzati, lasciare opzione «non applicabile / non so» e non chiedere risposte orientate.

## 5. Raccomandazione

Non procedere con un redesign totale sulla base di due sole compilazioni. **Continuare un'IA comune, ma integrando prima gli interventi ad alto rapporto beneficio/rischio nel progetto attuale**, preservando i permalink, i dati, le release scientifiche e le scorciatoie. Trattare le risposte come segnalazioni qualitative di reperibilità, non come un esperimento controllato.

**Stato di sicurezza:** questo documento non modifica `main`, le pagine del sito o i dataset; nessuna release pubblicata.
