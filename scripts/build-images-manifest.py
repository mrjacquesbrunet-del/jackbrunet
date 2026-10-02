import json,os
ROOT=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
d=json.load(open(f"{ROOT}/content/bible-fiches.json"))
NT=set(range(40,67))
G=lambda ids,txt:{i:txt for i in ids.split()}
V={}
V.update(G("pharaon schischak neco asnath echanson-panetier jannes-jambres","Égyptien de l'Antiquité : peau mate, khôl, coiffe ou perruque égyptienne, lin blanc, bijoux d'or (pharaon : coiffe némès rayée bleu et or)."))
V.update(G("sancherib rabschake tiglath-pileser salmanasar","Assyrien : longue barbe noire bouclée et frisée en rangs, haute tiare ou bandeau, manteau frangé, bracelets."))
V.update(G("aschpenaz arjoc nebuzaradan evil-merodac merodac-baladan","Babylonien : barbe bouclée, turban ou tiare cylindrique, tunique brodée, bijoux ; officier ou dignitaire de cour."))
V.update(G("artaxerxes hegai hathac zeresch bigthan-theresch thathnai","Perse achéménide : robe ample plissée, coiffe perse (roi : couronne crénelée), barbe soignée pour les hommes ; eunuques imberbes."))
V.update(G("gueschem","Chef arabe du désert : keffieh, peau tannée, barbe."))
V.update(G("sanballat tobija","Gouverneur de la région de Samarie / notable ammonite de l'époque perse : tenue de dignitaire, air hostile et rusé."))
V.update(G("ben-hadad retsin","Roi araméen de Damas : barbe, couronne, manteau pourpre."))
V.update(G("balak mescha eglon","Roi moabite : couronne, manteau ; Églon est très gras (Juges 3.17)."))
V.update(G("nachasch hanun","Roi ammonite : couronne, barbe, air dur."))
V.update(G("akisch","Roi philistin de Gath : casque à plumes ou coiffe philistine, cuirasse, traits égéens."))
V.update(G("sisera jabin adoni-tsedek adoni-bezek hamor","Cananéen : chef ou roi de l'âge du bronze/fer, barbe, coiffe ou casque cananéen."))
V.update(G("ephron","Héthien d'Hébron : notable âgé, robe et bonnet, assis à la porte de la ville."))
V.update(G("ornan","Jébusien : paysan propriétaire d'une aire de battage, tunique simple, épis de blé."))
V.update(G("heber-kenien hobab","Kénien nomade : tente, keffieh, bâton."))
V.update(G("oreb-zeeb zebach-tsalmunna","Deux chefs (ou rois) madianites nomades : turbans, croissants d'or au cou des chameaux (Juges 8.21). Deux bustes côte à côte."))
V.update(G("agag amalek","Amalécite nomade guerrier du désert du Néguev."))
V.update(G("auguste tibere claude-empereur cesar-neron","Empereur romain : couronne de laurier, toge pourpre, buste façon statue antique mais vivant ; physionomie distincte pour chacun (Auguste jeune, Tibère austère, Claude âgé, Néron joufflu)."))
V.update(G("quirinius gallion sergius-paulus lysanias","Haut magistrat romain : toge blanche à bande pourpre, cheveux courts, rasé."))
V.update(G("claude-lysias julius centenier-capernaum centenier-croix","Officier romain : casque, cuirasse, cape rouge, rasé (le centenier de la croix : regard bouleversé)."))
V.update(G("blaste","Chambellan de la cour d'Hérode Agrippa : tenue raffinée, gréco-romaine."))
V.update(G("berenice drusille","Princesse de la dynastie d'Hérode : bijoux, diadème, élégance gréco-romaine."))
V.update(G("archelaus","Ethnarque hérodien : diadème, manteau pourpre, air inquiétant."))
V.update(G("tertulle","Orateur avocat gréco-romain : toge, geste oratoire."))
V.update(G("demetrius-orfevre","Orfèvre grec d'Éphèse : tablier de cuir, petit temple d'argent de Diane dans les mains."))
V.update(G("geolier-philippes","Geôlier romain de Philippes : tenue simple de garde, trousseau de clés, torche ; visage ému."))
V.update(G("servante-python","Jeune esclave grecque de Philippes, tunique simple ; regard libéré (pas de symbole occulte)."))
V.update(G("eunuque-ethiopien","Haut fonctionnaire koushite (éthiopien) : peau très foncée, turban, riche tenue, rouleau d'Ésaïe."))
V.update(G("femme-cananeenne veuve-sarepta","Femme phénicienne (syro-phénicienne) : voile coloré, traits levantins."))
V.update(G("mages","Mages d'Orient (Perse/Babylonie) : trois personnages de groupe, robes riches, coffrets d'or, d'encens et de myrrhe, étoile au-dessus. Ne pas en faire des rois couronnés."))
V.update(G("bergers","Groupe de bergers de Bethléhem, de nuit, avec moutons et lumière céleste au-dessus."))
V.update(G("sept-diacres","Groupe de sept hommes judéo-hellénistes de l'Église de Jérusalem (Prochore, Nicanor, Timon, Parménas, Nicolas…)."))
V.update(G("prophetes-antioche","Trois hommes : Siméon Niger (Africain, peau foncée), Lucius de Cyrène (Nord-Africain), Manahen (homme de cour)."))
V.update(G("salues-romains","Groupe de croyants de l'Église de Rome, hommes et femmes, esclaves et affranchis, dans une maison."))
V.update(G("eubulus-pudens-linus-claudia","Groupe de quatre croyants romains (trois hommes, une femme)."))
V.update(G("fils-sceva","Exorcistes juifs ambulants mis en fuite : deux ou trois jeunes hommes, vêtements déchirés, air paniqué (sans démon représenté)."))
V.update(G("lepreux-samarie","Quatre lépreux en haillons, visages bandés, découvrant un camp abandonné au crépuscule."))
V.update(G("brigands-croix","Pas de crucifixion réaliste : trois croix en silhouette sur le Golgotha au crépuscule, celle du centre plus lumineuse."))
MULTI=set("dathan-abiram er-onan machlon-kiljon bigthan-theresch jannes-jambres phygelle-hermogene andronicus-junias fortunatus-achaicus lois-eunice evodie-syntyche hymenee-alexandre joseph-barsabbas judas-barsabas eldad-medad zimri-cozbi kehath-guerschon-merari heman-jeduthun hophni-phinees nadab-abihu enfants-esaie agur-lemuel sept-diacres jubal-tubal-cain filles-tselophchad oreb-zeeb zebach-tsalmunna".split())
V.update(G("gabriel","Ange messager majestueux et lumineux, grandes ailes, visage paisible, lys ou rouleau ; style des portraits, non effrayant."))
V.update(G("michel-archange","Archange guerrier : armure dorée, grandes ailes, épée ou lance levée, visage noble."))
V.update(G("satan","À VALIDER PAR JACK. Proposition : symbolique, sans visage — le serpent ancien enroulé autour de l'arbre dans un clair-obscur, ou une ombre menaçante. Rien de gore ni d'occulte."))
V.update(G("baal dagon moloc-kemosch diane","À VALIDER PAR JACK. Proposition : la statue de l'idole sur son autel (Baal : dieu de l'orage en bronze, foudre ; Dagon : idole mi-homme mi-poisson brisée au sol ; Moloc/Kemosch : idole de bronze et brasier, aucun enfant ; Diane : statue d'Artémis dans le temple d'Éphèse). Pas de personnage vivant."))
V.update(G("femme-endor","Femme âgée dans une maison sombre, lampe à huile ; AUCUN symbole occulte (règle de l'app)."))
V.update(G("levite-juges19","Lévite voyageur avec son âne, sur la route au crépuscule ; aucune violence montrée."))
V.update(G("fille-jephthe","Jeune fille joyeuse avec un tambourin, danse ; ton grave mais pudique."))
V.update(G("femme-adultere","Femme à genoux, pierres tombées au sol autour d'elle, lumière d'espérance."))
V.update(G("hemorroisse","Femme dans la foule, main tendue vers la frange du vêtement de Jésus."))
V.update(G("pauvre-veuve","Veuve âgée et pauvre déposant deux petites pièces au tronc du temple."))
V.update(G("jeune-homme-riche","Jeune homme riche, vêtements luxueux, regard triste."))
V.update(G("legion","Homme délivré, assis, vêtu, apaisé, sur la rive orientale du lac ; aucun démon."))
V.update(G("aveugle-ne","Homme qui vient de recouvrer la vue, émerveillé, près du réservoir de Siloé."))
V.update(G("bon-samaritain","Scène de la parabole : le Samaritain bandant les plaies du blessé au bord de la route de Jéricho, sa monture à côté."))
V.update(G("fils-prodigue","Scène de la parabole : le père qui court et serre dans ses bras le fils revenu en haillons."))
V.update(G("riche-lazare","Scène de la parabole : le pauvre Lazare couché à la porte du riche festoyant."))
V.update(G("femme-lot","Femme se retournant, le corps commençant à se changer en sel ; Sodome en flammes au loin."))
V.update(G("echanson-panetier","Deux officiers égyptiens de cour en prison : l'un avec une coupe, l'autre avec des corbeilles de pain."))
V.update(G("lepreux-samarie servante-naaman","Petite fille israélite captive au service d'une maison araméenne : tunique simple, visage confiant.") if False else {})
V["servante-naaman"]="Petite fille israélite captive au service d'une maison araméenne : tunique simple, visage confiant."
V["homme-dieu-juda"]="Prophète judéen austère, manteau de prophète, désignant l'autel de Béthel."
V["femme-job"]="Femme d'âge mûr, accablée par le deuil, vêtements de deuil."
V["ikabod"]="Nouveau-né (ou petit enfant) du sanctuaire de Silo, dans les bras d'une femme."
V["enfants-esaie"]="Deux jeunes garçons, fils du prophète Ésaïe."
V["obed"]="Enfant (ou bébé) dans les bras de Naomi âgée."
V["guerschom"]="Deux jeunes fils de Moïse, tenue madianite."
V["abischag"]="Jeune femme de Sunem, très belle, simple et digne."
V["pharaon"]="Pharaon égyptien générique (représente plusieurs rois) : coiffe némès, uræus, khôl."
V.update(G("tyrannus tertius eraste chloe stephanas archippe apphia nymphas clement zenas carpus crescens sopater aristarque jason trophime onesiphore titius-justus artemas antipas phygelle-hermogene fortunatus-achaicus evodie-syntyche sosthene hymenee alexandre-forgeron mnason rufus andronicus-junias","Croyant(e) du monde gréco-romain du Ier siècle (Asie Mineure, Grèce ou Rome selon la bio) : tunique et manteau gréco-romains, cheveux courts pour les hommes, physionomie méditerranéenne."))
LIEU="Paysage emblématique, même vignette ronde à bord sombre que jerusalem.jpg, lumière dorée."
def testament(x):
    ls=[p[1] for p in x["passages"]]
    if all(l in NT for l in ls): return "NT"
    if not any(l in NT for l in ls): return "AT"
    return "NT" if x["id"] in ("gabriel","mont-oliviers","siloe") else "AT"
out=[]
for k,typ in (("personnages","personnage"),("lieux","lieu")):
    for x in d[k]:
        if os.path.exists(f"{ROOT}/public/img/bible/fiches/{x['id']}.jpg"): continue
        e={"id":x["id"],"fichier":f"public/img/bible/fiches/{x['id']}.jpg","type":typ,"testament":testament(x),"nom":x["nom"]}
        if x.get("periode"): e["periode"]=x["periode"]
        if x.get("tribu"): e["tribu"]=x["tribu"]
        e["bio"]=x["bio"]
        if typ=="lieu": e["visuel"]=V.get(x["id"], LIEU + (" (localisation incertaine : paysage générique cohérent)" if not x.get("geo") else ""))
        else:
            e["visuel"]=V.get(x["id"],"Portrait en buste, physionomie israélite/judéenne de l'Antiquité (sauf indication), âge et tenue selon la bio.")
            if x["id"] in MULTI: e["visuel"]+=" Fiche de plusieurs personnes : les représenter ensemble (2 à 5 bustes) dans le même cadre."
        out.append(e)
order={"personnage":0,"lieu":1}
out.sort(key=lambda e:(e["testament"]!="AT",order[e["type"]]))
json.dump(out,open(f"{ROOT}/docs/images-fiches-a-generer.json","w"),ensure_ascii=False,indent=1)
import collections
print(len(out), collections.Counter((e["testament"],e["type"]) for e in out))
