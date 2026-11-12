<!-- Canonical: https://robertbregy.github.io/Connecting-the-Dots/guides/en/how/ | Site edition: 0.7.111 | Language: en -->

Guide

# How does an Internet name work?

First the address and the actors, then the lifecycle, economics and rules. The glossary is always within reach.

[Explore in the atlas](https://robertbregy.github.io/Connecting-the-Dots/en/?tab=how#how) [Method and citation](https://robertbregy.github.io/Connecting-the-Dots/research/) [Text version](https://robertbregy.github.io/Connecting-the-Dots/guides/en/how/index.md)

FACT

## How Internet domains actually work

The essential concepts for navigating Internet domains, DNS and Internet governance.

www.example .com

In **www.example.com**, **.com** is the top-level domain (TLD). “example” is the second-level label; the name registered under .com is **example.com**. “www” is an additional label identifying a subdomain.

.

**Root**

The invisible top of the DNS hierarchy.

.com

**Top-level domain**

The final part: .ch, .com, .org.

example

**Second-level label**

Here, “example” is the label immediately to the left of .com. Together they form the domain name example.com.

www

**Optional label**

An optional label added in front of the registered name. In www.example.com, “www” can identify a specific site or service; it is not part of the TLD.

FACT

## Who does what?

The Internet has no single “owner”. It works through distinct roles, contracts and technical coordination.

POLICY

### ICANN

Coordinates policies and contracts for generic top-level domains through a global multistakeholder model.

ROOT

### IANA / PTI

Acts as Root Zone Manager: PTI receives and validates TLD change requests and manages the authoritative delegation data for the DNS root.

MAINTAIN

### Root Zone Maintainer

Verisign implements validated root-zone changes as the operational Root Zone Maintainer under contract with ICANN.

GOVERNANCE

### Registry operator

Operates a TLD and its authoritative registry database. gTLD operators work under ICANN registry agreements; ccTLD governance arrangements differ.

TECH

### Registry Service Provider

Provides critical technical registry services such as DNS and registration infrastructure for the registry operator.

RETAIL

### Registrar

For gTLDs, an ICANN-accredited registrar provides the direct registration channel to registrants. ccTLDs use their own registry and registrar models.

USER

### Registrant

The person or organization that registers and uses a domain name under the TLD.

[IANA · Root Zone Manager / Maintainer ↗](https://www.iana.org/dnssec/procedures/ksk-operator/ksk-dps-20201104.html) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

FACT

## What do you actually get when you register a domain?

Registration is not the purchase of a piece of the Internet. A registrant enters a contractual relationship, and the name remains subject to renewal, registry policy and the applicable lifecycle.

01 **Available**

The name is not currently registered and may be eligible under the registry policy.

02 **Registered**

A registrant enters an agreement through a registrar and the registry records the name.

 ↺ Renewal loop

03 **Expired**

If the registration term ends, post-expiration rules apply. Renewal or restoration may still be possible depending on policy and timing.

If the registrar deletes an applicable gTLD registration

04 **Redemption period**

If an applicable gTLD registration is deleted by the registrar, it enters a 30-day redemptionPeriod during which restoration may be possible.

05 **PendingDelete**

If it is not restored during redemptionPeriod, the name enters pendingDelete for five days and cannot be restored.

06 **Available again**

After purge from the registry database, the name may become available for registration again under the registry policy.

This is a simplified gTLD-oriented map, not one universal lifecycle. Expiration does not automatically equal deletion. Registry, registrar and ccTLD policies can differ.

[ICANN · renewal & expiration ↗](https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en/) [ICANN · EPP status codes ↗](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en)

READING

## What is a dot?

A domain is a technical identifier with legal, economic, institutional and cultural dimensions. These eight perspectives explain what can gather around one name.

01

### Address

A human-readable identifier that helps users and software find Internet resources.

02

### Contract

A registration exists through agreements among registrant, registrar and registry.

03

### Market

Names can carry retail prices, premium pricing, renewals and secondary-market value.

04

### Jurisdiction

Eligibility, policies and legal duties vary across namespaces and operators.

05

### Identity

A domain can accumulate reputation and become a persistent identifier for a person, place or institution.

06

### Trust boundary

Verification, DNSSEC and registry rules can add trust signals around a name.

07

### Cultural sign

Communities and language can give a TLD meanings that its original designation never anticipated.

08

### Political object

Country codes, city names and allocation disputes can reflect institutions, borders and public authority.

**The dot is technical. What societies build around it is not.**
 A useful way to read a TLD is to ask which layer is doing the work: addressing, allocation, governance, trust, market value, identity or cultural meaning.

FACT READING

### One word, two naming systems: .bit

The frozen 2026 secondary index shows 11 ICANN applications for .bit. Namecoin already uses .bit in a separate blockchain-based naming system. It is not a delegated TLD in the ICANN global DNS root and ordinary DNS resolvers do not automatically use Namecoin's records. This is a namespace collision risk to explain, not a claim that Namecoin is one of the 11 applicants.

[Namecoin · .bit namespace ↗](https://www.namecoin.org/dot-bit/) [nTLDData · 2026 Reveal Day ↗](https://www.ntlddata.com/applications/strings)

### Related explanations

These are general explanations, not new cases from the 2026 application round. They clarify what happens beyond the TLD and what decisions ICANN does or does not make.

**Can a working domain still be blocked?** DNS filtering, suspended domains, network shutdowns and ICANN's role explained through an interactive example.

[Internet filtering, DNS and shutdowns ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/en/who-controls-internet-access/) [International sanctions and ICANN ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/en/sanctions-and-dns/)

General principles How the DNS, TLD roles and the new-gTLD process work, independently of .lugano.

READING

## The economics of the dot

The same domain can sit inside several markets at once: registration, renewal, premium pricing, registry services and secondary-market trading.

**Registrant** Chooses the name and pays the retail registration or renewal price.

 →

**Registrar** Provides the retail channel and submits registration transactions to the registry.

 →

**Registry** Operates the TLD database and sets the registry-side commercial and policy model within its framework.

 ↗

**ICANN layer** For gTLDs, contractual and fee relationships also sit above the registry and registrar ecosystem.

**Aftermarket** Existing registrations can acquire resale value independently of the registry’s wholesale price.

A domain price is not one thing. Wholesale, retail, premium and aftermarket value belong to different layers.

FACT

## How a new TLD is born

The 2026 process is not “apply and receive”. It is a staged public process.

01

**Application**

Applicant files the application and pays the required fee.

02

**Reveal**

ICANN publishes public application data and identifies identical-string contention.

03

**Input & objections**

Community input, formal objections and relevant government advice can enter the process.

04

**Evaluation**

String, applicant, operational, financial and technical components are evaluated.

05

**Contention**

If multiple applicants seek the same or confusingly similar string, the contention must be resolved.

06

**Contract**

A successful applicant signs the Base Registry Agreement with ICANN.

07

**Delegation**

After onboarding and technical checks, IANA/PTI processes the delegation request and the Root Zone Maintainer implements the validated change in the DNS root.

08

**Launch**

Only then can the registry move toward actually using and allocating names under the TLD.

[Official explainer · ICANN Applicant Journey ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey)

FACT READING

## Two different questions: what kind of application is it, and who can register?

ICANN application types and day-to-day registration access are different axes. A namespace can be geographic, community or brand-oriented and still impose very different access rules.

### 2026 application types / designations

#### General

An application that does not fall into a specialized application type.

#### Geographic Name

A specialized application for a string meeting the 2026 geographic-name criteria and applicable support or non-objection requirements.

#### Reserved Name

A specialized application involving a name reserved under the 2026 Applicant Guidebook rules.

#### Community

A specialized application linked to a clearly delineated community and the additional commitments required for that designation.

#### .Brand

A specialized application for an eligible string tied to a registered trademark and qualifying brand operator.

#### IDN

An application for a TLD string represented in a script supported through the Internationalized Domain Name framework.

#### Variant string

An application involving variant strings evaluated together with the primary applied-for string.

#### Government / IGO

An application submitted by a government or intergovernmental organization and treated as specialized.

#### Applicant Support

An application from an applicant qualifying for assistance through the Applicant Support Program is treated as specialized.

### Operational access model

.com

#### Open registration

A namespace broadly open to eligible registrants under standard registry rules.

.bank

#### Restricted / verified

A namespace where eligibility must be verified; .BANK is an example for regulated banking organizations.

These labels describe ICANN’s 2026 application designations. Historical TLDs are not presented here as if they were 2026 examples. “Open” or “restricted” instead describes practical registration access after delegation.

[ICANN · application types ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-types/faqs/general/what-types-of-gtld-applications-can-be-submitted-in-the-new-gtld-program) [.BANK · eligibility ↗](https://register.bank/eligibility/)

FACT

## Precise words, clear concepts

The essential concepts for navigating domains, DNS and Internet governance.

FACT

 More precise

A top-level domain is the final part of an Internet address, such as .ch or .com.

Not the same thing

A TLD is simply a new website address.

FACT

 More precise

ICANN coordinates the global domain-name system and the new-gTLD process.

Not the same thing

ICANN is the government or owner of the Internet.

FACT

## Essential glossary

The terms that make the Explorer easier to read. Official ICANN/IANA vocabulary is kept separate from Connecting the Dots methodology fields.

ICANN / IANA term Project methodology

**ICANN ICANN / IANA term**

Internet Corporation for Assigned Names and Numbers. A nonprofit public-benefit organization that coordinates the Internet’s unique identifier systems and supports related policy development, including the DNS.

[Source ↗](https://www.icann.org/resources/pages/about-icann)

**IANA / Internet Assigned Numbers Authority ICANN / IANA term**

Functions that maintain authoritative registries for the Internet’s globally unique technical identifiers, including domain names, numbers and protocol parameters. The IANA functions are performed by PTI, an ICANN affiliate.

[Source ↗](https://www.iana.org/about)

**DNS / Domain Name System ICANN / IANA term**

The Internet’s distributed, hierarchical naming system. It lets clients query readable names such as example.com and obtain information needed to reach associated services, such as IP addresses.

[Source ↗](https://www.icann.org/en/beginners)

**TLD / Top-Level Domain ICANN / IANA term**

A domain immediately below the DNS root, such as .ch or .com. The string .lugano is an application in the 2026 round and is not yet delegated.

[Source ↗](https://www.iana.org/domains/root)

**DNS root / Root zone ICANN / IANA term**

The highest level of the DNS hierarchy. The root zone contains the delegations of TLDs recognized by the global DNS.

[Source ↗](https://www.iana.org/domains/root)

**gTLD / Generic Top-Level Domain ICANN / IANA term**

The category of generic top-level domains, such as .com, distinct from ccTLDs and the infrastructure domain .arpa. It includes legacy extensions and new gTLDs introduced through ICANN programs.

[Source ↗](https://www.iana.org/domains/root/db)

**ccTLD / Country-Code Top-Level Domain ICANN / IANA term**

A TLD associated with a country or territory, normally based on a two-letter ISO 3166-1 code or an approved IDN string.

[Source ↗](https://www.iana.org/help/eligible-tlds)

**IDN / Internationalized Domain Name ICANN / IANA term**

A domain name that uses characters beyond the basic ASCII set, for example characters from non-Latin scripts.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**A-label / Punycode ICANN / IANA term**

A-label: the ASCII representation of an IDNA-valid IDN label, always beginning with xn--. Punycode is the algorithm used to encode the part following that prefix.

[Source ↗](https://datatracker.ietf.org/doc/html/rfc5890#section-2.3.2.1)

**Name server / Server DNS ICANN / IANA term**

A DNS server that answers queries about a domain name. An authoritative name server hosts the official records for the DNS zone for which it is responsible.

[Source ↗](https://www.icann.org/en/icann-acronyms-and-terms/name-server-en)

**RDAP / Registration Data Access Protocol ICANN / IANA term**

An HTTP-based protocol for accessing current domain-name registration and IP-address data. It was designed as a replacement for WHOIS, with standardized formats, HTTPS and internationalization support.

[Source ↗](https://www.icann.org/rdap/)

**WHOIS ICANN / IANA term**

A protocol and set of services historically used to query domain-name registration data. RDAP was designed to replace the protocol with more modern, standardized access.

[Source ↗](https://www.icann.org/resources/pages/whois-rdds-2023-11-02-en)

**Applicant ICANN / IANA term**

The entity that submits an application to ICANN for a new gTLD.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application ICANN / IANA term**

The formal application for a new gTLD. An application is not the same as delegation of the string into the DNS root.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application round ICANN / IANA term**

The complete sequence of stages through which ICANN processes applications received during a specific submission period.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Delegation ICANN / IANA term**

The technical insertion of a TLD into the DNS root. Only after delegation does the string become active in the global naming system.

[Source ↗](https://www.iana.org/help/gtld-delegation)

**Registry operator ICANN / IANA term**

The entity that operates the TLD and its authoritative registry database. For gTLDs it operates under a Registry Agreement with ICANN.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Registry Service Provider (RSP) ICANN / IANA term**

The provider of critical technical services needed to run the registry, distinct from the entity holding registry-operator responsibility.

[Source ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-evaluation/faqs/general/what-are-the-components-of-application-evaluation)

**Registrar ICANN / IANA term**

For gTLDs, an ICANN-accredited intermediary that provides users with the channel for registering domain names. ccTLDs may use different models.

[Source ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

**Registrant ICANN / IANA term**

The person or organization that registers a domain name.

[Source ↗](https://www.icann.org/registrants)

**Registry Agreement ICANN / IANA term**

The contractual agreement between ICANN and the registry operator of a gTLD.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Contention set ICANN / IANA term**

A group of applications for identical or sufficiently similar strings that cannot all proceed without first resolving competition among them.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**String contention ICANN / IANA term**

The situation in which more than one qualified application competes for the same string or for strings considered confusingly similar.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**GAC Advice ICANN / IANA term**

Advice from the Governmental Advisory Committee to the ICANN Board concerning one or more applications or public-policy matters.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Name collision ICANN / IANA term**

A situation in which a name intended to be resolved in one naming system is instead resolved in another, potentially causing unexpected behavior or operational risk.

[Source ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey/prepare-to-apply)

**Application outcome Project methodology**

A Connecting the Dots methodology field describing the documented outcome of an application separately from contention and controversy. A blank field means the outcome is not proven in the local corpus.

**Outcome reason Project methodology**

A methodology field recording, only when supported by a source, the reason for an outcome, such as withdrawal, non-selection, public policy or technical risk.

**Governance controversy Project methodology**

A Connecting the Dots editorial category for substantive conflicts over rights, legitimacy, public interest, control or conditions of use of a string. It is not the same as contention.

[Download the glossary as CSV ↓](https://robertbregy.github.io/Connecting-the-Dots/data/domain_governance_glossary.csv)

FACT READING

## Who can actually pull which lever?

A website, a domain registration, DNS resolution and browser access are different layers. Different actors can intervene at different points; no single organization “controls the Internet”.

01

### Hosting provider

Can remove or disable content or infrastructure it hosts.

02

### DNS provider

Can stop serving authoritative DNS or alter the zone it operates.

03

### Registrar

Maintains the registrant relationship and submits registration changes to the registry.

04

### Registry operator

Maintains the TLD registry and processes additions, changes or deletions under applicable rules.

05

### Browser / security layer

Can warn, block or distrust a destination without changing the registration itself.

06

### ICANN

Coordinates gTLD policy and contracts, but is not a general-purpose content regulator or Internet police force.

**Same website, different levers.**
 Taking content offline, suspending a registration, changing DNS and blocking access are not the same action. Governance starts by identifying the layer.

ICANN states that it does not control Internet content and is not a general-purpose website takedown authority.

[ICANN · registry operator ↗](https://www.icann.org/en/icann-acronyms-and-terms/registry-operator-en) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars) [ICANN · website content ↗](https://www.icann.org/resources/pages/spam-phishing-2017-06-20-en)

.lugano · applied case What those general rules mean for Lugano’s 2026 application.

FACT

## From the general rule to .lugano

The .lugano application follows the same process described above. Until evaluation, contracting and delegation are completed, .lugano remains an application and is not an active TLD.

VISION

Hypothetical example

www.servizi .lugano

If .lugano is delegated, the same DNS structure could produce addresses such as servizi.lugano or www.servizi.lugano. This illustrates the hierarchy; it is not a live service.

## For .lugano: what the registry could govern, and what it would not mean

VISION

### What the registry could govern

- Eligibility and allocation policies for names under .lugano, within ICANN rules and applicable law.

- Reserved names, launch phases and local governance choices.

- Registration-policy and security requirements for names operating under .lugano.

FACT

### What it would not mean

- Lugano does not “own the Internet” or control .ch, .com or other TLDs.

- An application is not an assignment: .lugano is not active until the process, contract and delegation are complete.

- ICANN does not operate the City’s websites; it coordinates the global naming system and the gTLD contractual framework.

## Speaking precisely about .lugano

Two distinctions that matter while the application is still in process.

FACT

 More precise

The City of Lugano has applied for the new top-level domain .lugano.

Not the same thing

Lugano has obtained / owns the .lugano domain.

VISION

 More precise

If successful, .lugano could become a governed namespace under rules defined by its registry operator within the ICANN framework.

Not the same thing

Anyone will automatically be able to register any .lugano name.

**By Robert Bregy** · Site edition 0.7.111 · November 12, 2026

Observation dates are stated beside the evidence. This site edition does not imply that every source was checked again on this date.
