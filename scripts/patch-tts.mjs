// Après npm install : remplace l'implémentation iOS du module de synthèse
// vocale par notre version (lecture écran verrouillé + chapitre en file).
// Voir scripts/patches/text-to-speech/TextToSpeech.swift.
import { copyFileSync, existsSync } from "node:fs";

const cible = "node_modules/@capacitor-community/text-to-speech/ios/Sources/TextToSpeechPlugin/TextToSpeech.swift";
if (existsSync(cible)) {
  copyFileSync("scripts/patches/text-to-speech/TextToSpeech.swift", cible);
  console.log("text-to-speech : correctif iOS appliqué");
}
