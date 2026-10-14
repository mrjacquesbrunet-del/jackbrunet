// Après npm install : correctifs iOS de deux modules natifs.
//  1) Synthèse vocale : lecture écran verrouillé + chapitre en file
//     (scripts/patches/text-to-speech/TextToSpeech.swift).
//  2) Fonds musicaux (soaking, ambiance) : le module ne prend PAS les commandes
//     de l'écran verrouillé (laissées au lecteur web : podcasts, Bible) et ne
//     désactive jamais la session audio (la voix web peut être en train de jouer).
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const tts = "node_modules/@capacitor-community/text-to-speech/ios/Sources/TextToSpeechPlugin/TextToSpeech.swift";
if (existsSync(tts)) {
  copyFileSync("scripts/patches/text-to-speech/TextToSpeech.swift", tts);
  console.log("text-to-speech : correctif iOS appliqué");
}

const na = "node_modules/@capgo/native-audio/ios/Sources/NativeAudioPlugin/Plugin.swift";
if (existsSync(na)) {
  let s = readFileSync(na, "utf8");
  s = s.replace(
    /\n(\s*)setupRemoteCommandCenter\(\)\n/,
    "\n$1// RHEMA : commandes écran verrouillé laissées au lecteur web\n",
  );
  s = s.replaceAll(
    "try self.session.setActive(false, options: .notifyOthersOnDeactivation)",
    "_ = self.session // RHEMA : on ne coupe jamais la session (la voix web peut jouer)",
  );
  writeFileSync(na, s);
  console.log("native-audio : correctif iOS appliqué");
}
