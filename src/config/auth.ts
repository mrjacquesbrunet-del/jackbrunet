/**
 * Connexion Google / Apple NATIVE (app iOS / Android).
 *
 * Ces identifiants sont publics (ils figurent dans toute app qui utilise
 * Google Sign-In) : ce ne sont PAS des secrets. Tant qu'ils sont vides, les
 * boutons natifs restent masqués et l'app garde la connexion e-mail.
 *
 * - GOOGLE_WEB_CLIENT_ID : client OAuth « Application Web » (Google Cloud),
 *   le même que celui saisi dans Supabase → Authentication → Providers → Google.
 * - GOOGLE_IOS_CLIENT_ID : client OAuth « iOS » (bundle com.jackbrunet.app).
 *   Son « reversed client ID » doit aussi figurer dans ios/App/App/Info.plist
 *   (CFBundleURLSchemes).
 * - Apple (iOS) n'a besoin d'aucun identifiant ici : il suffit de la
 *   capacité « Sign in with Apple » dans Xcode et du bundle id déclaré dans
 *   Supabase → Providers → Apple → Client IDs.
 */
export const GOOGLE_WEB_CLIENT_ID = "";
export const GOOGLE_IOS_CLIENT_ID = "";
export const APP_BUNDLE_ID = "com.jackbrunet.app";
