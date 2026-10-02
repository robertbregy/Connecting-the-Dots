/* v0.6.0: post-Reveal publication architecture + geography of Internet power */
(function(){
const D=window.DOT_DATA;
// Publication build: remove superseded pre-Reveal secondary tracking from the public source list.
D.sources=(D.sources||[]).filter(s=>!String((s&&s[0])||'').toLowerCase().includes('tldz')&&!String((s&&s[0])||'').toLowerCase().includes('pre-reveal'));

D.round2026={
  applications:1616,
  uniqueStrings:null,
  applicantOrganizations:null,
  countriesTerritories:null,
  contentionSets:null,
  geographicApplications:null,
  communityApplications:null,
  brandApplications:null,
  idnVariantApplications:null,
  cityTerritorialStrings:null,
  topApplicantName:null,
  topApplicantApplications:null,
  topApplicantGroupName:null,
  topApplicantGroupApplications:null,
  topApplicantCountries:[],
  revealDate:'2026-10-07T18:00:00Z',
  stringConfirmationDate:'2026-11-17'
};
D.geoApplicantRegions2026=[
  {name:'North America',code:'NA',count:null,lat:43,lon:-100},
  {name:'Europe',code:'EUR',count:null,lat:50,lon:15},
  {name:'Asia-Pacific',code:'AP',count:null,lat:22,lon:110},
  {name:'Latin America & Caribbean',code:'LAC',count:null,lat:-15,lon:-60},
  {name:'Africa',code:'AF',count:null,lat:5,lon:20}
];
D.registryConcentration={
  donuts2012:307,
  identityPortfolio:'~300',
  identityManaged:'460+',
  hq:'Bellevue, WA',
  verisignComNetRegistrations:'179.1M',
  verisignComRegistrations:'166.6M',
  verisignNetRegistrations:'12.5M',
  verisignRootIdentities:2,
  sources:{
    donuts:'https://newgtlds.icann.org/en/announcements-and-media/video/applicants',
    largest:'https://newgtlds.icann.org/sites/default/files/drsp/25sep13/determination-1-1-1462-36448-en.pdf',
    witness:'https://33-7.lax.icann.org/en/system/files/files/donuts-witness-statements-13oct14-en.pdf',
    rightside:'https://www.ftc.gov/legal-library/browse/early-termination-notices/20171464',
    afilias:'https://www.identity.digital/newsroom/donuts-inc-and-afilias-inc-rebrand-to-identity-digital',
    rebrand:'https://www.identity.digital/newsroom/donuts-inc-and-afilias-inc-rebrand-to-identity-digital',
    portfolio:'https://www.identity.digital/registrar',
    managed:'https://identity.digital/newsroom/what-makes-a-great-registry-services-provider',
    company:'https://www.icann.org/ru/ssac/members/archive/25-01-2026',
    hq:'https://identity.digital/contact',
    verisignScale:'https://investor.verisign.com/news-releases/news-release-details/dnibcom-reports-internet-has-4016-million-domain-name',
    verisignRoot:'https://www.iana.org/domains/root/servers',
    rootMaintainer:'https://www.iana.org/dnssec/procedures/ksk-operator/ksk-dps-20201104.html'
  }
};
D.sources.push(
  ['ICANN 2026 Applicant Questions · public fields','https://newgtldprogram-2026-agb.icann.org/en/12-appendix-1-application-questions.html','primary'],
  ['IANA · root zone roles','https://www.iana.org/dnssec/procedures/ksk-operator/ksk-dps-20201104.html','primary'],
  ['ICANN · Identity Digital described as largest TLD registry operator','https://www.icann.org/ru/ssac/members/archive/25-01-2026','primary'],
  ['ICANN 2026 Reveal Day and milestones','https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en','primary'],
  ['ICANN 2012 applications overview','https://newgtlds.icann.org/en/program-status/statistics/applications-overview-13jun12-en.pdf','primary'],
  ['ICANN 2026 RSP statistics · August','https://newgtldprogram.icann.org/en/application-rounds/round2/rsp/program-statistics/2026/08','primary'],
  ['ICANN · Donuts applicant video','https://newgtlds.icann.org/en/announcements-and-media/video/applicants','primary'],
  ['ICANN dispute determination · Donuts scale/economies','https://newgtlds.icann.org/sites/default/files/drsp/25sep13/determination-1-1-1462-36448-en.pdf','primary'],
  ['FTC · Donuts / Rightside transaction','https://www.ftc.gov/legal-library/browse/early-termination-notices/20171464','primary'],
  ['Afilias · Donuts acquisition','https://afilias.mediaroom.com/2020-12-29-Donuts-Acquires-Afilias','operator'],
  ['Identity Digital · portfolio','https://identity.digital/tld-portfolio','operator'],
  ['Identity Digital · registry services scale','https://identity.digital/newsroom/what-makes-a-great-registry-services-provider','operator'],
  ['Identity Digital · company history','https://identity.digital/company','operator'],
  ['Identity Digital · headquarters','https://identity.digital/contact','operator'],
  ['Verisign · Q2 2026 .com/.net registrations','https://investor.verisign.com/news-releases/news-release-details/dnibcom-reports-internet-has-4016-million-domain-name','operator'],
  ['IANA · root servers / Verisign A-root and J-root','https://www.iana.org/domains/root/servers','primary']
);
})();
