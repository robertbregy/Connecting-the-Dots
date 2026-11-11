<!-- Canonical: https://robertbregy.github.io/Connecting-the-Dots/guides/it/how/ | Site edition: 0.7.109 | Language: it -->

Guida

# Come funziona un nome Internet?

Prima l’indirizzo e gli attori, poi il ciclo di vita, l’economia e le regole. Il glossario resta a portata di mano.

[Esplora nell’atlante](https://robertbregy.github.io/Connecting-the-Dots/it/?tab=how#how) [Metodo e citazione](https://robertbregy.github.io/Connecting-the-Dots/research/) [Versione testuale](https://robertbregy.github.io/Connecting-the-Dots/guides/it/how/index.md)

FATTO

## Come funzionano davvero i domini Internet

I concetti essenziali per orientarsi tra domini, DNS e governance di Internet.

www.example .com

In **www.example.com**, **.com** è il dominio di primo livello (TLD). “example” è l’etichetta di secondo livello; il nome registrato sotto .com è **example.com**. “www” è un’etichetta aggiuntiva che identifica un sottodominio.

.

**Radice**

Il livello più alto, normalmente invisibile, della gerarchia DNS.

.com

**Dominio di primo livello**

La parte finale: .ch, .com, .org.

example

**Etichetta di secondo livello**

Qui “example” è l’etichetta immediatamente a sinistra di .com. Insieme formano il nome di dominio example.com.

www

**Etichetta opzionale**

Un’etichetta opzionale aggiunta davanti al nome registrato. In www.example.com, “www” può identificare un sito o un servizio specifico; non fa parte del TLD.

FATTO

## Chi fa cosa?

Internet non ha un unico “proprietario”. Funziona attraverso ruoli distinti, contratti e coordinamento tecnico.

POLICY

### ICANN

Coordina politiche e contratti dei domini generici di primo livello attraverso un modello globale multistakeholder.

ROOT

### IANA / PTI

Opera come Root Zone Manager: PTI riceve e valida le richieste di modifica dei TLD e gestisce i dati autorevoli di delegazione della root DNS.

MAINTAIN

### Root Zone Maintainer

Verisign implementa operativamente nella root zone le modifiche validate, in qualità di Root Zone Maintainer sotto contratto con ICANN.

GOVERNANCE

### Operatore del registro

Gestisce un TLD e il relativo database autorevole. Gli operatori gTLD lavorano sotto accordi di registro ICANN; per i ccTLD gli assetti di governance sono differenti.

TECNICA

### Registry Service Provider (RSP)

Fornisce i servizi tecnici critici del registro, come DNS e infrastruttura di registrazione.

REGISTRAZIONE

### Registrar

Per i gTLD, un registrar accreditato ICANN offre il canale diretto di registrazione ai registrant. I ccTLD adottano modelli propri di registry e registrar.

UTENTE

### Titolare (registrant)

È la persona o organizzazione che registra e utilizza un nome sotto il TLD.

[IANA · Root Zone Manager / Maintainer ↗](https://www.iana.org/dnssec/procedures/ksk-operator/ksk-dps-20201104.html) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

FATTO

## Che cosa ottieni davvero quando registri un dominio?

La registrazione non è l’acquisto di un pezzo di Internet. Il registrant entra in un rapporto contrattuale e il nome resta soggetto a rinnovo, policy di registro e ciclo di vita applicabile.

01 **Disponibile**

Il nome non è registrato e può essere eleggibile secondo la policy del registro.

02 **Registrato**

Il registrant conclude un accordo tramite un registrar e il registry registra il nome.

 ↺ Ciclo di rinnovo

03 **Scaduto**

Se il periodo di registrazione termina, si applicano le regole post-scadenza. Rinnovo o ripristino possono ancora essere possibili secondo policy e tempistiche.

Se il registrar cancella una registrazione gTLD applicabile

04 **Redemption period**

Se una registrazione gTLD applicabile viene cancellata dal registrar, entra in un redemptionPeriod di 30 giorni durante il quale può essere possibile il ripristino.

05 **PendingDelete**

Se non viene ripristinato durante il redemptionPeriod, il nome entra in pendingDelete per cinque giorni e non può più essere ripristinato.

06 **Di nuovo disponibile**

Dopo la rimozione dal database del registry, il nome può tornare disponibile per una nuova registrazione secondo la policy del registro.

È una mappa semplificata orientata ai gTLD, non un ciclo universale. Scadenza non significa automaticamente cancellazione. Policy di registry, registrar e ccTLD possono differire.

[ICANN · renewal & expiration ↗](https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en/) [ICANN · EPP status codes ↗](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en)

LETTURA

## Che cos’è davvero un punto?

Un dominio è un identificatore tecnico con dimensioni giuridiche, economiche, istituzionali e culturali. Otto prospettive spiegano che cosa può organizzarsi attorno a un nome.

01

### Indirizzo

Un identificatore leggibile che aiuta utenti e software a trovare risorse Internet.

02

### Contratto

Una registrazione esiste attraverso rapporti contrattuali fra registrant, registrar e registry.

03

### Mercato

I nomi possono avere prezzi retail, premium, rinnovi e valore sul mercato secondario.

04

### Giurisdizione

Eleggibilità, policy e obblighi giuridici cambiano a seconda del namespace e dell’operatore.

05

### Identità

Un dominio può accumulare reputazione e diventare un identificatore persistente di una persona, un luogo o un’istituzione.

06

### Confine di fiducia

Verifica, DNSSEC e regole di registro possono aggiungere segnali di fiducia attorno a un nome.

07

### Segno culturale

Lingua e comunità possono attribuire a un TLD significati che la sua designazione originaria non prevedeva.

08

### Oggetto politico

Country code, nomi geografici e dispute di allocazione possono riflettere istituzioni, confini e autorità pubblica.

**Il punto è tecnico. Quello che la società costruisce attorno non lo è.**
 Un modo utile per leggere un TLD è chiedersi quale livello sta facendo il lavoro: indirizzamento, allocazione, governance, fiducia, valore economico, identità o significato culturale.

FATTO LETTURA

### Una parola, due sistemi di nomi: .bit

L'indice secondario congelato del 2026 registra 11 candidature ICANN per .bit. Namecoin utilizza già .bit in un proprio sistema di nomi basato su blockchain. Non si tratta di un TLD delegato nella root DNS globale di ICANN e i resolver DNS ordinari non consultano automaticamente Namecoin. È un rischio di collisione fra namespace da spiegare, non la prova che Namecoin sia fra gli undici richiedenti.

[Namecoin · .bit namespace ↗](https://www.namecoin.org/dot-bit/) [nTLDData · 2026 Reveal Day ↗](https://www.ntlddata.com/applications/strings)

### Approfondimenti collegati

Queste sono spiegazioni generali, non nuovi casi del round 2026. Chiariscono cosa accade oltre il TLD e quali decisioni rientrano, oppure no, nelle competenze di ICANN.

**Un dominio valido può essere comunque bloccato?** Filtri DNS, sospensioni dei domini, interruzioni di rete e ruolo ICANN spiegati con una simulazione interattiva.

[Filtri Internet, DNS e interruzioni di rete ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/it/who-controls-internet-access/) [Sanzioni internazionali e ICANN ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/it/sanctions-and-dns/)

Principi generali Come funzionano DNS, ruoli dei TLD e processo per i nuovi gTLD, indipendentemente da .lugano.

LETTURA

## L’economia del punto

Lo stesso dominio può trovarsi dentro più mercati contemporaneamente: registrazione, rinnovo, premium pricing, servizi di registry e mercato secondario.

**Registrant** Sceglie il nome e paga il prezzo retail di registrazione o rinnovo.

 →

**Registrar** Fornisce il canale retail e trasmette le operazioni di registrazione al registry.

 →

**Registry** Gestisce il database del TLD e definisce il modello commerciale e di policy lato registro nel quadro applicabile.

 ↗

**Livello ICANN** Per i gTLD esistono anche relazioni contrattuali e contributive sopra l’ecosistema registry–registrar.

**Mercato secondario** Le registrazioni esistenti possono acquisire un valore di rivendita indipendente dal prezzo wholesale del registry.

Il prezzo di un dominio non è una cosa sola. Wholesale, retail, premium e aftermarket appartengono a livelli diversi.

FATTO

## Come nasce un nuovo TLD

Il processo 2026 non è “faccio domanda e lo ricevo”. È una procedura pubblica a tappe.

01

**Candidatura**

Il candidato presenta la domanda e paga la tassa prevista.

02

**Reveal**

ICANN pubblica i dati pubblici delle candidature e individua le contese per stringhe identiche.

03

**Osservazioni e obiezioni**

Entrano nel processo contributi della comunità, obiezioni formali ed eventuali pareri governativi rilevanti.

04

**Valutazioni**

Vengono valutati stringa, candidato, capacità operative e finanziarie e componenti tecniche.

05

**Contese**

Se più candidati chiedono la stessa stringa o stringhe confondibili, la contesa deve essere risolta.

06

**Contratto**

Il candidato che supera il processo firma il Base Registry Agreement con ICANN.

07

**Delegazione**

Dopo onboarding e controlli tecnici, IANA/PTI processa la richiesta di delegazione e il Root Zone Maintainer implementa nella root DNS la modifica validata.

08

**Avvio**

Solo a quel punto il registro può procedere verso l’uso effettivo e l’assegnazione dei nomi sotto il TLD.

[Fonte ufficiale · ICANN Applicant Journey ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey)

FATTO LETTURA

## Due domande diverse: che tipo di candidatura è e chi può registrare?

Le tipologie di candidatura ICANN e le regole di accesso quotidiano alla registrazione sono due assi diversi. Un namespace può essere geografico, comunitario o di brand e avere regole di accesso molto differenti.

### Tipi / designazioni di candidatura 2026

#### General

Una candidatura che non rientra in un tipo specializzato.

#### Geographic Name

Una candidatura specializzata per una stringa che soddisfa i criteri geografici 2026 e gli eventuali requisiti di supporto o non opposizione.

#### Reserved Name

Una candidatura specializzata relativa a un nome riservato secondo le regole dell’Applicant Guidebook 2026.

#### Community

Una candidatura specializzata legata a una comunità chiaramente delimitata e agli impegni aggiuntivi richiesti dalla designazione.

#### .Brand

Una candidatura specializzata per una stringa eleggibile legata a un marchio registrato e al relativo operatore qualificato.

#### IDN

Una candidatura per una stringa TLD rappresentata in uno script supportato dal quadro Internationalized Domain Name.

#### Variant string

Una candidatura che include stringhe varianti valutate insieme alla stringa primaria richiesta.

#### Governo / IGO

Una candidatura presentata da un governo o da un’organizzazione intergovernativa e trattata come specializzata.

#### Applicant Support

Una candidatura di un soggetto qualificato per l’Applicant Support Program è trattata come specializzata.

### Modello operativo di accesso

.com

#### Registrazione aperta

Un namespace ampiamente aperto ai registrant eleggibili secondo le normali regole del registro.

.bank

#### Ristretta / verificata

Un namespace nel quale l’eleggibilità viene verificata; .BANK è un esempio per organizzazioni bancarie regolamentate.

Queste etichette descrivono le designazioni ICANN del round 2026. I TLD storici non vengono presentati come se fossero esempi del 2026. “Aperto” o “ristretto” descrive invece l’accesso pratico alla registrazione dopo la delegazione.

[ICANN · application types ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-types/faqs/general/what-types-of-gtld-applications-can-be-submitted-in-the-new-gtld-program) [.BANK · eligibility ↗](https://register.bank/eligibility/)

FATTO

## Parole precise, concetti chiari

I concetti essenziali per orientarsi tra domini, DNS e governance di Internet.

FATTO

 Più preciso

Un dominio di primo livello è la parte finale di un indirizzo Internet, come .ch o .com.

Da non confondere con

Un TLD è semplicemente un nuovo indirizzo web.

FATTO

 Più preciso

ICANN coordina il sistema globale dei nomi di dominio e il processo per i nuovi gTLD.

Da non confondere con

ICANN è il governo o il proprietario di Internet.

FATTO

## Glossario essenziale

I termini che rendono più semplice leggere l’Explorer. Il vocabolario ufficiale ICANN/IANA resta distinto dai campi metodologici di Connecting the Dots.

Termine ICANN / IANA Metodo del progetto

**ICANN Termine ICANN / IANA**

Internet Corporation for Assigned Names and Numbers. Organizzazione senza scopo di lucro di interesse pubblico che coordina i sistemi di identificatori univoci di Internet e supporta lo sviluppo delle relative politiche, incluso il DNS.

[Fonte ↗](https://www.icann.org/resources/pages/about-icann)

**IANA / Internet Assigned Numbers Authority Termine ICANN / IANA**

Funzioni che mantengono i registri autorevoli degli identificatori tecnici globalmente univoci di Internet, compresi nomi di dominio, numeri e parametri di protocollo. Le funzioni IANA sono svolte da PTI, affiliata di ICANN.

[Fonte ↗](https://www.iana.org/about)

**DNS / Domain Name System Termine ICANN / IANA**

Sistema gerarchico e distribuito dei nomi di Internet. Consente di interrogare nomi leggibili, come example.com, e ottenere le informazioni necessarie per raggiungere i servizi associati, per esempio indirizzi IP.

[Fonte ↗](https://www.icann.org/en/beginners)

**TLD / Top-Level Domain Termine ICANN / IANA**

Un dominio al livello immediatamente sotto la root DNS, come .ch o .com. La stringa .lugano è invece candidata nel round 2026 e non è ancora delegata.

[Fonte ↗](https://www.iana.org/domains/root)

**DNS root / Root zone Termine ICANN / IANA**

Il livello più alto della gerarchia DNS. La root zone contiene le deleghe dei TLD riconosciuti dal DNS globale.

[Fonte ↗](https://www.iana.org/domains/root)

**gTLD / Generic Top-Level Domain Termine ICANN / IANA**

Categoria dei domini di primo livello generici, come .com, distinta dai ccTLD e dal dominio infrastrutturale .arpa. Comprende estensioni storiche e nuovi gTLD introdotti tramite i programmi ICANN.

[Fonte ↗](https://www.iana.org/domains/root/db)

**ccTLD / Country-Code Top-Level Domain Termine ICANN / IANA**

Un TLD associato a un paese o territorio, normalmente sulla base di un codice ISO 3166-1 a due lettere o di una stringa IDN approvata.

[Fonte ↗](https://www.iana.org/help/eligible-tlds)

**IDN / Internationalized Domain Name Termine ICANN / IANA**

Un nome di dominio che usa caratteri oltre al set ASCII di base, per esempio alfabeti o scritture non latine.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**A-label / Punycode Termine ICANN / IANA**

A-label: rappresentazione ASCII di un’etichetta IDN valida secondo IDNA, sempre con prefisso xn--. Punycode è l’algoritmo usato per codificarne la parte successiva al prefisso.

[Fonte ↗](https://datatracker.ietf.org/doc/html/rfc5890#section-2.3.2.1)

**Name server / Server DNS Termine ICANN / IANA**

Server del DNS che risponde alle interrogazioni su un nome di dominio. Un name server autorevole conserva i record ufficiali della zona DNS per cui è responsabile.

[Fonte ↗](https://www.icann.org/en/icann-acronyms-and-terms/name-server-en)

**RDAP / Registration Data Access Protocol Termine ICANN / IANA**

Protocollo basato su HTTP per accedere ai dati correnti di registrazione di nomi di dominio e indirizzi IP. È stato progettato come sostituto di WHOIS e offre formati standardizzati, HTTPS e supporto all’internazionalizzazione.

[Fonte ↗](https://www.icann.org/rdap/)

**WHOIS Termine ICANN / IANA**

Protocollo e insieme di servizi storicamente usati per interrogare dati di registrazione dei nomi di dominio. RDAP è stato progettato per sostituirne il protocollo con un accesso più moderno e standardizzato.

[Fonte ↗](https://www.icann.org/resources/pages/whois-rdds-2023-11-02-en)

**Applicant Termine ICANN / IANA**

L’organizzazione che presenta a ICANN una candidatura per un nuovo gTLD.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application Termine ICANN / IANA**

La candidatura formale per un nuovo gTLD. La candidatura non equivale alla delega della stringa nella root DNS.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application round Termine ICANN / IANA**

L’intera sequenza di fasi con cui ICANN tratta le candidature ricevute in uno specifico periodo di presentazione.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Delegation Termine ICANN / IANA**

L’inserimento tecnico del TLD nella root DNS. Solo dopo la delega la stringa diventa attiva nel sistema globale dei nomi.

[Fonte ↗](https://www.iana.org/help/gtld-delegation)

**Registry operator Termine ICANN / IANA**

Il soggetto che gestisce il TLD e il relativo database autorevole. Per i gTLD opera nel quadro del Registry Agreement con ICANN.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Registry Service Provider (RSP) Termine ICANN / IANA**

Il fornitore dei servizi tecnici critici necessari al funzionamento del registro, distinto dal soggetto che detiene la responsabilità di registry operator.

[Fonte ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-evaluation/faqs/general/what-are-the-components-of-application-evaluation)

**Registrar Termine ICANN / IANA**

Per i gTLD, l’intermediario accreditato da ICANN che offre agli utenti il canale di registrazione dei nomi di dominio. I ccTLD possono adottare modelli diversi.

[Fonte ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

**Registrant Termine ICANN / IANA**

La persona o organizzazione che registra un nome di dominio.

[Fonte ↗](https://www.icann.org/registrants)

**Registry Agreement Termine ICANN / IANA**

L’accordo contrattuale tra ICANN e il registry operator di un gTLD.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Contention set Termine ICANN / IANA**

Un gruppo di candidature per stringhe identiche o sufficientemente simili da non poter procedere tutte senza prima risolvere la concorrenza tra loro.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**String contention Termine ICANN / IANA**

La situazione in cui più candidature qualificate competono per la stessa stringa o per stringhe considerate confondibilmente simili.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**GAC Advice Termine ICANN / IANA**

Un parere del Governmental Advisory Committee al Board di ICANN su una o più candidature o su questioni di interesse pubblico.

[Fonte ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Name collision Termine ICANN / IANA**

La situazione in cui un nome destinato a essere risolto in un sistema di nomi viene invece risolto in un altro, con possibili comportamenti inattesi o rischi operativi.

[Fonte ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey/prepare-to-apply)

**Application outcome Metodo del progetto**

Campo metodologico di Connecting the Dots che descrive l’esito documentato di una candidatura, separatamente da contention e controversie. Un campo vuoto significa che l’esito non è provato nel corpus locale.

**Outcome reason Metodo del progetto**

Campo metodologico che registra, solo quando documentata da una fonte, la causa dell’esito: per esempio ritiro, non-selezione, policy pubblica o rischio tecnico.

**Governance controversy Metodo del progetto**

Categoria editoriale di Connecting the Dots per conflitti sostanziali su diritti, legittimità, interesse pubblico, controllo o condizioni d’uso di una stringa. Non coincide con la semplice contention.

[Scarica il glossario in CSV ↓](https://robertbregy.github.io/Connecting-the-Dots/data/domain_governance_glossary.csv)

FATTO LETTURA

## Chi può davvero azionare quale leva?

Sito web, registrazione del dominio, risoluzione DNS e accesso dal browser sono livelli differenti. Attori diversi possono intervenire in punti diversi; nessuna singola organizzazione “controlla Internet”.

01

### Hosting provider

Può rimuovere o disattivare contenuti o infrastruttura che ospita.

02

### Provider DNS

Può smettere di servire il DNS autoritativo o modificare la zona che gestisce.

03

### Registrar

Gestisce il rapporto con il registrant e trasmette al registry le modifiche alla registrazione.

04

### Registry operator

Mantiene il registro del TLD e processa aggiunte, modifiche o cancellazioni secondo le regole applicabili.

05

### Browser / livello sicurezza

Può avvisare, bloccare o non fidarsi di una destinazione senza modificare la registrazione.

06

### ICANN

Coordina policy e contratti dei gTLD, ma non è un regolatore generale dei contenuti né la “polizia di Internet”.

**Stesso sito, leve diverse.**
 Togliere un contenuto, sospendere una registrazione, cambiare il DNS e bloccare l’accesso non sono la stessa azione. La governance comincia identificando il livello.

ICANN dichiara di non controllare i contenuti Internet e di non essere un’autorità generale per la rimozione dei siti.

[ICANN · registry operator ↗](https://www.icann.org/en/icann-acronyms-and-terms/registry-operator-en) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars) [ICANN · website content ↗](https://www.icann.org/resources/pages/spam-phishing-2017-06-20-en)

.lugano · caso applicato Cosa significano questi principi generali per la candidatura di Lugano nel round 2026.

FATTO

## Dalla regola generale al caso .lugano

La candidatura .lugano segue lo stesso percorso descritto sopra. Finché valutazione, contratto e delegazione non sono completati, .lugano resta una candidatura e non è un TLD attivo.

VISIONE

Esempio ipotetico

www.servizi .lugano

Se .lugano sarà delegato, la stessa struttura DNS potrà produrre indirizzi come servizi.lugano o www.servizi.lugano. L’esempio illustra la gerarchia; non indica un servizio già attivo.

## Nel caso .lugano: cosa potrebbe governare il registro e cosa non significherebbe

VISIONE

### Cosa potrebbe governare il registro

- Criteri di ammissibilità e assegnazione dei nomi sotto .lugano, nel rispetto delle regole ICANN e della legge applicabile.

- Nomi riservati, fasi di lancio e scelte di governance locale.

- Requisiti di registrazione, tecnici e di sicurezza per i nomi che operano sotto .lugano.

FATTO

### Cosa non significherebbe

- Lugano non “possiede Internet” e non controlla .ch, .com o altri TLD.

- Una candidatura non è un’assegnazione: .lugano non è attivo finché processo, contratto e delegazione non sono completati.

- ICANN non gestisce i siti della Città: coordina il sistema globale dei nomi e il quadro contrattuale dei gTLD.

## Parlare con precisione di .lugano

Due distinzioni importanti finché la candidatura è ancora in corso.

FATTO

 Più preciso

La Città di Lugano ha presentato la candidatura per il nuovo dominio di primo livello .lugano.

Da non confondere con

Lugano ha ottenuto / possiede il dominio .lugano.

VISIONE

 Più preciso

Se la candidatura avrà successo, .lugano potrà diventare uno spazio regolato secondo criteri definiti dal suo registry operator nel quadro ICANN.

Da non confondere con

Chiunque potrà automaticamente registrare qualsiasi nome .lugano.

**Di Robert Bregy** · Edizione del sito 0.7.109 · 11 novembre 2026

Le date di osservazione sono indicate accanto alle evidenze. Questa edizione del sito non implica una nuova verifica di tutte le fonti nella stessa data.
