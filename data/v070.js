/* v0.7.0: namespace as infrastructure, market, contract and cultural institution */
(function(){
const D=window.DOT_DATA;if(!D)return;
D.namespaceDimensions=[
 {id:'address',labelKey:'dimAddress',bodyKey:'dimAddressBody',label:'Address',description:'A human-readable identifier that points users and software toward Internet resources.'},
 {id:'contract',labelKey:'dimContract',bodyKey:'dimContractBody',label:'Contract',description:'A registration exists through contractual relationships among registrant, registrar and registry.'},
 {id:'market',labelKey:'dimMarket',bodyKey:'dimMarketBody',label:'Market',description:'Names can have retail prices, premium pricing, renewals and secondary-market value.'},
 {id:'jurisdiction',labelKey:'dimJurisdiction',bodyKey:'dimJurisdictionBody',label:'Jurisdiction',description:'Policies, eligibility rules and legal obligations differ across namespaces and operators.'},
 {id:'identity',labelKey:'dimIdentity',bodyKey:'dimIdentityBody',label:'Identity',description:'A domain can accumulate reputation and become a persistent identifier for an institution, place or person.'},
 {id:'trust',labelKey:'dimTrust',bodyKey:'dimTrustBody',label:'Trust boundary',description:'Some namespaces add verification, security requirements or cryptographic validation around names.'},
 {id:'culture',labelKey:'dimCulture',bodyKey:'dimCultureBody',label:'Cultural sign',description:'Communities and language can give a TLD meanings far beyond its formal designation.'},
 {id:'politics',labelKey:'dimPolitics',bodyKey:'dimPoliticsBody',label:'Political object',description:'Country codes, geographic names and allocation disputes can reflect institutions, borders and public authority.'}
];
D.domainLifecycle=[
 {id:'available',labelKey:'lifeAvailable',bodyKey:'lifeAvailableBody',label:'Available',description:'The name is not currently registered and may be eligible for registration under the registry policy.'},
 {id:'registered',labelKey:'lifeRegistered',bodyKey:'lifeRegisteredBody',label:'Registered',description:'A registrant enters a registration agreement through a registrar; the registry records the name.'},
 {id:'renewed',labelKey:'lifeRenewed',bodyKey:'lifeRenewedBody',label:'Renewed',description:'The registration is maintained for another term under the applicable agreement and policies.'},
 {id:'expired',labelKey:'lifeExpired',bodyKey:'lifeExpiredBody',label:'Expired',description:'The registration term ends; the name can pass through post-expiration states before deletion.'},
 {id:'redemption',labelKey:'lifeRedemption',bodyKey:'lifeRedemptionBody',label:'Redemption',description:'For applicable gTLD names, a 30-day Redemption Grace Period may allow restoration before final deletion.'},
 {id:'deleted',labelKey:'lifeDeleted',bodyKey:'lifeDeletedBody',label:'Deleted / available again',description:'After the applicable lifecycle completes, a deleted name may become available for a new registration.'}
];
D.controlLevers=[
 {id:'hosting',labelKey:'leverHosting',bodyKey:'leverHostingBody',label:'Hosting provider',description:'Can remove or disable hosted content or infrastructure it controls.'},
 {id:'dns',labelKey:'leverDns',bodyKey:'leverDnsBody',label:'DNS provider',description:'Can stop serving authoritative DNS or change resolution for zones it operates.'},
 {id:'registrar',labelKey:'leverRegistrar',bodyKey:'leverRegistrarBody',label:'Registrar',description:'Maintains the registrant relationship and submits registration changes to the registry.'},
 {id:'registry',labelKey:'leverRegistry',bodyKey:'leverRegistryBody',label:'Registry operator',description:'Maintains the TLD registry and can add, modify or delete registrations through the registry system under applicable rules.'},
 {id:'browser',labelKey:'leverBrowser',bodyKey:'leverBrowserBody',label:'Browser / security layer',description:'Can warn, block or distrust destinations independently of the domain registration itself.'},
 {id:'icann',labelKey:'leverIcann',bodyKey:'leverIcannBody',label:'ICANN',description:'Coordinates policies and contracts for gTLDs but is not a general-purpose content regulator or Internet police force.'}
];
D.dnsCapabilities=[
 {id:'routing',code:'MX',labelKey:'dnsMail',bodyKey:'dnsMailBody',label:'Mail routing',description:'MX records direct email toward mail servers for a domain.',sources:['https://www.rfc-editor.org/rfc/rfc5321']},
 {id:'auth',code:'SPF · DKIM · DMARC',labelKey:'dnsAuth',bodyKey:'dnsAuthBody',label:'Email authentication',description:'DNS-published policies and keys help receivers evaluate whether mail is authorized and authenticated.',sources:['https://www.rfc-editor.org/rfc/rfc7208','https://www.rfc-editor.org/rfc/rfc6376','https://www.rfc-editor.org/rfc/rfc7489']},
 {id:'cert',code:'CAA',labelKey:'dnsCert',bodyKey:'dnsCertBody',label:'Certificate authorization',description:'CAA records let a domain indicate which certificate authorities may issue certificates for it.',sources:['https://www.rfc-editor.org/rfc/rfc8659']},
 {id:'integrity',code:'DNSSEC',labelKey:'dnsIntegrity',bodyKey:'dnsIntegrityBody',label:'Integrity and origin authentication',description:'DNSSEC adds cryptographic signatures that allow resolvers to validate DNS data and a chain of trust.',sources:['https://www.icann.org/resources/pages/dnssec-2012-02-25-en']},
 {id:'services',code:'SRV',labelKey:'dnsDiscovery',bodyKey:'dnsDiscoveryBody',label:'Service discovery',description:'SRV records can advertise the hostname and port of services associated with a domain.',sources:['https://www.rfc-editor.org/rfc/rfc2782']},
 {id:'https',code:'SVCB · HTTPS',labelKey:'dnsHttps',bodyKey:'dnsHttpsBody',label:'Connection hints',description:'SVCB and HTTPS records can publish service endpoints and connection parameters before an application connects.',sources:['https://www.rfc-editor.org/rfc/rfc9460']}
];
D.tldModels=[
 {axis:'application',id:'general',labelKey:'modelGeneral',bodyKey:'modelGeneralBody',example:'general',label:'General application',description:'A 2026 application that does not fall into a specialized type.'},
 {axis:'application',id:'community',labelKey:'modelCommunity',bodyKey:'modelCommunityBody',example:'.cat',label:'Community application',description:'A specialized application linked to a clearly delineated community and additional commitments.'},
 {axis:'application',id:'geographic',labelKey:'modelGeo',bodyKey:'modelGeoBody',example:'.berlin / .lugano',label:'Geographic name',description:'A string that meets the 2026 geographic-name criteria and may require governmental support or non-objection.'},
 {axis:'application',id:'brand',labelKey:'modelBrand',bodyKey:'modelBrandBody',example:'.google',label:'.Brand',description:'A specialized application tied to a registered trademark and brand operator.'},
 {axis:'application',id:'idn',labelKey:'modelIdn',bodyKey:'modelIdnBody',example:'.中国 / .السعودية',label:'IDN / variant',description:'Applications or delegated names using non-ASCII scripts and, where applicable, variant relationships.'},
 {axis:'application',id:'government',labelKey:'modelGov',bodyKey:'modelGovBody',example:'government / IGO applicant',label:'Government / IGO',description:'Applications from governments or intergovernmental organizations can carry specialized handling or contract provisions.'},
 {axis:'access',id:'open',labelKey:'modelOpen',bodyKey:'modelOpenBody',example:'.com',label:'Open registration',description:'A namespace broadly open to eligible registrants under standard registry and registrar rules.'},
 {axis:'access',id:'verified',labelKey:'modelVerified',bodyKey:'modelVerifiedBody',example:'.bank',label:'Restricted / verified',description:'Registration is limited to verified eligible organizations and subject to additional registry policies.'}
];
D.successFramework=[
 {id:'scale',labelKey:'successScale',bodyKey:'successScaleBody',label:'Scale',description:'How many names are registered, and how quickly the namespace grows or contracts.'},
 {id:'use',labelKey:'successUse',bodyKey:'successUseBody',label:'Active use',description:'Whether registered names resolve to real services, websites, email or machine-readable endpoints.'},
 {id:'renewal',labelKey:'successRenewal',bodyKey:'successRenewalBody',label:'Renewal',description:'Whether registrants keep names over time rather than treating the namespace as disposable inventory.'},
 {id:'trust',labelKey:'successTrust',bodyKey:'successTrustBody',label:'Trust and abuse',description:'Security controls, abuse rates, verification requirements and the credibility attached to the namespace.'},
 {id:'diversity',labelKey:'successDiversity',bodyKey:'successDiversityBody',label:'Diversity',description:'How registrations are distributed across registrants, registrars, sectors and geographies.'},
 {id:'purpose',labelKey:'successPurpose',bodyKey:'successPurposeBody',label:'Purpose fulfilment',description:'Whether the namespace achieves the mission for which it exists, even if raw registration volume is modest.'},
 {id:'civic',labelKey:'successCivic',bodyKey:'successCivicBody',label:'Public value',description:'For civic namespaces: local adoption, verified actors, useful services, interoperability and measurable public value.'}
];
D.digitalResourceAi={year:2025,projectedRevenueECM:132,source:'https://haa-ai.gov.ai/document/2026-03-18-011900_862974747.pdf'};
function addSource(label,url){if(!(D.sources||[]).some(s=>s&&s[1]===url))D.sources.push([label,url,'primary'])}
[
 ['ICANN — DNSSEC overview','https://www.icann.org/resources/pages/dnssec-2012-02-25-en'],
 ['IANA — Special-Use Domain Names','https://www.iana.org/assignments/special-use-domain-names'],
 ['ICANN — Universal Acceptance FAQ','https://www.icann.org/resources/pages/universal-acceptance-faqs-2014-09-26-en/'],
 ['IANA — Root Zone Database','https://www.iana.org/domains/root/db'],
 ['ICANN — Domain registration definition','https://www.icann.org/en/icann-acronyms-and-terms/domain-name-registration-en'],
 ['ICANN — Redemption Grace Period','https://www.icann.org/resources/pages/grace-2013-05-03-en'],
 ['ICANN — 2026 application types','https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-types/faqs/general/what-types-of-gtld-applications-can-be-submitted-in-the-new-gtld-program'],
 ['ICANN — Closed Generics','https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-types/faqs/non-permitted-strings/what-are-closed-generics'],
 ['ICANN — Registry operator definition','https://www.icann.org/en/icann-acronyms-and-terms/registry-operator-en'],
 ['ICANN — Registrar definition','https://www.icann.org/en/icann-acronyms-and-terms/registrar-en'],
 ['fTLD — .BANK eligibility','https://register.bank/eligibility/'],
 ['Government of Anguilla — 2025 budget and .AI revenue projection','https://haa-ai.gov.ai/document/2026-03-18-011900_862974747.pdf'],
 ['ENS — protocol overview','https://docs.ens.domains/learn/protocol/'],
 ['Handshake — alternative root naming system','https://handshake.org/'],
 ['RFC 5321 — SMTP / MX','https://www.rfc-editor.org/rfc/rfc5321'],
 ['RFC 7208 — SPF','https://www.rfc-editor.org/rfc/rfc7208'],
 ['RFC 6376 — DKIM','https://www.rfc-editor.org/rfc/rfc6376'],
 ['RFC 7489 — DMARC','https://www.rfc-editor.org/rfc/rfc7489'],
 ['RFC 8659 — CAA','https://www.rfc-editor.org/rfc/rfc8659'],
 ['RFC 2782 — SRV','https://www.rfc-editor.org/rfc/rfc2782'],
 ['RFC 9460 — SVCB and HTTPS','https://www.rfc-editor.org/rfc/rfc9460']
].forEach(x=>addSource(...x));
D.v070Version='0.7.0';
})();
