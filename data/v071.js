/* v0.7.1: factual corrections and pre-publication hardening */
(function(){
const D=window.DOT_DATA;if(!D)return;

/* Application types/designations are taken from the ICANN 2026 Round FAQ.
   Historical TLDs are deliberately not used as if they were 2026 examples. */
D.tldModels=[
 {axis:'application',id:'general',labelKey:'modelGeneral',bodyKey:'modelGeneralBody',example:'',label:'General application',description:'A 2026 application that does not fall into a specialized application type.'},
 {axis:'application',id:'geographic',labelKey:'modelGeo',bodyKey:'modelGeoBody',example:'',label:'Geographic Name application',description:'A specialized application for a string that meets the 2026 geographic-name criteria and applicable support or non-objection requirements.'},
 {axis:'application',id:'reserved',labelKey:'modelReserved',bodyKey:'modelReservedBody',example:'',label:'Reserved Name application',description:'A specialized application involving a name reserved under the 2026 Applicant Guidebook rules.'},
 {axis:'application',id:'community',labelKey:'modelCommunity',bodyKey:'modelCommunityBody',example:'',label:'Community Application',description:'A specialized application linked to a clearly delineated community and the additional commitments required for that designation.'},
 {axis:'application',id:'brand',labelKey:'modelBrand',bodyKey:'modelBrandBody',example:'',label:'.Brand TLD application',description:'A specialized application for an eligible string tied to a registered trademark and its qualifying operator.'},
 {axis:'application',id:'idn',labelKey:'modelIdn',bodyKey:'modelIdnBody',example:'',label:'IDN application',description:'An application for a TLD string represented in a script supported through the Internationalized Domain Name framework.'},
 {axis:'application',id:'variant',labelKey:'modelVariant',bodyKey:'modelVariantBody',example:'',label:'Variant string application',description:'An application involving one or more variant strings evaluated with the primary applied-for string under the 2026 rules.'},
 {axis:'application',id:'government',labelKey:'modelGov',bodyKey:'modelGovBody',example:'',label:'Government / IGO application',description:'An application submitted by a government or intergovernmental organization and treated as a specialized application.'},
 {axis:'application',id:'support',labelKey:'modelSupport',bodyKey:'modelSupportBody',example:'',label:'Applicant Support',description:'An application from an applicant qualifying for assistance through the Applicant Support Program is treated as specialized.'},
 {axis:'access',id:'open',labelKey:'modelOpen',bodyKey:'modelOpenBody',example:'.com',label:'Open registration',description:'A namespace broadly open to eligible registrants under its registry and registrar rules.'},
 {axis:'access',id:'verified',labelKey:'modelVerified',bodyKey:'modelVerifiedBody',example:'.bank',label:'Restricted / verified',description:'A namespace where eligibility is verified and registration is limited under additional registry policies.'}
];

/* Registration lifecycle: expiration and deletion are not a single mandatory linear path.
   The 30-day redemptionPeriod follows a registrar deletion request for applicable gTLD names;
   a subsequent pendingDelete period lasts five days before purge. */
D.domainLifecycle=[
 {id:'available',labelKey:'lifeAvailable',bodyKey:'lifeAvailableBody',label:'Available',description:'The name is not currently registered and may be eligible under the registry policy.'},
 {id:'registered',labelKey:'lifeRegistered',bodyKey:'lifeRegisteredBody',label:'Registered',description:'A registrant enters a registration agreement through a registrar; the registry records the name.'},
 {id:'renewed',labelKey:'lifeRenewed',bodyKey:'lifeRenewedBody',label:'Renewal loop',description:'The registration can be renewed for another term under the applicable agreement and policies.'},
 {id:'expired',labelKey:'lifeExpired',bodyKey:'lifeExpiredBody',label:'Expired',description:'If the registration term ends, post-expiration rules apply; renewal or restoration may still be possible depending on policy and timing.'},
 {id:'redemption',labelKey:'lifeRedemption',bodyKey:'lifeRedemptionBody',label:'Redemption period',description:'If an applicable gTLD registration is deleted by the registrar, it enters a 30-day redemptionPeriod during which restoration may be possible.'},
 {id:'pendingDelete',labelKey:'lifePendingDelete',bodyKey:'lifePendingDeleteBody',label:'PendingDelete',description:'If it is not restored during redemptionPeriod, the name enters pendingDelete for five days and cannot be restored.'},
 {id:'availableAgain',labelKey:'lifeAvailableAgain',bodyKey:'lifeAvailableAgainBody',label:'Available again',description:'After purge from the registry database, the name may become available for registration again under the registry policy.'}
];

D.digitalResourceAi={year:2026,projectedRevenueEC:253557731,projectedRevenueECM:253.6,source:'https://haa-ai.gov.ai/document/2026-03-18-011937_1898942126.pdf'};

D.sources=(D.sources||[]).filter(s=>s&&s[1]!=='https://haa-ai.gov.ai/document/2026-03-18-011900_862974747.pdf');

function addSource(label,url){if(!(D.sources||[]).some(s=>s&&s[1]===url))D.sources.push([label,url,'primary'])}
[
 ['ICANN — 2026 application types','https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-types/faqs/general/what-types-of-gtld-applications-can-be-submitted-in-the-new-gtld-program'],
 ['ICANN — domain renewals and expiration FAQ','https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en/'],
 ['ICANN — EPP status codes','https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en'],
 ['IANA — root zone manager and maintainer roles','https://www.iana.org/dnssec/procedures/ksk-operator/ksk-dps-20201104.html'],
 ['ICANN — accredited registrars','https://www.icann.org/en/contracted-parties/accredited-registrars'],
 ['ICANN — spam, phishing and website content','https://www.icann.org/resources/pages/spam-phishing-2017-06-20-en'],
 ['Government of Anguilla — 2026 budget estimates','https://haa-ai.gov.ai/document/2026-03-18-011937_1898942126.pdf']
].forEach(x=>addSource(x[0],x[1]));
D.v071Version='0.7.1';
})();
