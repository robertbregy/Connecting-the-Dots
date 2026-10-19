"""Localized, static explanation of rule sensitivity; no causal trend claims."""
from html import escape as h

COPY={
 'it':{
  'title':'Quanto cambia il racconto se cambiano le regole?',
  'lead':'Un nome riconosciuto in più non è una nuova osservazione sulla società. Confrontiamo tre letture dello stesso insieme di nomi: il metodo precedente, il solo vocabolario esplicito e la loro unione attuale. Il primo conserva anche letture contestuali ereditate; il secondo assegna temi soltanto alle parole elencate nel nuovo vocabolario.',
  'methods':['Metodo precedente','Solo vocabolario esplicito','Metodo attuale: unione'],
  'coverage':'Nomi con almeno un tema: numero e quota sul totale del round',
  'rule':'Lettura applicata','conclusion':'Un segnale da verificare, non una conclusione definitiva',
  'example':'Per commercio e finanza, il metodo precedente suggerisce un aumento dal 2012 al 2026; il solo vocabolario esplicito suggerisce una diminuzione. La direzione cambia con le regole. Il confronto aiuta a formulare domande, ma non dimostra un cambiamento della società.',
  'biasTitle':'La copertura resta diseguale fra le scritture',
  'bias':'IDN indica un nome rappresentato con un A-label xn--: può usare anche lettere latine accentate. Non identifica da solo una lingua o una comunità. Le traduzioni del nuovo vocabolario sono proposte editoriali da verificare con revisori competenti.',
  'strata':['IDN','ASCII senza IDN'],'details':'Conteggi per categoria e dipendenza dal vocabolario',
  'theme':'Tema','previous':'Precedente','lexical':'Solo vocabolario','current':'Attuale',
  'limit':'Il vocabolario è stato ampliato dopo aver letto i nomi mancanti. Il suo maggiore riconoscimento è atteso e non misura l’accuratezza. Occorre una verifica indipendente; le categorie si sovrappongono e le quote non si sommano.',
  'downloads':['Vocabolario e ambiguità','Confronti riproducibili','Protocollo di revisione','Scheda per i revisori'],
 },
 'en':{
  'title':'How much does the story depend on the rules?',
  'lead':'Recognizing one more name is not a new observation of society. We compare three readings of the same names: the previous method, the explicit vocabulary alone, and their current union. The first also retains inherited contextual readings; the second assigns themes only to words listed in the new vocabulary.',
  'methods':['Previous method','Explicit vocabulary only','Current method: union'],
  'coverage':'Names with at least one theme: count and share of the full round',
  'rule':'Applied reading','conclusion':'A signal to investigate, not a settled conclusion',
  'example':'For commerce and finance, the previous method suggests an increase from 2012 to 2026; the explicit vocabulary alone suggests a decrease. The direction changes with the rules. This comparison helps formulate questions but does not establish societal change.',
  'biasTitle':'Coverage still differs across scripts',
  'bias':'IDN identifies a name represented by an xn-- A-label; it can include accented Latin letters. It does not identify a language or community on its own. New vocabulary translations are editorial proposals requiring competent reviewers.',
  'strata':['IDN','ASCII without IDN'],'details':'Category counts and dependence on vocabulary',
  'theme':'Theme','previous':'Previous','lexical':'Vocabulary only','current':'Current',
  'limit':'The vocabulary was expanded after inspecting unmatched names. Increased recognition is expected and does not measure accuracy. Independent review is needed; categories overlap and shares must not be added.',
  'downloads':['Vocabulary and ambiguities','Reproducible comparisons','Review protocol','Reviewer worksheet'],
 },
 'de':{
  'title':'Wie stark hängt die Geschichte von den Regeln ab?',
  'lead':'Ein zusätzlich erkannter Name ist keine neue Beobachtung der Gesellschaft. Wir vergleichen drei Lesarten derselben Namen: die bisherige Methode, nur das explizite Vokabular und ihre heutige Vereinigung. Die erste bewahrt auch übernommene kontextuelle Deutungen; die zweite ordnet nur den Wörtern im neuen Vokabular Themen zu.',
  'methods':['Bisherige Methode','Nur explizites Vokabular','Heutige Methode: Vereinigung'],
  'coverage':'Namen mit mindestens einem Thema: Anzahl und Anteil an der gesamten Runde',
  'rule':'Angewandte Lesart','conclusion':'Ein Hinweis für weitere Forschung, kein gesicherter Befund',
  'example':'Für Handel und Finanzen deutet die bisherige Methode auf einen Anstieg von 2012 zu 2026 hin; nur das explizite Vokabular deutet auf einen Rückgang hin. Die Richtung ändert sich mit den Regeln. Dieser Vergleich liefert Fragen, belegt aber keinen gesellschaftlichen Wandel.',
  'biasTitle':'Die Abdeckung bleibt zwischen Schriften ungleich',
  'bias':'IDN bezeichnet einen durch ein xn---A-Label dargestellten Namen; auch lateinische Buchstaben mit Akzenten sind möglich. Daraus folgt keine bestimmte Sprache oder Gemeinschaft. Die neuen Übersetzungen sind redaktionelle Vorschläge, die fachkundige Prüfer benötigen.',
  'strata':['IDN','ASCII ohne IDN'],'details':'Kategorien und Abhängigkeit vom Vokabular',
  'theme':'Thema','previous':'Bisher','lexical':'Nur Vokabular','current':'Heute',
  'limit':'Das Vokabular wurde nach Sichtung nicht erkannter Namen erweitert. Mehr erkannte Namen sind daher zu erwarten und messen keine Genauigkeit. Unabhängige Prüfung bleibt nötig; Kategorien überschneiden sich und ihre Anteile sind nicht addierbar.',
  'downloads':['Vokabular und Mehrdeutigkeiten','Reproduzierbare Vergleiche','Prüfprotokoll','Prüfbogen'],
 },
 'fr':{
  'title':'À quel point le récit dépend-il des règles ?',
  'lead':'Reconnaître un nom supplémentaire ne constitue pas une nouvelle observation de la société. Nous comparons trois lectures des mêmes noms : la méthode précédente, le seul vocabulaire explicite et leur union actuelle. La première conserve aussi des lectures contextuelles héritées ; la seconde ne classe que les mots du nouveau vocabulaire.',
  'methods':['Méthode précédente','Vocabulaire explicite seul','Méthode actuelle : union'],
  'coverage':'Noms ayant au moins un thème : nombre et part du cycle complet',
  'rule':'Lecture appliquée','conclusion':'Un signal à étudier, pas une conclusion établie',
  'example':'Pour le commerce et la finance, la méthode précédente suggère une hausse de 2012 à 2026 ; le vocabulaire explicite seul suggère une baisse. Le sens change avec les règles. Cette comparaison aide à poser des questions sans démontrer un changement de société.',
  'biasTitle':'La couverture reste inégale entre écritures',
  'bias':'IDN désigne un nom représenté par une étiquette A commençant par xn-- ; des lettres latines accentuées sont aussi possibles. Cela ne définit pas une langue ou une communauté. Les traductions ajoutées sont des propositions éditoriales à vérifier par des réviseurs compétents.',
  'strata':['IDN','ASCII sans IDN'],'details':'Décomptes par catégorie et dépendance au vocabulaire',
  'theme':'Thème','previous':'Précédent','lexical':'Vocabulaire seul','current':'Actuel',
  'limit':'Le vocabulaire a été élargi après examen des noms non reconnus. Une meilleure reconnaissance est attendue et ne mesure pas l’exactitude. Une révision indépendante reste nécessaire ; les catégories se chevauchent et les parts ne sont pas additionnables.',
  'downloads':['Vocabulaire et ambiguïtés','Comparaisons reproductibles','Protocole de révision','Fiche des réviseurs'],
 },
}

def render(data,lang,labels,number):
    t=COPY[lang];s=data['sensitivity'];rs=[r for r in s['rounds'] if r['round'] in ['2012','2026']]
    def value(n,total):
        pct=f'{100*n/total:.1f}'.replace('.',',' if lang!='en' else '.')
        return f'{number(n,lang)} / {number(total,lang)} · {pct}%'
    body='<section class="culturalSensitivity" id="cultural-sensitivity-v2" aria-labelledby="cultural-sensitivity-title"><h3 id="cultural-sensitivity-title">'+h(t['title'])+'</h3><p>'+h(t['lead'])+'</p>'
    body+='<div class="tldTable"><table><caption>'+h(t['coverage'])+'</caption><thead><tr><th scope="col">'+h(t['rule'])+'</th><th scope="col">2012</th><th scope="col">2026</th></tr></thead><tbody>'
    for i,mode in enumerate(['baseline','lexiconOnly','expanded']):
        body+='<tr><th scope="row">'+h(t['methods'][i])+'</th>'+''.join('<td>'+value(r['views'][mode]['classified'],r['strings'])+'</td>' for r in rs)+'</tr>'
    body+='</tbody></table></div><h4>'+h(t['conclusion'])+'</h4><p>'+h(t['example'])+'</p><p class="small">'+h(t['limit'])+'</p>'
    body+='<details><summary>'+h(t['details'])+'</summary>'
    for c in data['comparableCategoryIds']:
        body+='<h4>'+h(labels[c])+'</h4><div class="tldTable"><table><thead><tr><th scope="col">'+h(t['rule'])+'</th><th scope="col">2012</th><th scope="col">2026</th></tr></thead><tbody>'
        for i,m in enumerate(['baseline','lexiconOnly','expanded']):
            body+='<tr><th scope="row">'+h(t['methods'][i])+'</th>'+''.join('<td>'+value(r['views'][m]['categories'][c],r['strings'])+'</td>' for r in rs)+'</tr>'
        body+='</tbody></table></div>'
    body+='</details><details><summary>'+h(t['biasTitle'])+'</summary><p>'+h(t['bias'])+'</p><div class="tldTable"><table><thead><tr><th scope="col">'+h(t['rule'])+'</th><th scope="col">2012</th><th scope="col">2026</th></tr></thead><tbody>'
    for i,stratum in enumerate(['idn','ascii']):
        strata=[next(s for s in r['strata'] if s['stratum']==stratum) for r in rs]
        body+='<tr><th scope="row">'+h(t['strata'][i])+'</th>'+''.join('<td>'+value(s['expanded'],s['strings'])+'</td>' for s in strata)+'</tr>'
    body+='</tbody></table></div></details><div class="tldLinks">'
    for name,label in zip(['cultural_lexicon_v2.json','cultural_sensitivity_v2.json','cultural_classification_protocol_v2.json','cultural_lexicon_review_queue_v2.csv'],t['downloads']):
        body+='<a href="https://robertbregy.github.io/Connecting-the-Dots/data/'+name+'" download>'+h(label)+' ↓</a>'
    return body+'</div></section>'
