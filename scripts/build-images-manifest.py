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
V.update(G("satan","Validé par Jack (image adaptée) : symbolique, sans visage — le serpent ancien enroulé autour de l'arbre au fruit lumineux, clair-obscur. Rien de gore ni d'occulte. Deux variantes déjà générées dans Magnific : https://www.magnific.com/app/creation/w4TVeck7EI et https://www.magnific.com/app/creation/1lZ2nRPr4r"))
V.update(G("baal dagon moloc-kemosch diane","Validé par Jack (image adaptée) : la statue de l'idole, objet sans vie, sur son autel ; aucun personnage vivant, aucune victime."))
V["baal"]+=" Baal : statue de bronze du dieu de l'orage, foudre levée. Variantes déjà générées : https://www.magnific.com/app/creation/5ji3ARIKxe et https://www.magnific.com/app/creation/3zItahVREY"
V["dagon"]+=" Dagon : idole mi-homme mi-poisson tombée face contre terre, tête et mains brisées sur le seuil (1 Samuel 5.4). Variantes déjà générées : https://www.magnific.com/app/creation/0eFHKkrTfW et https://www.magnific.com/app/creation/Do5Kxj9pcl"
V["moloc-kemosch"]+=" Moloc : idole de bronze à tête de taureau, bras tendus, brasier ; aucun enfant. Variantes déjà générées : https://www.magnific.com/app/creation/Lwzn0DHswO et https://www.magnific.com/app/creation/jUGzcDOLD0"
V["diane"]+=" Diane (Artémis d'Éphèse) : statue de culte vêtue dans son temple, petits temples d'argent à ses pieds. Variantes déjà générées : https://www.magnific.com/app/creation/u5yP6GpQLD et https://www.magnific.com/app/creation/iG8IvHV3uK"
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
# Lot 9 (octobre 2026) : les personnes des arbres généalogiques
V.update(G("henoc-cain irad mehujael metuschael","Homme des tout premiers temps de l'humanité, lignée de Caïn : peau mate, cheveux longs, vêtements de peaux et de laine grossière ; air fier, bâtisseur de la première ville."))
V.update(G("ada-lemec tsilla","Femme des tout premiers temps de l'humanité : longs cheveux tressés, robe de laine teinte, bijoux de cuivre simples ; visage grave."))
V["naama-lemec"]="Jeune femme des tout premiers temps de l'humanité, sœur d'un forgeron : longs cheveux, robe de laine, petit bijou de bronze ; douceur."
V.update(G("enosch kenan mahalaleel jered","Patriarche d'avant le déluge, très âgé et vénérable : longue barbe blanche, tunique de laine écrue, mains ouvertes en prière ; lumière douce."))
V["cusch"]="Ancêtre koushite (Éthiopie ancienne) des tout premiers peuples après le déluge : peau très foncée, cheveux courts frisés, collier de perles, tunique de lin."
V["mitsraim"]="Ancêtre des Égyptiens, aux origines : peau mate, khôl, coiffe égyptienne archaïque simple, pagne et collier de lin."
V["puth"]="Ancêtre d'un peuple d'Afrique du Nord (Libye ancienne) : peau brune, plume dans les cheveux tressés, manteau de cuir."
V["canaan-fils"]="Jeune homme du Proche-Orient ancien, petit-fils de Noé, ancêtre des Cananéens : barbe naissante, tunique colorée ; regard sombre et troublé (sans caricature)."
V["elam-sem"]="Ancêtre des Élamites (Iran ancien) : barbe noire taillée, bonnet rond, robe à motifs ; montagnes à l'est."
V["assur-sem"]="Ancêtre des Assyriens : longue barbe noire bouclée en rangs, bandeau, manteau frangé ; plus simple qu'un roi."
V["lud"]="Ancêtre d'un peuple d'Asie Mineure (Lydie) : cheveux bouclés, manteau de laine épaisse, arc à l'épaule."
V["aram-sem"]="Ancêtre des Araméens (Syrie ancienne) : barbe, keffieh de laine, manteau de berger des steppes."
V.update(G("arpacschad schelach heber peleg rehu serug nachor-ancien","Patriarche sémite des générations après le déluge, éleveur nomade de Mésopotamie : barbe grise ou blanche, turban et manteau de laine, bâton ; chaque visage distinct (âge et traits variés)."))
V["jokthan"]="Ancêtre des tribus du sud de l'Arabie : peau tannée, keffieh, bijoux d'or, désert en arrière-plan."
V["jisca"]="Jeune femme d'Ur en Chaldée (Mésopotamie ancienne) : cheveux noirs relevés, bandeau, robe à franges, bijoux de lapis-lazuli."
V.update(G("moab-fils ben-ammi","Jeune homme né dans les montagnes à l'est de la mer Morte, ancêtre d'un peuple (Moab / Ammon) : tenue de berger, peau hâlée ; Moab et Ben-Ammi doivent être différents."))
V["fille-schua"]="Femme cananéenne de l'époque des patriarches : voile coloré, bijoux, traits levantins."
V["schela"]="Jeune homme de Juda, à l'époque des patriarches : tunique simple de berger, barbe naissante ; air hésitant."
V.update(G("hetsron ram","Hébreu de la tribu de Juda pendant le séjour en Égypte : tunique de lin, barbe, influences égyptiennes discrètes ; âge mûr."))
V["amminadab"]="Chef de famille de la tribu de Juda, à l'époque de l'Exode : barbe grise, manteau rayé, air digne."
V["elischeba"]="Femme israélite de l'Exode, épouse du premier grand prêtre Aaron : voile, visage noble et serein, bijou discret."
V["salmon"]="Homme de la tribu de Juda au temps de la conquête de Canaan : barbe, manteau, ceinturon ; époux de Rahab, regard bienveillant."
V.update(G("zabdi carmi","Homme de la tribu de Juda au temps de Josué : barbe, tunique de guerrier simple ; Zabdi âgé, Carmi d'âge mûr, l'air inquiet."))
V.update(G("jitsehar hebron-fils uziel","Lévite de la génération de l'Égypte (oncle de Moïse) : barbe, tunique de lin, ceinture tissée ; chaque visage distinct."))
V.update(G("abinadab-isai schimea nethaneel raddai otsem","Frère aîné de David, fils d'Isaï de Bethléhem : jeune homme ou adulte de Juda, berger ou soldat de Saül ; ressemblance familiale avec David mais âges et traits différents."))
V["abigail-soeur"]="Femme de Bethléhem de Juda, sœur de David, mère d'un chef d'armée : voile, âge mûr, visage fort."
V["kileab"]="Jeune prince de la cour de David à Hébron, fils d'Abigaïl : tunique fine, cheveux courts, air doux."
V["maaca-david"]="Princesse araméenne de Gueschur, fille de roi : bijoux d'or, diadème fin, voile brodé ; mère d'Absalom (belle et fière)."
V["haggith"]="Femme de la cour de David, mère d'Adonija : robe raffinée, voile, bijoux ; air ambitieux."
V["nathan-fils-david"]="Prince de Jérusalem, fils de David et de Bath-Schéba, frère de Salomon : jeune homme élégant, tunique royale sobre (à ne pas confondre avec le prophète Nathan)."
V["naama-ammonite"]="Reine-mère ammonite, femme de Salomon : couronne, bijoux d'or, robe brodée ; traits du Levant oriental."
V["schealthiel"]="Prince de la lignée de David né en exil à Babylone : barbe, turban, tenue judéenne mêlée d'éléments babyloniens ; air mélancolique."
V["achinoam-saul"]="Reine d'Israël, femme de Saül : simple diadème, voile, visage digne et discret."
V.update(G("joses simon-frere","Jeune homme galiléen du Ier siècle, frère de Jésus, artisan : tunique de lin, barbe courte, mains de charpentier ; Joses et Simon différents."))
V["soeurs-jesus"]="Deux ou trois jeunes femmes galiléennes du Ier siècle, sœurs de Jésus : voiles simples, tenues modestes ; visages doux."
V["salome-herodias"]="Jeune fille de la cour hérodienne : robe raffinée, bijoux, voile léger ; pudique, aucune scène de danse suggestive, AUCUN plat ni tête coupée."
V["aristobule"]="Jeune prince de la dynastie d'Hérode : tenue gréco-romaine riche, diadème fin, cheveux courts ; air noble et triste."
V["herode-antipas"]="Hérode Antipas, tétrarque de Galilée : couronne fine, manteau pourpre, bagues ; air rusé (« ce renard »). Doit se distinguer clairement de herode.jpg (son père)."
V["herode-agrippa"]="Hérode Agrippa Ier, roi de Judée : habits royaux brillants (vêtement tissé d'argent), couronne ; air orgueilleux."
V["philippe-tetrarque"]="Philippe le tétrarque, fils d'Hérode : tenue gréco-romaine sobre, diadème fin ; visage plus doux que ses frères."
V["herode-philippe"]="Prince hérodien sans charge officielle, premier mari d'Hérodias : tenue riche mais sobre, air effacé."
MULTI.add("soeurs-jesus")
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
