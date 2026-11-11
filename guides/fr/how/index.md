<!-- Canonical: https://robertbregy.github.io/Connecting-the-Dots/guides/fr/how/ | Site edition: 0.7.110 | Language: fr -->

Guide

# Comment fonctionne un nom Internet ?

D’abord l’adresse et les acteurs, puis le cycle de vie, l’économie et les règles. Le glossaire reste à portée de main.

[Explorer dans l’atlas](https://robertbregy.github.io/Connecting-the-Dots/fr/?tab=how#how) [Méthode et citation](https://robertbregy.github.io/Connecting-the-Dots/research/) [Version texte](https://robertbregy.github.io/Connecting-the-Dots/guides/fr/how/index.md)

FAIT

## Comment fonctionnent vraiment les domaines Internet

Les notions essentielles pour s’orienter entre domaines, DNS et gouvernance d’Internet.

www.example .com

Dans **www.example.com**, **.com** est le domaine de premier niveau (TLD). « example » est l’étiquette de deuxième niveau ; le nom enregistré sous .com est **example.com**. « www » est une étiquette supplémentaire qui désigne un sous-domaine.

.

**Racine**

Le niveau supérieur, normalement invisible, de la hiérarchie DNS.

.com

**Domaine de premier niveau**

La partie finale : .ch, .com, .org.

example

**Étiquette de deuxième niveau**

Ici, « example » est l’étiquette immédiatement à gauche de .com. Ensemble, elles forment le nom de domaine example.com.

www

**Libellé optionnel**

Un libellé optionnel ajouté devant le nom enregistré. Dans www.example.com, « www » peut identifier un site ou un service précis ; il ne fait pas partie du TLD.

FAIT

## Qui fait quoi ?

Internet n’a pas un propriétaire unique. Il fonctionne grâce à des rôles distincts, des contrats et une coordination technique.

POLICY

### ICANN

Coordonne les politiques et contrats des domaines génériques de premier niveau selon un modèle multistakeholder mondial.

ROOT

### IANA / PTI

Agit comme Root Zone Manager : PTI reçoit et valide les demandes de modification des TLD et gère les données autoritatives de délégation de la racine DNS.

MAINTAIN

### Root Zone Maintainer

Verisign met en œuvre les modifications validées dans la zone racine en tant que Root Zone Maintainer opérationnel sous contrat avec ICANN.

GOUVERNANCE

### Opérateur de registre

Exploite un TLD et sa base de registre autoritative. Les opérateurs gTLD travaillent sous accords de registre ICANN ; les ccTLD ont d’autres dispositifs de gouvernance.

TECH

### Fournisseur de services de registre (RSP)

Fournit les services techniques critiques du registre, notamment le DNS et l’infrastructure d’enregistrement.

ENREGISTREMENT

### Bureau d’enregistrement

Pour les gTLD, un registrar accrédité par ICANN fournit le canal direct d’enregistrement aux titulaires. Les ccTLD utilisent leurs propres modèles de registre et de registrar.

UTILISATEUR

### Titulaire (registrant)

Personne ou organisation qui enregistre et utilise un nom sous le TLD.

[IANA · Root Zone Manager / Maintainer ↗](https://www.iana.org/dnssec/procedures/ksk-operator/ksk-dps-20201104.html) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

FAIT

## Qu’obtient-on vraiment en enregistrant un domaine ?

L’enregistrement n’est pas l’achat d’un morceau d’Internet. Le titulaire entre dans une relation contractuelle et le nom reste soumis au renouvellement, aux politiques du registre et au cycle de vie applicable.

01 **Disponible**

Le nom n’est pas enregistré et peut être éligible selon la politique du registre.

02 **Enregistré**

Le titulaire conclut un accord via un registrar et le registry inscrit le nom.

 ↺ Boucle de renouvellement

03 **Expiré**

Si la période d’enregistrement prend fin, les règles post-expiration s’appliquent. Un renouvellement ou une restauration peut encore être possible selon les règles et le calendrier.

Si le registrar supprime un enregistrement gTLD applicable

04 **Redemption period**

Si un enregistrement gTLD applicable est supprimé par le registrar, il entre dans une redemptionPeriod de 30 jours pendant laquelle une restauration peut être possible.

05 **PendingDelete**

S’il n’est pas restauré pendant la redemptionPeriod, le nom entre en pendingDelete pendant cinq jours et ne peut plus être restauré.

06 **À nouveau disponible**

Après purge de la base du registre, le nom peut redevenir disponible selon la politique du registre.

Il s’agit d’une carte simplifiée orientée gTLD, pas d’un cycle universel. Expiration ne signifie pas automatiquement suppression. Les politiques des registres, registrars et ccTLD peuvent différer.

[ICANN · renewal & expiration ↗](https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en/) [ICANN · EPP status codes ↗](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en)

LECTURE

## Qu’est-ce qu’un point, au fond ?

Un domaine est un identifiant technique aux dimensions juridiques, économiques, institutionnelles et culturelles. Huit perspectives expliquent ce qui peut s’organiser autour d’un nom.

01

### Adresse

Un identifiant lisible qui aide utilisateurs et logiciels à trouver des ressources Internet.

02

### Contrat

Une inscription existe par des relations contractuelles entre titulaire, registrar et registry.

03

### Marché

Les noms peuvent avoir des prix de détail, premium, de renouvellement et une valeur secondaire.

04

### Cadre juridique

Éligibilité, politiques et obligations varient selon le namespace et son opérateur.

05

### Identité

Un domaine peut accumuler de la réputation et devenir un identifiant durable pour une personne, un lieu ou une institution.

06

### Frontière de confiance

Vérification, DNSSEC et règles de registre peuvent ajouter des signaux de confiance autour d’un nom.

07

### Signe culturel

Langue et communautés peuvent donner à un TLD des significations que sa désignation d’origine n’avait jamais prévues.

08

### Objet politique

Codes pays, noms géographiques et conflits d’attribution peuvent refléter institutions, frontières et autorité publique.

**Le point est technique. Ce que la société construit autour ne l’est pas.**
 Pour lire un TLD, il est utile de demander quelle couche agit : adressage, attribution, gouvernance, confiance, valeur de marché, identité ou sens culturel.

FAIT LECTURE

### Un mot, deux systèmes de noms : .bit

Le relevé secondaire figé de 2026 compte 11 candidatures ICANN pour .bit. Namecoin utilise déjà .bit dans un autre système de noms fondé sur une blockchain. Ce suffixe n'est pas une extension déléguée dans la racine DNS mondiale de l'ICANN, et les résolveurs DNS ordinaires ne consultent pas automatiquement Namecoin. C'est un risque potentiel de collision entre espaces de nommage, pas une preuve que Namecoin figure parmi les onze candidats.

[Namecoin · .bit namespace ↗](https://www.namecoin.org/dot-bit/) [nTLDData · 2026 Reveal Day ↗](https://www.ntlddata.com/applications/strings)

### Explications complémentaires

Il s'agit d'explications générales, et non de nouveaux cas du round 2026. Elles précisent ce qui se passe au-delà des TLD et les limites du rôle de l'ICANN.

**Un domaine valide peut-il rester inaccessible ?** Filtrage DNS, suspension de domaines, coupure réseau et rôle de l'ICANN expliqués dans une simulation interactive.

[Filtrage d'Internet, DNS et coupures réseau ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/fr/who-controls-internet-access/) [Sanctions internationales et ICANN ↗](https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/fr/sanctions-and-dns/)

Principes généraux Comment fonctionnent le DNS, les rôles liés aux TLD et le processus des nouveaux gTLD, indépendamment de .lugano.

LECTURE

## L’économie du point

Un même domaine peut relever de plusieurs marchés à la fois : enregistrement, renouvellement, tarification premium, services de registry et marché secondaire.

**Titulaire** Choisit le nom et paie le prix de détail de l’enregistrement ou du renouvellement.

 →

**Registrar** Fournit le canal de détail et transmet les opérations d’enregistrement au registry.

 →

**Registry** Gère la base du TLD et définit le modèle commercial et de politique côté registre dans le cadre applicable.

 ↗

**Couche ICANN** Pour les gTLD, des relations contractuelles et financières existent aussi au-dessus de l’écosystème registry–registrar.

**Marché secondaire** Les enregistrements existants peuvent acquérir une valeur de revente indépendante du prix wholesale du registry.

Le prix d’un domaine n’est pas une seule chose. Wholesale, retail, premium et aftermarket appartiennent à des couches différentes.

FAIT

## Comment naît un nouveau TLD

En 2026, ce n’est pas “demander et recevoir”, mais un processus public en plusieurs étapes.

01

**Candidature**

Le candidat dépose le dossier et paie les frais requis.

02

**Reveal**

ICANN publie les données publiques et identifie les concurrences sur des chaînes identiques.

03

**Contributions & objections**

Contributions de la communauté, objections formelles et avis gouvernementaux pertinents peuvent intervenir.

04

**Évaluations**

La chaîne, le candidat ainsi que les aspects opérationnels, financiers et techniques sont évalués.

05

**Concurrence**

Si plusieurs candidats demandent la même chaîne ou des chaînes confusément similaires, la concurrence doit être résolue.

06

**Contrat**

Le candidat retenu signe le Base Registry Agreement avec ICANN.

07

**Délégation**

Après onboarding et contrôles techniques, IANA/PTI traite la demande de délégation et le Root Zone Maintainer met en œuvre la modification validée dans la racine DNS.

08

**Lancement**

Ce n’est qu’ensuite que le registre peut utiliser et attribuer des noms sous le TLD.

[Explication officielle · ICANN Applicant Journey ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey)

FAIT LECTURE

## Deux questions différentes : quel type de candidature, et qui peut enregistrer ?

Les types de candidature ICANN et l’accès opérationnel à l’enregistrement sont deux axes distincts. Un namespace peut être géographique, communautaire ou de marque avec des règles d’accès très différentes.

### Types / désignations de candidature 2026

#### General

Une candidature qui ne relève pas d’un type spécialisé.

#### Geographic Name

Une candidature spécialisée pour une chaîne répondant aux critères géographiques 2026 et aux exigences applicables de soutien ou de non-opposition.

#### Reserved Name

Une candidature spécialisée portant sur un nom réservé selon les règles de l’Applicant Guidebook 2026.

#### Community

Une candidature spécialisée liée à une communauté clairement définie et aux engagements supplémentaires requis par cette désignation.

#### .Brand

Une candidature spécialisée pour une chaîne éligible liée à une marque enregistrée et à un opérateur de marque qualifié.

#### IDN

Une candidature pour une chaîne TLD représentée dans une écriture prise en charge par le cadre des noms de domaine internationalisés.

#### Variant string

Une candidature impliquant des chaînes variantes évaluées avec la chaîne principale demandée.

#### Gouvernement / IGO

Une candidature soumise par un gouvernement ou une organisation intergouvernementale et traitée comme spécialisée.

#### Applicant Support

Une candidature d’un candidat admissible au programme Applicant Support est traitée comme spécialisée.

### Modèle opérationnel d’accès

.com

#### Enregistrement ouvert

Un namespace largement ouvert aux titulaires éligibles selon les règles habituelles du registre.

.bank

#### Restreint / vérifié

Un namespace où l’éligibilité est vérifiée ; .BANK en est un exemple pour des organisations bancaires réglementées.

Ces libellés décrivent les désignations ICANN du round 2026. Les TLD historiques ne sont pas présentés ici comme des exemples 2026. « Ouvert » ou « restreint » décrit plutôt l’accès pratique à l’enregistrement après délégation.

[ICANN · application types ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-types/faqs/general/what-types-of-gtld-applications-can-be-submitted-in-the-new-gtld-program) [.BANK · eligibility ↗](https://register.bank/eligibility/)

FAIT

## Des mots précis, des concepts clairs

Les notions essentielles pour s’orienter entre domaines, DNS et gouvernance d’Internet.

FAIT

 Plus précis

Un domaine de premier niveau est la partie finale d’une adresse Internet, comme .ch ou .com.

À ne pas confondre avec

Un TLD est simplement une nouvelle adresse de site web.

FAIT

 Plus précis

ICANN coordonne le système mondial des noms de domaine et le processus des nouveaux gTLD.

À ne pas confondre avec

ICANN est le gouvernement ou le propriétaire d’Internet.

FAIT

## Glossaire essentiel

Les termes qui facilitent la lecture de l’Explorer. Le vocabulaire officiel ICANN/IANA reste distinct des champs méthodologiques de Connecting the Dots.

Terme ICANN / IANA Méthodologie du projet

**ICANN Terme ICANN / IANA**

Internet Corporation for Assigned Names and Numbers. Organisation à but non lucratif d’intérêt public qui coordonne les systèmes d’identifiants uniques de l’Internet et soutient l’élaboration des politiques correspondantes, notamment pour le DNS.

[Source ↗](https://www.icann.org/resources/pages/about-icann)

**IANA / Internet Assigned Numbers Authority Terme ICANN / IANA**

Fonctions qui tiennent les registres faisant autorité pour les identifiants techniques mondialement uniques de l’Internet, notamment les noms de domaine, les numéros et les paramètres de protocole. Les fonctions IANA sont assurées par PTI, entité affiliée à l’ICANN.

[Source ↗](https://www.iana.org/about)

**DNS / Domain Name System Terme ICANN / IANA**

Le système de nommage hiérarchique et distribué de l’Internet. Il permet d’interroger des noms lisibles comme example.com et d’obtenir les informations nécessaires pour atteindre les services associés, par exemple des adresses IP.

[Source ↗](https://www.icann.org/en/beginners)

**TLD / Top-Level Domain Terme ICANN / IANA**

Un domaine situé immédiatement sous la racine DNS, comme .ch ou .com. La chaîne .lugano fait quant à elle l’objet d’une candidature au round 2026 et n’est pas encore déléguée.

[Source ↗](https://www.iana.org/domains/root)

**DNS root / Root zone Terme ICANN / IANA**

Le niveau le plus élevé de la hiérarchie DNS. La zone racine contient les délégations des TLD reconnus par le DNS mondial.

[Source ↗](https://www.iana.org/domains/root)

**gTLD / Generic Top-Level Domain Terme ICANN / IANA**

La catégorie des domaines génériques de premier niveau, comme .com, distincte des ccTLD et du domaine d’infrastructure .arpa. Elle comprend des extensions historiques et les nouveaux gTLD issus des programmes ICANN.

[Source ↗](https://www.iana.org/domains/root/db)

**ccTLD / Country-Code Top-Level Domain Terme ICANN / IANA**

Un TLD associé à un pays ou territoire, généralement sur la base d’un code ISO 3166-1 à deux lettres ou d’une chaîne IDN approuvée.

[Source ↗](https://www.iana.org/help/eligible-tlds)

**IDN / Internationalized Domain Name Terme ICANN / IANA**

Un nom de domaine utilisant des caractères au-delà du jeu ASCII de base, par exemple des caractères d’écritures non latines.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**A-label / Punycode Terme ICANN / IANA**

A-label : représentation ASCII d’une étiquette IDN valide selon IDNA, toujours précédée de xn--. Punycode est l’algorithme qui encode la partie suivant ce préfixe.

[Source ↗](https://datatracker.ietf.org/doc/html/rfc5890#section-2.3.2.1)

**Name server / Server DNS Terme ICANN / IANA**

Serveur DNS qui répond aux requêtes concernant un nom de domaine. Un serveur de noms faisant autorité héberge les enregistrements officiels de la zone DNS dont il est responsable.

[Source ↗](https://www.icann.org/en/icann-acronyms-and-terms/name-server-en)

**RDAP / Registration Data Access Protocol Terme ICANN / IANA**

Protocole fondé sur HTTP permettant d’accéder aux données actuelles d’enregistrement des noms de domaine et des adresses IP. Il a été conçu pour remplacer WHOIS, avec des formats normalisés, HTTPS et la prise en charge de l’internationalisation.

[Source ↗](https://www.icann.org/rdap/)

**WHOIS Terme ICANN / IANA**

Protocole et ensemble de services historiquement utilisés pour interroger les données d’enregistrement des noms de domaine. RDAP a été conçu pour remplacer ce protocole par un accès plus moderne et normalisé.

[Source ↗](https://www.icann.org/resources/pages/whois-rdds-2023-11-02-en)

**Applicant Terme ICANN / IANA**

L’entité qui dépose auprès de l’ICANN une candidature pour un nouveau gTLD.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application Terme ICANN / IANA**

La candidature formelle à un nouveau gTLD. Une candidature n’équivaut pas à la délégation de la chaîne dans la racine DNS.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Application round Terme ICANN / IANA**

L’ensemble des étapes par lesquelles l’ICANN traite les candidatures reçues pendant une période de dépôt donnée.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Delegation Terme ICANN / IANA**

L’insertion technique d’un TLD dans la racine DNS. Ce n’est qu’après délégation que la chaîne devient active dans le système mondial de noms.

[Source ↗](https://www.iana.org/help/gtld-delegation)

**Registry operator Terme ICANN / IANA**

L’entité qui exploite le TLD et sa base de registre faisant autorité. Pour les gTLD, elle agit dans le cadre d’un Registry Agreement avec l’ICANN.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Registry Service Provider (RSP) Terme ICANN / IANA**

Le fournisseur des services techniques critiques nécessaires au fonctionnement du registre, distinct de l’entité assumant la responsabilité de registry operator.

[Source ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/application-evaluation/faqs/general/what-are-the-components-of-application-evaluation)

**Registrar Terme ICANN / IANA**

Pour les gTLD, un intermédiaire accrédité par l’ICANN qui permet aux utilisateurs d’enregistrer des noms de domaine. Les ccTLD peuvent utiliser d’autres modèles.

[Source ↗](https://www.icann.org/en/contracted-parties/accredited-registrars)

**Registrant Terme ICANN / IANA**

La personne ou l’organisation qui enregistre un nom de domaine.

[Source ↗](https://www.icann.org/registrants)

**Registry Agreement Terme ICANN / IANA**

L’accord contractuel entre l’ICANN et le registry operator d’un gTLD.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Contention set Terme ICANN / IANA**

Un groupe de candidatures portant sur des chaînes identiques ou suffisamment similaires, qui ne peuvent pas toutes avancer avant résolution de la concurrence entre elles.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**String contention Terme ICANN / IANA**

La situation dans laquelle plusieurs candidatures qualifiées sont en concurrence pour la même chaîne ou pour des chaînes jugées susceptibles de confusion.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**GAC Advice Terme ICANN / IANA**

Un avis du Governmental Advisory Committee au Conseil d’administration de l’ICANN concernant une ou plusieurs candidatures ou des questions de politique publique.

[Source ↗](https://newgtlds.icann.org/en/applicants/glossary)

**Name collision Terme ICANN / IANA**

Une situation dans laquelle un nom destiné à être résolu dans un système de nommage est résolu dans un autre, avec un risque de comportement inattendu ou de problème opérationnel.

[Source ↗](https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey/prepare-to-apply)

**Application outcome Méthodologie du projet**

Un champ méthodologique de Connecting the Dots décrivant l’issue documentée d’une candidature séparément de la contention et des controverses. Un champ vide signifie que l’issue n’est pas établie dans le corpus local.

**Outcome reason Méthodologie du projet**

Un champ méthodologique qui enregistre, uniquement lorsqu’une source le documente, la raison d’une issue, par exemple retrait, non-sélection, politique publique ou risque technique.

**Governance controversy Méthodologie du projet**

Une catégorie éditoriale de Connecting the Dots pour les conflits substantiels portant sur les droits, la légitimité, l’intérêt public, le contrôle ou les conditions d’usage d’une chaîne. Elle ne se confond pas avec la contention.

[Télécharger le glossaire en CSV ↓](https://robertbregy.github.io/Connecting-the-Dots/data/domain_governance_glossary.csv)

FAIT LECTURE

## Qui peut réellement actionner quel levier ?

Site web, enregistrement du domaine, résolution DNS et accès navigateur sont des couches distinctes. Des acteurs différents peuvent intervenir à des points différents ; aucune organisation ne « contrôle Internet » à elle seule.

01

### Hébergeur

Peut retirer ou désactiver le contenu ou l’infrastructure qu’il héberge.

02

### Fournisseur DNS

Peut cesser de servir le DNS autoritatif ou modifier la zone qu’il exploite.

03

### Registrar

Gère la relation avec le titulaire et transmet au registry les modifications d’enregistrement.

04

### Opérateur de registry

Maintient le registre du TLD et traite ajouts, modifications ou suppressions selon les règles applicables.

05

### Navigateur / couche sécurité

Peut avertir, bloquer ou ne pas faire confiance à une destination sans modifier l’enregistrement.

06

### ICANN

Coordonne politiques et contrats gTLD, mais n’est ni un régulateur général des contenus ni une « police d’Internet ».

**Même site, leviers différents.**
 Retirer un contenu, suspendre un enregistrement, modifier le DNS et bloquer l’accès sont des actions différentes. La gouvernance commence par identifier la couche.

ICANN indique qu’elle ne contrôle pas les contenus Internet et n’est pas une autorité générale de retrait des sites.

[ICANN · registry operator ↗](https://www.icann.org/en/icann-acronyms-and-terms/registry-operator-en) [ICANN · accredited registrars ↗](https://www.icann.org/en/contracted-parties/accredited-registrars) [ICANN · website content ↗](https://www.icann.org/resources/pages/spam-phishing-2017-06-20-en)

.lugano · cas appliqué Ce que ces principes généraux signifient pour la candidature de Lugano au round 2026.

FAIT

## De la règle générale au cas .lugano

La candidature .lugano suit le même parcours décrit ci-dessus. Tant que l’évaluation, le contrat et la délégation ne sont pas achevés, .lugano reste une candidature et n’est pas un TLD actif.

VISION

Exemple hypothétique

www.servizi .lugano

Si .lugano est délégué, la même structure DNS pourra produire des adresses telles que servizi.lugano ou www.servizi.lugano. L’exemple illustre la hiérarchie ; il ne désigne pas un service déjà actif.

## Dans le cas de .lugano : ce que le registre pourrait gouverner et ce que cela ne signifierait pas

VISION

### Ce que le registre pourrait gouverner

- Critères d’éligibilité et d’attribution des noms sous .lugano, dans le respect des règles ICANN et du droit applicable.

- Noms réservés, phases de lancement et choix de gouvernance locale.

- Exigences d’enregistrement, techniques et de sécurité pour les noms sous .lugano.

FAIT

### Ce que cela ne signifierait pas

- Lugano ne “possède pas Internet” et ne contrôle ni .ch, ni .com, ni les autres TLD.

- Une candidature n’est pas une attribution : .lugano ne devient actif qu’après le processus, le contrat et la délégation.

- ICANN n’exploite pas les sites de la Ville ; elle coordonne le système mondial des noms et le cadre contractuel des gTLD.

## Parler de .lugano avec précision

Deux distinctions importantes tant que la candidature est encore en cours.

FAIT

 Plus précis

La Ville de Lugano a déposé une candidature pour le nouveau domaine de premier niveau .lugano.

À ne pas confondre avec

Lugano a obtenu / possède le domaine .lugano.

VISION

 Plus précis

En cas de succès, .lugano pourrait devenir un namespace gouverné selon des règles définies par son registry operator dans le cadre ICANN.

À ne pas confondre avec

N’importe qui pourra automatiquement enregistrer n’importe quel nom .lugano.

**Par Robert Bregy** · Édition du site 0.7.110 · 12 novembre 2026

Les dates d’observation figurent à côté des preuves. Cette édition du site ne signifie pas que toutes les sources ont été vérifiées à nouveau à cette date.
