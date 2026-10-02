/* v0.6.10: semantic drift section */
(function(){
const O={
 en:{
  driftTitle:'When the dot changes meaning',
  driftSub:'Some country-code TLDs kept their formal geographic designation while acquiring a second, global cultural meaning.',
  driftFormalLabel:'Formal meaning',driftAdoptedLabel:'Acquired meaning',driftMedia:'Media',media:'Media',semanticDrift:'Semantic drift',
  driftIoFormal:'ccTLD · British Indian Ocean Territory',driftIoAdopted:'input/output · tech & startups',driftIoReading:'The registry itself now markets .io as “the domain for tech websites”, explicitly acknowledging the input/output reinterpretation and its place in startup culture.',
  driftAiFormal:'ccTLD · Anguilla',driftAiAdopted:'artificial intelligence',driftAiReading:'A geographic code became almost perfectly aligned with a later technology acronym; the registry now presents .AI as the “Domain of Artificial Intelligence”.',
  driftTvFormal:'ccTLD · Tuvalu',driftTvAdopted:'television · video · creators',driftTvReading:'The registry markets .TV around video and creator culture: the geographic code now communicates a media format to users worldwide.',
  driftMeFormal:'ccTLD · Montenegro',driftMeAdopted:'personal identity · personal branding',driftMeReading:'A country code became a pronoun and a personal-branding device. The registry explicitly describes .ME as globally personal rather than merely geographic.',
  driftCoFormal:'ccTLD · Colombia',driftCoAdopted:'company · business',driftCoReading:'The shift was unusually explicit: IANA records early plans to commercialise .CO globally as a de-facto generic domain associated with “company”.',
  driftFmFormal:'ccTLD · Federated States of Micronesia',driftFmAdopted:'radio · streaming · audio',driftFmReading:'The registry has deliberately positioned .FM as an industry-specific namespace for broadcasting, streaming, podcasting and social media.',
  driftReadingTitle:'A namespace can be governed, but meaning also emerges from use.',
  driftReadingBody:'A TLD has a formal status, but not necessarily a fixed cultural meaning. Registries define rules and eligibility; language, technology and communities can rewrite what people read after the dot. The same principle matters for .lugano: governance can define the perimeter, while actual use will shape what the namespace comes to mean.',
  downloadDrift:'Semantic drift of ccTLDs',downloadDriftSub:'CSV · formal origin, acquired association and sources'
 },
 it:{
  driftTitle:'Quando il punto cambia significato',
  driftSub:'Alcuni ccTLD hanno mantenuto la loro designazione geografica formale, ma hanno acquisito un secondo significato globale e culturale.',
  driftFormalLabel:'Significato formale',driftAdoptedLabel:'Significato acquisito',driftMedia:'Media',media:'Media',semanticDrift:'Deriva semantica',
  driftIoFormal:'ccTLD · Territorio britannico dell’Oceano Indiano',driftIoAdopted:'input/output · tecnologia & startup',driftIoReading:'Lo stesso registro presenta oggi .io come “il dominio per i siti tech”, riconoscendo esplicitamente la rilettura input/output e il suo ruolo nella cultura startup.',
  driftAiFormal:'ccTLD · Anguilla',driftAiAdopted:'intelligenza artificiale',driftAiReading:'Un codice geografico si è trovato quasi perfettamente allineato a un acronimo tecnologico successivo; il registro presenta oggi .AI come “Domain of Artificial Intelligence”.',
  driftTvFormal:'ccTLD · Tuvalu',driftTvAdopted:'televisione · video · creator',driftTvReading:'Il registro commercializza .TV attorno a video e creator economy: il codice geografico comunica ormai a molti utenti un formato mediatico.',
  driftMeFormal:'ccTLD · Montenegro',driftMeAdopted:'identità personale · personal branding',driftMeReading:'Un codice paese è diventato un pronome e uno strumento di personal branding. Il registro descrive esplicitamente .ME come dominio globale e personale, non soltanto geografico.',
  driftCoFormal:'ccTLD · Colombia',driftCoAdopted:'company · impresa',driftCoReading:'Qui il cambio fu insolitamente esplicito: IANA documenta i primi piani per commercializzare .CO globalmente come dominio de-facto generico associato a “company”.',
  driftFmFormal:'ccTLD · Stati Federati di Micronesia',driftFmAdopted:'radio · streaming · audio',driftFmReading:'Il registro ha posizionato deliberatamente .FM come namespace di settore per broadcasting, streaming, podcast e social media.',
  driftReadingTitle:'Un namespace si può governare, ma il significato emerge anche dall’uso.',
  driftReadingBody:'Un TLD ha uno status formale, ma non necessariamente un significato culturale immutabile. Il registro definisce regole e accesso; lingua, tecnologia e comunità possono riscrivere ciò che le persone leggono dopo il punto. Lo stesso principio vale per .lugano: la governance può definire il perimetro, mentre saranno gli usi reali a determinarne il significato nel tempo.',
  downloadDrift:'Deriva semantica dei ccTLD',downloadDriftSub:'CSV · origine formale, significato acquisito e fonti'
 },
 de:{
  driftTitle:'Wenn der Punkt seine Bedeutung ändert',
  driftSub:'Einige Länder-TLDs behielten ihre formale geografische Zuordnung und erhielten zugleich eine zweite, globale kulturelle Bedeutung.',
  driftFormalLabel:'Formale Bedeutung',driftAdoptedLabel:'Erworbene Bedeutung',driftMedia:'Medien',media:'Medien',semanticDrift:'Semantischer Wandel',
  driftIoFormal:'ccTLD · Britisches Territorium im Indischen Ozean',driftIoAdopted:'Input/Output · Tech & Startups',driftIoReading:'Die Registry vermarktet .io heute selbst als „Domain für Tech-Websites“ und verweist ausdrücklich auf die Input/Output-Lesart und die Startup-Kultur.',
  driftAiFormal:'ccTLD · Anguilla',driftAiAdopted:'Künstliche Intelligenz',driftAiReading:'Ein geografischer Code fiel nahezu perfekt mit einem späteren Technologie-Akronym zusammen; die Registry präsentiert .AI heute als „Domain of Artificial Intelligence“.',
  driftTvFormal:'ccTLD · Tuvalu',driftTvAdopted:'Fernsehen · Video · Creator',driftTvReading:'Die Registry positioniert .TV rund um Video und Creator-Kultur: Der geografische Code signalisiert weltweit ein Medienformat.',
  driftMeFormal:'ccTLD · Montenegro',driftMeAdopted:'persönliche Identität · Personal Branding',driftMeReading:'Ein Ländercode wurde zu einem Pronomen und Werkzeug für Personal Branding. Die Registry beschreibt .ME ausdrücklich als global und persönlich, nicht nur geografisch.',
  driftCoFormal:'ccTLD · Kolumbien',driftCoAdopted:'Company · Unternehmen',driftCoReading:'Hier war der Bedeutungswandel ungewöhnlich explizit: IANA dokumentiert frühe Pläne, .CO weltweit als de-facto generische Domain im Sinn von „company“ zu vermarkten.',
  driftFmFormal:'ccTLD · Föderierte Staaten von Mikronesien',driftFmAdopted:'Radio · Streaming · Audio',driftFmReading:'Die Registry positioniert .FM bewusst als branchenspezifischen Namensraum für Broadcasting, Streaming, Podcasts und Social Media.',
  driftReadingTitle:'Ein Namespace lässt sich regeln, doch Bedeutung entsteht auch durch Nutzung.',
  driftReadingBody:'Eine TLD hat einen formalen Status, aber nicht zwingend eine unveränderliche kulturelle Bedeutung. Registries definieren Regeln und Zugang; Sprache, Technologie und Gemeinschaften können neu prägen, was Menschen nach dem Punkt lesen. Dasselbe gilt für .lugano: Governance kann den Rahmen setzen, die tatsächliche Nutzung wird seine Bedeutung mitformen.',
  downloadDrift:'Semantischer Wandel von ccTLDs',downloadDriftSub:'CSV · formaler Ursprung, erworbene Bedeutung und Quellen'
 },
 fr:{
  driftTitle:'Quand le point change de sens',
  driftSub:'Certains ccTLD ont conservé leur désignation géographique formelle tout en acquérant une seconde signification, globale et culturelle.',
  driftFormalLabel:'Sens formel',driftAdoptedLabel:'Sens acquis',driftMedia:'Médias',media:'Médias',semanticDrift:'Glissement sémantique',
  driftIoFormal:'ccTLD · Territoire britannique de l’océan Indien',driftIoAdopted:'input/output · tech & startups',driftIoReading:'Le registre présente aujourd’hui .io comme « le domaine des sites tech », en reconnaissant explicitement la lecture input/output et son rôle dans la culture startup.',
  driftAiFormal:'ccTLD · Anguilla',driftAiAdopted:'intelligence artificielle',driftAiReading:'Un code géographique s’est trouvé presque parfaitement aligné sur un acronyme technologique apparu ensuite ; le registre présente désormais .AI comme le « Domain of Artificial Intelligence ».',
  driftTvFormal:'ccTLD · Tuvalu',driftTvAdopted:'télévision · vidéo · créateurs',driftTvReading:'Le registre positionne .TV autour de la vidéo et des créateurs : le code géographique signale désormais un format médiatique à l’échelle mondiale.',
  driftMeFormal:'ccTLD · Monténégro',driftMeAdopted:'identité personnelle · personal branding',driftMeReading:'Un code pays est devenu un pronom et un outil de marque personnelle. Le registre décrit explicitement .ME comme global et personnel, au-delà de sa géographie.',
  driftCoFormal:'ccTLD · Colombie',driftCoAdopted:'company · entreprise',driftCoReading:'Le changement a été inhabituellement explicite : l’IANA documente les premiers projets visant à commercialiser .CO mondialement comme domaine de facto générique associé à « company ».',
  driftFmFormal:'ccTLD · États fédérés de Micronésie',driftFmAdopted:'radio · streaming · audio',driftFmReading:'Le registre a volontairement positionné .FM comme namespace sectoriel pour la diffusion, le streaming, les podcasts et les médias sociaux.',
  driftReadingTitle:'Un namespace peut être gouverné, mais son sens émerge aussi des usages.',
  driftReadingBody:'Un TLD possède un statut formel, mais pas nécessairement un sens culturel immuable. Les registres définissent règles et accès ; la langue, la technologie et les communautés peuvent réécrire ce que les utilisateurs lisent après le point. Le même principe vaut pour .lugano : la gouvernance peut définir le cadre, tandis que les usages réels façonneront progressivement sa signification.',
  downloadDrift:'Glissement sémantique des ccTLD',downloadDriftSub:'CSV · origine formelle, sens acquis et sources'
 }
};
for(const [l,o] of Object.entries(O)){Object.assign(window.DOT_I18N[l],o)}
})();
