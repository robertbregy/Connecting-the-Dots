<!-- Canonical: https://robertbregy.github.io/Connecting-the-Dots/guides/de/how/ | Site edition: 0.7.106 | Language: de -->

Leitfaden

# Wie funktioniert ein Internetname?

Zuerst die Adresse und die Akteure, dann Lebenszyklus, Wirtschaft und Regeln. Das Glossar bleibt leicht erreichbar.

[Im Atlas erkunden](https://robertbregy.github.io/Connecting-the-Dots/de/?tab=how#how) [Methode und Zitieren](https://robertbregy.github.io/Connecting-the-Dots/research/) [Textversion](https://robertbregy.github.io/Connecting-the-Dots/guides/de/how/index.md)

FAKT

## Wie Internet-Domains wirklich funktionieren

Die wesentlichen Begriffe, um sich zwischen Domains, DNS und Internet-Governance zu orientieren.

www.example .com

In **www.example.com** ist **.com** die Top-Level-Domain (TLD). „example“ ist das Label der zweiten Ebene; der unter .com registrierte Name lautet **example.com**. „www“ ist ein zusätzliches Label, das eine Subdomain bezeichnet.

.

**Root**

Die normalerweise unsichtbare oberste Ebene der DNS-Hierarchie.

.com

**Top-Level-Domain**

Der letzte Teil: .ch, .com, .org.

example

**Label der zweiten Ebene**

Hier steht das Label „example“ unmittelbar links von .com. Zusammen bilden sie den Domainnamen example.com.

www

**Optionale Bezeichnung**

Ein optionales Label vor dem registrierten Namen. In www.example.com kann „www“ eine bestimmte Website oder einen Dienst bezeichnen; es ist nicht Teil der TLD.

FAKT

## Wer macht was?

Das Internet hat keinen einzigen Eigentümer. Es funktioniert durch getrennte Rollen, Verträge und technische Koordination.

POLICY

### ICANN

Koordiniert Regeln und Verträge für generische Top-Level-Domains in einem globalen Multistakeholder-Modell.

ROOT

### IANA / PTI

Fungiert als Root Zone Manager: PTI nimmt Änderungsanträge von TLD-Betreibern entgegen, validiert sie und verwaltet die autoritativen Delegationsdaten der DNS-Root.

MAINTAIN

### Root Zone Maintainer

Verisign setzt validierte Änderungen als operativer Root Zone Maintainer unter Vertrag mit ICANN in der Root Zone um.

GOVERNANCE

### Registry-Betreiber

Betreibt eine TLD und ihre autoritative Registry-Datenbank. gTLD-Betreiber arbeiten unter ICANN-Registry-Verträgen; bei ccTLDs gelten andere Governance-Strukturen.

TECHNIK

### Registry Service Provider

Liefert kritische technische Registry-Dienste wie DNS- und Registrierungsinfrastruktur.

REGISTRIERUNG

### Registrar / Registrierungsstelle

Bei gTLDs bietet ein von ICANN akkreditierter Registrar Registrants den direkten Registrierungskanal. ccTLDs verwenden eigene Registry- und Registrar-Modelle.

NUTZER

### Domaininhaber (Registrant)

Person oder Organisation, die einen Domainnamen unter der TLD registriert und nutzt.

[IANA · Root Zone Manager / Maintainer ↗](https://www.iana.org/dnssec/procedures/ksk-operator/ksk-dps-20201104.html) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

FAKT

## Was erhält man eigentlich, wenn man eine Domain registriert?

Eine Registrierung ist kein Kauf eines Stücks Internet. Der Registrant tritt in ein Vertragsverhältnis ein; der Name bleibt Verlängerung, Registry-Policy und Lebenszyklus unterworfen.

01 **Verfügbar**

Der Name ist derzeit nicht registriert und kann nach Registry-Policy registrierbar sein.

02 **Registriert**

Ein Registrant schließt über einen Registrar eine Vereinbarung; die Registry trägt den Namen ein.

 ↺ Erneuerungsschleife

03 **Abgelaufen**

Endet die Registrierungsperiode, gelten Post-Expiration-Regeln. Je nach Policy und Zeitpunkt können Erneuerung oder Wiederherstellung noch möglich sein.

Wenn der Registrar eine anwendbare gTLD-Registrierung löscht

04 **Redemption period**

Wird eine anwendbare gTLD-Registrierung vom Registrar gelöscht, tritt sie in eine 30-tägige redemptionPeriod ein, in der eine Wiederherstellung möglich sein kann.

05 **PendingDelete**

Wird sie während der redemptionPeriod nicht wiederhergestellt, folgt fünf Tage pendingDelete; eine Wiederherstellung ist dann nicht mehr möglich.

06 **Wieder verfügbar**

Nach der Löschung aus der Registry-Datenbank kann der Name nach den Regeln der Registry erneut verfügbar werden.

Dies ist eine vereinfachte, gTLD-orientierte Karte und kein universeller Lebenszyklus. Ablauf bedeutet nicht automatisch Löschung. Registry-, Registrar- und ccTLD-Regeln können abweichen.

[ICANN · renewal & expiration ↗](https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en/) [ICANN · EPP status codes ↗](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en)

EINORDNUNG

## Was ist ein Punkt eigentlich?

Eine Domain ist ein technischer Bezeichner mit rechtlichen, wirtschaftlichen, institutionellen und kulturellen Dimensionen. Acht Perspektiven erklären, was sich um einen Namen entwickeln kann.

01

### Adresse

Ein menschenlesbarer Bezeichner, der Nutzern und Software hilft, Internetressourcen zu finden.

02

### Vertrag

Eine Registrierung besteht durch Vertragsbeziehungen zwischen Registrant, Registrar und Registry.

03

### Markt

Namen können Einzelhandelspreise, Premiumpreise, Verlängerungen und Sekundärmarktwert haben.

04

### Rechtsrahmen

Berechtigung, Policies und rechtliche Pflichten unterscheiden sich je nach Namespace und Betreiber.

05

### Identität

Eine Domain kann Reputation aufbauen und zu einem dauerhaften Identifikator für Person, Ort oder Institution werden.

06

### Vertrauensgrenze

Verifikation, DNSSEC und Registry-Regeln können einem Namen zusätzliche Vertrauenssignale geben.

07

### Kulturelles Zeichen

Sprache und Gemeinschaften können einem TLD Bedeutungen geben, die ursprünglich nie vorgesehen waren.

08

### Politisches Objekt

Ländercodes, geografische Namen und Zuteilungskonflikte können Institutionen, Grenzen und öffentliche Autorität widerspiegeln.

**Der Punkt ist technisch. Was Gesellschaften darum herum bauen, ist es nicht.**
 Ein TLD lässt sich lesen, indem man fragt, welche Ebene gerade wirkt: Adressierung, Zuteilung, Governance, Vertrauen, Marktwert, Identität oder kulturelle Bedeutung.

FAKT EINORDNUNG

### Ein Wort, zwei Namenssysteme: .bit

Der eingefrorene Sekundärindex zählt 11 ICANN-Bewerbungen für .bit im Jahr 2026. Namecoin nutzt .bit bereits in einem eigenen blockchainbasierten Namenssystem. Es handelt sich nicht um eine im globalen ICANN-DNS-Root delegierte TLD; gewöhnliche DNS-Resolver verwenden Namecoin nicht automatisch. Das ist ein mögliches Konfliktfeld zwischen Namensräumen, kein Beleg dafür, dass Namecoin zu den elf Bewerbern gehört.

[Namecoin · .bit namespace ↗](https://www.namecoin.org/dot-bit/) [nTLDData · 2026 Reveal Day ↗](https://www.ntlddata.com/applications/strings)

### Weitere Erklärungen

Dies sind allgemeine Erklärungen und keine neuen Fälle aus der Bewerbungsrunde 2026. Sie erläutern, was über die TLD hinaus geschieht und wo die Zuständigkeiten von ICANN enden.

**Kann eine gültige Domain trotzdem gesperrt sein?** DNS-Filter, Domainsperren, Netzabschaltungen und die Rolle der ICANN mit einer interaktiven Simulation erklärt.

[Internetfilter, DNS und Netzunterbrechungen ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/de/who-controls-internet-access/) [Internationale Sanktionen und ICANN ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/de/sanctions-and-dns/)

Allgemeine Prinzipien Wie DNS, TLD-Rollen und das Verfahren für neue gTLDs unabhängig von .lugano funktionieren.

EINORDNUNG

## Die Ökonomie des Punkts

Dieselbe Domain kann gleichzeitig in mehreren Märkten liegen: Registrierung, Verlängerung, Premiumpreise, Registry-Dienste und Sekundärhandel.

**Registrant** Wählt den Namen und zahlt den Endkundenpreis für Registrierung oder Verlängerung.

 →

**Registrar** Stellt den Vertriebskanal bereit und übermittelt Registrierungsvorgänge an die Registry.

 →

**Registry** Betreibt die TLD-Datenbank und gestaltet innerhalb des Rahmens das kommerzielle und politische Registry-Modell.

 ↗

**ICANN-Ebene** Bei gTLDs bestehen zusätzlich Vertrags- und Beitragsbeziehungen oberhalb des Registry-Registrar-Ökosystems.

**Sekundärmarkt** Bestehende Registrierungen können unabhängig vom Wholesale-Preis der Registry einen Wiederverkaufswert entwickeln.

Ein Domainpreis ist nicht nur eine Zahl. Wholesale, Retail, Premium und Aftermarket gehören zu unterschiedlichen Ebenen.

FAKT

## Wie eine neue TLD entsteht

2026 gilt nicht “beantragen und erhalten”, sondern ein öffentliches, mehrstufiges Verfahren.

01

**Antrag**

Der Antragsteller reicht die Unterlagen ein und zahlt die Gebühr.

02

**Reveal**

ICANN veröffentlicht öffentliche Antragsdaten und identifiziert identische Strings in Konkurrenz.

03

**Input & Einsprachen**

Community-Input, formelle Einsprachen und relevante Regierungsberatung können Teil des Verfahrens werden.

04

**Prüfungen**

String, Antragsteller sowie operative, finanzielle und technische Komponenten werden geprüft.

05

**Konkurrenz**

Bei identischen oder verwechselbaren Strings muss die Konkurrenz gelöst werden.

06

**Vertrag**

Ein erfolgreicher Antragsteller unterzeichnet den Base Registry Agreement mit ICANN.

07

**Delegation**

Nach Onboarding und technischen Prüfungen bearbeitet IANA/PTI die Delegationsanfrage; der Root Zone Maintainer setzt die validierte Änderung in der DNS-Root um.

08

**Start**

Erst danach kann die Registry Namen unter der TLD tatsächlich einsetzen und vergeben.

[Offizielle Erklärung · ICANN Applicant Journey ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey)

FAKT EINORDNUNG

## Zwei verschiedene Fragen: Welche Art Antrag ist es, und wer darf registrieren?

ICANN-Antragstypen und der operative Registrierungszugang sind zwei verschiedene Achsen. Ein Namespace kann geografisch, community-basiert oder markenbezogen sein und sehr unterschiedliche Zugangsregeln haben.

### 2026 Bewerbungstypen / Bezeichnungen

#### General

Eine Bewerbung, die keinem spezialisierten Anwendungstyp zugeordnet ist.

#### Geographic Name

Eine spezialisierte Bewerbung für eine Zeichenfolge, die die geografischen Kriterien 2026 und die einschlägigen Unterstützungs- oder Nichtwiderspruchsanforderungen erfüllt.

#### Reserved Name

Eine spezialisierte Bewerbung für einen nach dem Applicant Guidebook 2026 reservierten Namen.

#### Community

Eine spezialisierte Bewerbung für eine klar abgegrenzte Gemeinschaft mit den zusätzlichen Verpflichtungen dieser Bezeichnung.

#### .Brand

Eine spezialisierte Bewerbung für eine geeignete Zeichenfolge, die an eine eingetragene Marke und einen qualifizierten Markenbetreiber gebunden ist.

#### IDN

Eine Bewerbung für eine TLD-Zeichenfolge in einem vom Internationalized-Domain-Name-Rahmen unterstützten Schriftsystem.

#### Variant string

Eine Bewerbung mit Varianten, die zusammen mit der primären beantragten Zeichenfolge bewertet werden.

#### Regierung / IGO

Eine Bewerbung einer Regierung oder zwischenstaatlichen Organisation, die als spezialisiert behandelt wird.

#### Applicant Support

Eine Bewerbung eines für das Applicant Support Program qualifizierten Bewerbers wird als spezialisiert behandelt.

### Operatives Zugangsmodell

.com

#### Offene Registrierung

Ein Namespace, der berechtigten Registranten unter normalen Registry-Regeln weitgehend offensteht.

.bank

#### Beschränkt / verifiziert

Ein Namespace mit verifizierter Berechtigung; .BANK ist ein Beispiel für regulierte Bankorganisationen.

Diese Bezeichnungen beschreiben ICANNs 2026-Anwendungstypen. Historische TLDs werden hier nicht als 2026-Beispiele dargestellt. „Offen“ oder „beschränkt“ beschreibt stattdessen den praktischen Registrierungszugang nach der Delegation.

[ICANN · application types ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-types/faqs/general/what-types-of-gtld-applications-can-be-submitted-in-the-new-gtld-program) [.BANK · eligibility ↗](https://register.bank/eligibility/)

FAKT

## Präzise Begriffe, klare Konzepte

Die wesentlichen Begriffe, um sich zwischen Domains, DNS und Internet-Governance zu orientieren.

FAKT

 Präziser

Eine Top-Level-Domain ist der letzte Teil einer Internetadresse, zum Beispiel .ch oder .com.

Nicht dasselbe wie

Eine TLD ist einfach eine neue Website-Adresse.

FAKT

 Präziser

ICANN koordiniert das globale Domain-Namensystem und das Verfahren für neue gTLDs.

Nicht dasselbe wie

ICANN ist die Regierung oder der Eigentümer des Internets.

FAKT

## Grundlegendes Glossar

Die Begriffe, die das Lesen des Explorers erleichtern. Offizielle ICANN/IANA-Terminologie bleibt von den methodischen Feldern von Connecting the Dots getrennt.

ICANN-/IANA-Begriff Projektmethodik

**ICANN ICANN-/IANA-Begriff**

Internet Corporation for Assigned Names and Numbers. Eine gemeinnützige Organisation im öffentlichen Interesse, die die eindeutigen Kennungssysteme des Internets koordiniert und die zugehörige Politikentwicklung unterstützt, einschließlich des DNS.

[Quelle ↗](https://www.icann.org/resources/pages/about-icann)

**IANA / Internet Assigned Numbers Authority ICANN-/IANA-Begriff**

Funktionen, die die maßgeblichen Register für die weltweit eindeutigen technischen Kennungen des Internets führen, darunter Domainnamen, Nummern und Protokollparameter. Die IANA-Funktionen werden von PTI, einer ICANN-Tochter, ausgeführt.

[Quelle ↗](https://www.iana.org/about)

**DNS / Domain Name System ICANN-/IANA-Begriff**

Das verteilte, hierarchische Namenssystem des Internets. Es ermöglicht Abfragen lesbarer Namen wie example.com und liefert Informationen, die zum Erreichen zugehöriger Dienste benötigt werden, etwa IP-Adressen.

[Quelle ↗](https://www.icann.org/en/beginners)

**TLD / Top-Level Domain ICANN-/IANA-Begriff**

Eine Domain unmittelbar unter der DNS-Root, etwa .ch oder .com. Für den String .lugano liegt dagegen eine Bewerbung in der Runde 2026 vor; er ist noch nicht delegiert.

[Quelle ↗](https://www.iana.org/domains/root)

**DNS root / Root zone ICANN-/IANA-Begriff**

Die oberste Ebene der DNS-Hierarchie. Die Root Zone enthält die Delegationen der vom globalen DNS anerkannten TLDs.

[Quelle ↗](https://www.iana.org/domains/root)

**gTLD / Generic Top-Level Domain ICANN-/IANA-Begriff**

Die Kategorie der generischen Top-Level-Domains, etwa .com, getrennt von ccTLDs und der Infrastruktur-Domain .arpa. Sie umfasst historische Endungen und neue gTLDs aus ICANN-Programmen.

[Quelle ↗](https://www.iana.org/domains/root/db)

**ccTLD / Country-Code Top-Level Domain ICANN-/IANA-Begriff**

Eine TLD, die einem Land oder Gebiet zugeordnet ist, üblicherweise auf Grundlage eines zweistelligen ISO-3166-1-Codes oder einer genehmigten IDN-Zeichenfolge.

[Quelle ↗](https://www.iana.org/help/eligible-tlds)

**IDN / Internationalized Domain Name ICANN-/IANA-Begriff**

Ein Domainname, der Zeichen ausserhalb des grundlegenden ASCII-Zeichensatzes verwendet, zum Beispiel Zeichen nichtlateinischer Schriften.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**A-label / Punycode ICANN-/IANA-Begriff**

A-Label: die ASCII-Darstellung eines nach IDNA gültigen IDN-Labels, immer mit dem Präfix xn--. Punycode ist der Algorithmus zur Codierung des Teils nach diesem Präfix.

[Quelle ↗](https://datatracker.ietf.org/doc/html/rfc5890#section-2.3.2.1)

**Name server / Server DNS ICANN-/IANA-Begriff**

Ein DNS-Server, der Anfragen zu einem Domainnamen beantwortet. Ein autoritativer Nameserver führt die offiziellen Einträge der DNS-Zone, für die er zuständig ist.

[Quelle ↗](https://www.icann.org/en/icann-acronyms-and-terms/name-server-en)

**RDAP / Registration Data Access Protocol ICANN-/IANA-Begriff**

Ein HTTP-basiertes Protokoll für den Zugriff auf aktuelle Registrierungsdaten von Domainnamen und IP-Adressen. Es wurde als Ersatz für WHOIS mit standardisierten Formaten, HTTPS und Unterstützung für Internationalisierung entwickelt.

[Quelle ↗](https://www.icann.org/rdap/)

**WHOIS ICANN-/IANA-Begriff**

Ein Protokoll und eine Reihe von Diensten, die historisch zur Abfrage von Registrierungsdaten für Domainnamen verwendet wurden. RDAP wurde entwickelt, um das Protokoll durch einen moderneren, standardisierten Zugriff zu ersetzen.

[Quelle ↗](https://www.icann.org/resources/pages/whois-rdds-2023-11-02-en)

**Applicant ICANN-/IANA-Begriff**

Die Organisation, die bei ICANN eine Bewerbung für eine neue gTLD einreicht.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application ICANN-/IANA-Begriff**

Die formelle Bewerbung für eine neue gTLD. Eine Bewerbung ist nicht gleichbedeutend mit der Delegation der Zeichenfolge in die DNS-Root.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application round ICANN-/IANA-Begriff**

Die vollständige Abfolge der Phasen, in denen ICANN Bewerbungen aus einem bestimmten Einreichungszeitraum bearbeitet.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Delegation ICANN-/IANA-Begriff**

Die technische Eintragung einer TLD in die DNS-Root. Erst nach der Delegation wird die Zeichenfolge im globalen Namenssystem aktiv.

[Quelle ↗](https://www.iana.org/help/gtld-delegation)

**Registry operator ICANN-/IANA-Begriff**

Die Stelle, die die TLD und ihre autoritative Registry-Datenbank betreibt. Bei gTLDs geschieht dies im Rahmen eines Registry Agreement mit ICANN.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Registry Service Provider (RSP) ICANN-/IANA-Begriff**

Der Anbieter kritischer technischer Dienste für den Betrieb der Registry, getrennt von der Stelle mit der Verantwortung als Registry Operator.

[Quelle ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-evaluation/faqs/general/what-are-the-components-of-application-evaluation)

**Registrar ICANN-/IANA-Begriff**

Bei gTLDs ein von ICANN akkreditierter Vermittler, über den Nutzer Domainnamen registrieren. ccTLDs können andere Modelle verwenden.

[Quelle ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

**Registrant ICANN-/IANA-Begriff**

Die Person oder Organisation, die einen Domainnamen registriert.

[Quelle ↗](https://www.icann.org/registrants)

**Registry Agreement ICANN-/IANA-Begriff**

Die vertragliche Vereinbarung zwischen ICANN und dem Registry Operator einer gTLD.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Contention set ICANN-/IANA-Begriff**

Eine Gruppe von Bewerbungen für identische oder hinreichend ähnliche Zeichenfolgen, die nicht alle weitergeführt werden können, bevor der Wettbewerb zwischen ihnen gelöst ist.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**String contention ICANN-/IANA-Begriff**

Die Situation, in der mehrere qualifizierte Bewerbungen um dieselbe oder um als verwechslungsfähig ähnlich eingestufte Zeichenfolgen konkurrieren.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**GAC Advice ICANN-/IANA-Begriff**

Eine Stellungnahme des Governmental Advisory Committee an den ICANN Board zu einer oder mehreren Bewerbungen oder zu Fragen des öffentlichen Interesses.

[Quelle ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Name collision ICANN-/IANA-Begriff**

Eine Situation, in der ein Name, der in einem Namenssystem aufgelöst werden sollte, stattdessen in einem anderen aufgelöst wird und dadurch unerwartetes Verhalten oder Betriebsrisiken entstehen können.

[Quelle ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey/prepare-to-apply)

**Application outcome Projektmethodik**

Ein methodisches Feld von Connecting the Dots, das den dokumentierten Ausgang einer Bewerbung getrennt von Contention und Kontroversen beschreibt. Ein leeres Feld bedeutet, dass der Ausgang im lokalen Korpus nicht belegt ist.

**Outcome reason Projektmethodik**

Ein methodisches Feld, das nur bei vorhandener Quelle den Grund für einen Ausgang erfasst, etwa Rückzug, Nichtauswahl, Public Policy oder technisches Risiko.

**Governance controversy Projektmethodik**

Eine redaktionelle Kategorie von Connecting the Dots für substanzielle Konflikte über Rechte, Legitimität, öffentliches Interesse, Kontrolle oder Nutzungsbedingungen einer Zeichenfolge. Sie ist nicht mit Contention gleichzusetzen.

[Glossar als CSV herunterladen ↓](https://robertbregy.github.io/Connecting-the-Dots/data/domain_governance_glossary.csv)

FAKT EINORDNUNG

## Wer kann welchen Hebel tatsächlich betätigen?

Website, Domainregistrierung, DNS-Auflösung und Browserzugang sind verschiedene Ebenen. Unterschiedliche Akteure können an unterschiedlichen Punkten eingreifen; niemand „kontrolliert das Internet“ allein.

01

### Hosting-Provider

Kann Inhalte oder Infrastruktur entfernen oder abschalten, die er hostet.

02

### DNS-Provider

Kann autoritatives DNS nicht mehr ausliefern oder die von ihm betriebene Zone ändern.

03

### Registrar

Verwaltet die Beziehung zum Registrant und übermittelt Registrierungsänderungen an die Registry.

04

### Registry-Betreiber

Führt das TLD-Register und verarbeitet Hinzufügungen, Änderungen oder Löschungen gemäß den geltenden Regeln.

05

### Browser / Sicherheitslayer

Kann vor einem Ziel warnen, es blockieren oder ihm misstrauen, ohne die Registrierung zu verändern.

06

### ICANN

Koordiniert gTLD-Policies und Verträge, ist aber keine allgemeine Inhaltsaufsicht oder Internetpolizei.

**Dieselbe Website, unterschiedliche Hebel.**
 Inhalte abschalten, Registrierung suspendieren, DNS ändern und Zugriff blockieren sind verschiedene Eingriffe. Governance beginnt mit der richtigen Ebene.

ICANN erklärt, dass es Internetinhalte nicht kontrolliert und keine allgemeine Website-Takedown-Behörde ist.

[ICANN · registry operator ↗](https://www.icann.org/en/icann-acronyms-and-terms/registry-operator-en) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars) [ICANN · website content ↗](https://www.icann.org/resources/pages/spam-phishing-2017-06-20-en)

.lugano · Anwendungsfall Was diese allgemeinen Regeln für Luganos Bewerbung in der Runde 2026 bedeuten.

FAKT

## Von der allgemeinen Regel zum Fall .lugano

Die Bewerbung für .lugano durchläuft denselben oben beschriebenen Prozess. Bis Bewertung, Vertrag und Delegation abgeschlossen sind, bleibt .lugano eine Bewerbung und ist keine aktive TLD.

VISION

Hypothetisches Beispiel

www.servizi .lugano

Wird .lugano delegiert, kann dieselbe DNS-Struktur Adressen wie servizi.lugano oder www.servizi.lugano ermöglichen. Das Beispiel zeigt die Hierarchie; es bezeichnet keinen bereits aktiven Dienst.

## Im Fall .lugano: was die Registry regeln könnte und was dies nicht bedeuten würde

VISION

### Was die Registry regeln könnte

- Zulassungs- und Vergaberegeln für Namen unter .lugano, innerhalb der ICANN-Regeln und des anwendbaren Rechts.

- Reservierte Namen, Launch-Phasen und lokale Governance-Entscheide.

- Registrierungs-, technische und Sicherheitsanforderungen für Namen unter .lugano.

FAKT

### Was dies nicht bedeuten würde

- Lugano 'besitzt das Internet' nicht und kontrolliert weder .ch, .com noch andere TLDs.

- Eine Bewerbung ist keine Zuteilung: .lugano wird erst nach Verfahren, Vertrag und Delegation aktiv.

- ICANN betreibt die Websites der Stadt nicht; es koordiniert das globale Namenssystem und den vertraglichen Rahmen für gTLDs.

## Präzise über .lugano sprechen

Zwei wichtige Unterscheidungen, solange das Bewerbungsverfahren noch läuft.

FAKT

 Präziser

Die Stadt Lugano hat sich um die neue Top-Level-Domain .lugano beworben.

Nicht dasselbe wie

Lugano hat die Domain .lugano erhalten / besitzt sie.

VISION

 Präziser

Bei Erfolg könnte .lugano zu einem geregelten Namensraum werden, dessen Registry Operator innerhalb des ICANN-Rahmens Regeln festlegt.

Nicht dasselbe wie

Jeder wird automatisch jeden beliebigen .lugano-Namen registrieren können.

**Von Robert Bregy** · Ausgabe der Website 0.7.106 · 9. November 2026

Beobachtungsdaten stehen bei den jeweiligen Belegen. Diese Website-Ausgabe bedeutet nicht, dass alle Quellen an diesem Tag erneut überprüft wurden.
