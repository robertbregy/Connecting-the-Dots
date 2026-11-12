<!-- Canonical: https://robertbregy.github.io/Connecting-the-Dots/guides/it/beyond/ | Site edition: 0.7.110 | Language: it -->

Guida

# Un dominio serve soltanto a trovare un sito?

Dai servizi che usiamo alle funzioni invisibili del DNS, fino alle scritture e ai sistemi di nomi alternativi.

[Esplora nell’atlante](https://robertbregy.github.io/Connecting-the-Dots/it/?tab=beyond#beyond) [Metodo e citazione](https://robertbregy.github.io/Connecting-the-Dots/research/) [Versione testuale](https://robertbregy.github.io/Connecting-the-Dots/guides/it/beyond/index.md)

LETTURA

## Quando un TLD diventa infrastruttura

Alcuni namespace sono andati molto oltre il nome. Hanno aggiunto criteri di accesso, verifica, requisiti di sicurezza, governance d’interesse pubblico o servizi digitali condivisi.

01

**Nome**

Un indirizzo riconoscibile.

02

**Comunità qualificata**

Regole che definiscono chi può accedere.

03

**Identità verificata**

I requisiti vengono controllati.

04

**Baseline di sicurezza**

I requisiti tecnici diventano parte del namespace.

05

**Servizi condivisi**

Il TLD diventa piattaforma per servizi comuni.

LETTURA

Alcuni dei casi più chiari mostrano che un TLD può incorporare molto più di un nome: eleggibilità, identità, sicurezza, regole di comunità e servizi condivisi.

FATTO

.post

Servizi condivisi

### Un TLD con uno strato di servizi

L’UPU verifica i registranti, impone un quadro di cybersicurezza e gestisce trust.post, una Shared Services Platform per il settore postale e logistico.

[Fonte primaria ↗](https://www.upu.int/en/universal-postal-union/activities/digital-services/post-domain)

FATTO

.cat

Infrastruttura civica

### Un dominio che finanzia un bene comune digitale

Il registro .cat reinveste i ricavi in diritti digitali, strumenti e progetti per la comunità catalanofona e descrive la missione più ampia come infrastruttura civica.

[Fonte primaria ↗](https://domini.cat/en/about-us)

FATTO

.bank / .insurance

Fiducia verificata

### Regole di sicurezza incorporate nell’appartenenza

I domini .bank e .insurance attivi devono rispettare requisiti come DNSSEC, TLS e autenticazione email. Il suffisso è progettato come ambiente a fiducia più elevata.

[Fonte primaria ↗](https://ftld.com/security/)

FATTO

.gov

Identità pubblica verificata

### Il suffisso diventa una credenziale istituzionale

Solo organizzazioni governative statunitensi verificate possono registrare .gov. CISA controlla eleggibilità e identità dei richiedenti.

[Fonte primaria ↗](https://get.gov/domains/eligibility/)

FATTO

.pharmacy

Qualifica esterna

### Un dominio legato a un accreditamento

Per ottenere .pharmacy occorre dimostrare la conformità agli standard NABP e ricevere l’accreditamento. Il dominio è quindi agganciato a una qualifica esterna.

[Fonte primaria ↗](https://nabp.pharmacy/help/is-domain-name-registration-in-the-pharmacy-tld-restricted/)

FATTO

.eco

Profilo + impegno

### L’attivazione richiede profilo e impegno

Una registrazione .eco resta sospesa finché il registrante non conferma l’eleggibilità, completa un Eco Profile e assume pubblicamente un impegno ambientale.

[Fonte primaria ↗](https://go.eco/policies/eligibility/)

FATTO

.swiss

Namespace qualificato

### Un namespace riservato a una comunità definita

.swiss è riservato alla comunità svizzera e applica requisiti che collegano registrante e denominazione richiesta alla Svizzera.

[Fonte primaria ↗](https://www.nic.swiss/en/conditions-for-the-registration-and-the-registration-process)

FATTO LETTURA

## Il DNS invisibile

Il DNS fa già molto più che tradurre nomi in indirizzi IP: instrada la posta, pubblica dati di autenticazione e policy di autorizzazione dei certificati, annuncia servizi e può trasportare fiducia crittografica.

MX

### Instradamento della posta

I record MX indicano ai sistemi mittenti quali mail server gestiscono la posta di un dominio.

[Fonte ↗](https://www.rfc-editor.org/rfc/rfc5321)

SPF · DKIM · DMARC

### Autenticazione email

SPF, DKIM e DMARC usano dati pubblicati nel DNS per aiutare i destinatari a valutare posta autorizzata e autenticata.

[Fonte 1 ↗](https://www.rfc-editor.org/rfc/rfc7208) [Fonte 2 ↗](https://www.rfc-editor.org/rfc/rfc6376) [Fonte 3 ↗](https://www.rfc-editor.org/rfc/rfc7489)

CAA

### Autorizzazione dei certificati

I record CAA pubblicano quali Certification Authority sono autorizzate a emettere certificati per un dominio.

[Fonte ↗](https://www.rfc-editor.org/rfc/rfc8659)

DNSSEC

### Integrità e autenticità dell’origine

DNSSEC firma i dati DNS affinché i resolver possano validarli attraverso una catena di fiducia.

[Fonte ↗](https://www.icann.org/resources/pages/dnssec-2012-02-25-en)

SRV

### Scoperta di servizi

I record SRV possono pubblicare hostname e porta di servizi associati a un dominio.

[Fonte ↗](https://www.rfc-editor.org/rfc/rfc2782)

SVCB · HTTPS

### Indicazioni di connessione

I record SVCB e HTTPS possono pubblicare endpoint e parametri di connessione prima che il client si connetta.

[Fonte ↗](https://www.rfc-editor.org/rfc/rfc9460)

Il DNS è già uno strato infrastrutturale per routing, discovery e fiducia. “Oltre il dominio” è quindi un’estensione di capacità esistenti, non una fuga dalla natura del DNS.

FATTO

## Internet non è scritto soltanto in caratteri latini

Gli Internationalized Domain Names permettono TLD in scritture non ASCII. Universal Acceptance è il requisito pratico perché browser, email e applicazioni li accettino davvero.

.中国 .السعودية .ไทย .рф .ευ

**Universal Acceptance**

Un nome può essere valido nel DNS globale e fallire comunque in un’applicazione che assume vecchie regole ASCII-only o TLD corti. Universal Acceptance serve a rimuovere queste barriere tecniche.

La delegazione non basta per avere un naming davvero globale. Anche il software deve riconoscere i nomi che le persone sono autorizzate a usare.

[IANA · root database ↗](https://www.iana.org/domains/root/db) [ICANN · Universal Acceptance ↗](https://www.icann.org/resources/pages/universal-acceptance-faqs-2014-09-26-en/)

FATTO LETTURA

## Un punto, universi diversi

Una stringa separata da punti può sembrare un dominio ma appartenere a un diverso regime di naming. La somiglianza visiva non implica la stessa root, lo stesso resolver o la stessa governance.

DNS

**Root DNS pubblica**

.com, .ch, .中国 e gli altri TLD delegati vivono nella root DNS globale coordinata.

RFC

**Nomi DNS special-use**

.test, .localhost, .invalid, .onion e home.arpa hanno comportamenti speciali definiti da standard; non sono normali registrazioni TLD della root pubblica.

.test · .localhost · .onion · home.arpa

ALT

**Sistemi di naming alternativi**

.eth appartiene a Ethereum Name Service; Handshake si definisce un sistema sperimentale peer-to-peer di root naming. Sono sistemi di naming differenti, non TLD della root ICANN.

.eth · Handshake

**Sembra un dominio ≠ è un TLD della root pubblica.**
 La domanda importante non è soltanto cosa viene dopo il punto, ma quale root e quale sistema di risoluzione danno significato a quell’etichetta.

[IANA · special-use names ↗](https://www.iana.org/assignments/special-use-domain-names) [ENS · protocol ↗](https://docs.ens.domains/learn/protocol/) [Handshake ↗](https://handshake.org/)

**Di Robert Bregy** · Edizione del sito 0.7.110 · 12 novembre 2026

Le date di osservazione sono indicate accanto alle evidenze. Questa edizione del sito non implica una nuova verifica di tutte le fonti nella stessa data.
