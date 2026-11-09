<!-- Canonical: https://robertbregy.github.io/Connecting-the-Dots/guides/en/beyond/ | Site edition: 0.7.105 | Language: en -->

Guide

# Is a domain only there to find a website?

From services we use to the invisible functions of DNS, then writing systems and alternative naming systems.

[Explore in the atlas](https://robertbregy.github.io/Connecting-the-Dots/en/?tab=beyond#beyond) [Method and citation](https://robertbregy.github.io/Connecting-the-Dots/research/) [Text version](https://robertbregy.github.io/Connecting-the-Dots/guides/en/beyond/index.md)

READING

## When a TLD becomes infrastructure

Some namespaces went far beyond naming. They added eligibility, verification, security rules, public-interest governance or shared digital services.

01

**Name**

A memorable address.

02

**Qualified community**

Rules define who belongs.

03

**Verified identity**

Eligibility is checked.

04

**Security baseline**

Technical requirements become part of the namespace.

05

**Shared services**

The TLD becomes a platform for common services.

READING

Some of the clearest examples show that a TLD can encode more than a name: eligibility, identity, security, community rules and shared services.

FACT

.post

Shared services

### A TLD with a service layer

The UPU vets registrants, mandates a cybersecurity framework and operates trust.post, a Shared Services Platform for the postal and logistics sector.

[Primary source ↗](https://www.upu.int/en/universal-postal-union/activities/digital-services/post-domain)

FACT

.cat

Civic infrastructure

### A domain that funds a digital commons

The .cat registry reinvests its revenues in digital rights, tools and projects for the Catalan-speaking community, describing the wider mission as civic infrastructure.

[Primary source ↗](https://domini.cat/en/about-us)

FACT

.bank / .insurance

Verified trust

### Security rules encoded into membership

Resolving .bank and .insurance domains must implement requirements such as DNSSEC, TLS and email authentication. The suffix is designed to signal a higher-trust environment.

[Primary source ↗](https://ftld.com/security/)

FACT

.gov

Verified public identity

### The suffix itself is an institutional credential

Only verified U.S. government organizations can register .gov. CISA verifies eligibility and the identity of requesters before approval.

[Primary source ↗](https://get.gov/domains/eligibility/)

FACT

.pharmacy

External qualification

### A domain tied to accreditation

A registrant must first demonstrate compliance with NABP standards and receive accreditation. The domain is connected to an external qualification process.

[Primary source ↗](https://nabp.pharmacy/help/is-domain-name-registration-in-the-pharmacy-tld-restricted/)

FACT

.eco

Profile + commitment

### Activation requires a profile and a pledge

A .eco registration remains on hold until the registrant affirms eligibility, completes an Eco Profile and makes a public environmental commitment.

[Primary source ↗](https://go.eco/policies/eligibility/)

FACT

.swiss

Qualified namespace

### A namespace reserved for a defined community

.swiss is restricted to the Swiss community and applies eligibility rules linking the registrant and the requested name to Switzerland.

[Primary source ↗](https://www.nic.swiss/en/conditions-for-the-registration-and-the-registration-process)

FACT READING

## The invisible DNS

The DNS already does much more than turn names into IP addresses. It routes mail, publishes authentication data and certificate-authorization policy, advertises services and can carry cryptographic trust.

MX

### Mail routing

MX records tell sending systems which mail servers handle email for a domain.

[Source ↗](https://www.rfc-editor.org/rfc/rfc5321)

SPF · DKIM · DMARC

### Email authentication

SPF, DKIM and DMARC use DNS-published data to help receivers evaluate authorized and authenticated mail.

[Source 1 ↗](https://www.rfc-editor.org/rfc/rfc7208) [Source 2 ↗](https://www.rfc-editor.org/rfc/rfc6376) [Source 3 ↗](https://www.rfc-editor.org/rfc/rfc7489)

CAA

### Certificate authorization

CAA records publish which certificate authorities are authorized to issue certificates for a domain.

[Source ↗](https://www.rfc-editor.org/rfc/rfc8659)

DNSSEC

### Integrity and origin authentication

DNSSEC signs DNS data so resolvers can validate its origin and integrity through a chain of trust.

[Source ↗](https://www.icann.org/resources/pages/dnssec-2012-02-25-en)

SRV

### Service discovery

SRV records can advertise the hostname and port of services associated with a domain.

[Source ↗](https://www.rfc-editor.org/rfc/rfc2782)

SVCB · HTTPS

### Connection hints

SVCB and HTTPS records can publish service endpoints and connection parameters before a client connects.

[Source ↗](https://www.rfc-editor.org/rfc/rfc9460)

The DNS is already an infrastructure layer for routing, discovery and trust. “Beyond the domain” is therefore an extension of existing capabilities, not a departure from what DNS already does.

FACT

## The Internet is not written only in Latin characters

Internationalized Domain Names allow top-level domains in non-ASCII scripts. Universal Acceptance is the practical requirement that browsers, email systems and applications actually accept them.

.中国 .السعودية .ไทย .рф .ευ

**Universal Acceptance**

A name can be valid in the global DNS and still fail in an application that assumes old ASCII-only or short-TLD rules. Universal Acceptance is about removing those technical barriers.

Global naming requires more than delegation. Software has to recognize the names people are actually allowed to use.

[IANA · root database ↗](https://www.iana.org/domains/root/db) [ICANN · Universal Acceptance ↗](https://www.icann.org/resources/pages/universal-acceptance-faqs-2014-09-26-en/)

FACT READING

## One dot, different universes

A dot-separated string can look like a domain while belonging to a different naming regime. Visual similarity does not mean the same root, resolver or governance system.

DNS

**Public DNS root**

.com, .ch, .中国 and other delegated TLDs live in the globally coordinated DNS root.

RFC

**Special-use DNS names**

.test, .localhost, .invalid, .onion and home.arpa have standards-defined special behavior; they are not ordinary public-root TLD registrations.

.test · .localhost · .onion · home.arpa

ALT

**Alternative naming systems**

.eth is part of Ethereum Name Service; Handshake describes itself as an experimental peer-to-peer root naming system. These are different naming systems, not ICANN-root TLDs.

.eth · Handshake

**Looks like a domain ≠ is a public DNS TLD.**
 The important question is not only what comes after the dot, but which root and resolution system gives that label meaning.

[IANA · special-use names ↗](https://www.iana.org/assignments/special-use-domain-names) [ENS · protocol ↗](https://docs.ens.domains/learn/protocol/) [Handshake ↗](https://handshake.org/)

**By Robert Bregy** · Site edition 0.7.105 · November 9, 2026

Observation dates are stated beside the evidence. This site edition does not imply that every source was checked again on this date.
