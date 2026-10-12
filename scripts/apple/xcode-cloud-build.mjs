/**
 * Lance un build Xcode Cloud de RHEMA via l'API App Store Connect.
 *
 * Secrets attendus (GitHub → Settings → Secrets → Actions) :
 *   ASC_KEY_ID       identifiant de la clé (ex. ABCD123456)
 *   ASC_ISSUER_ID    identifiant de l'émetteur (UUID affiché au-dessus des clés)
 *   ASC_PRIVATE_KEY  contenu complet du fichier AuthKey_XXXX.p8
 * Entrées : BRANCHE (branche git), WORKFLOW (nom du workflow Xcode Cloud, facultatif).
 */
import crypto from "node:crypto";

const { ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY } = process.env;
const BUNDLE = "com.jackbrunet.app";
const BRANCHE = process.env.BRANCHE || "claude/great-hamilton-ieokug";
const WORKFLOW = (process.env.WORKFLOW || "").trim();

if (!ASC_KEY_ID || !ASC_ISSUER_ID || !ASC_PRIVATE_KEY) {
  console.error("Secrets ASC_KEY_ID, ASC_ISSUER_ID et ASC_PRIVATE_KEY manquants.");
  process.exit(1);
}

const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
function jeton() {
  const now = Math.floor(Date.now() / 1000);
  const tete = b64({ alg: "ES256", kid: ASC_KEY_ID, typ: "JWT" });
  const corps = b64({ iss: ASC_ISSUER_ID, iat: now, exp: now + 15 * 60, aud: "appstoreconnect-v1" });
  const sig = crypto.sign("sha256", Buffer.from(`${tete}.${corps}`), { key: ASC_PRIVATE_KEY, dsaEncoding: "ieee-p1363" });
  return `${tete}.${corps}.${sig.toString("base64url")}`;
}
const JWT = jeton();
async function api(chemin, options = {}) {
  const r = await fetch(`https://api.appstoreconnect.apple.com${chemin}`, {
    ...options,
    headers: { Authorization: `Bearer ${JWT}`, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const texte = await r.text();
  if (!r.ok) throw new Error(`${options.method || "GET"} ${chemin} → ${r.status} ${texte.slice(0, 500)}`);
  return texte ? JSON.parse(texte) : {};
}

const apps = await api(`/v1/apps?filter[bundleId]=${BUNDLE}`);
const app = apps.data?.[0];
if (!app) throw new Error(`App ${BUNDLE} introuvable`);
const produit = (await api(`/v1/apps/${app.id}/ciProduct`)).data;
const workflows = (await api(`/v1/ciProducts/${produit.id}/workflows?limit=50`)).data;
console.log("Workflows Xcode Cloud :", workflows.map((w) => w.attributes.name).join(" | "));
const wf = WORKFLOW ? workflows.find((w) => w.attributes.name === WORKFLOW) : workflows.find((w) => w.attributes.isEnabled !== false) ?? workflows[0];
if (!wf) throw new Error("Aucun workflow Xcode Cloud trouvé");

const depot = (await api(`/v1/ciProducts/${produit.id}/primaryRepositories`)).data?.[0];
let ref = null;
let url = `/v1/scmRepositories/${depot.id}/gitReferences?limit=200`;
while (url && !ref) {
  const page = await api(url);
  ref = page.data.find((g) => g.attributes.kind === "BRANCH" && g.attributes.name === BRANCHE);
  url = page.links?.next ? page.links.next.replace("https://api.appstoreconnect.apple.com", "") : null;
}
if (!ref) throw new Error(`Branche ${BRANCHE} introuvable dans le dépôt Xcode Cloud`);

const run = await api(`/v1/ciBuildRuns`, {
  method: "POST",
  body: JSON.stringify({
    data: {
      type: "ciBuildRuns",
      relationships: {
        workflow: { data: { type: "ciWorkflows", id: wf.id } },
        sourceBranchOrTag: { data: { type: "scmGitReferences", id: ref.id } },
      },
    },
  }),
});
console.log(`Build Xcode Cloud lancé : workflow « ${wf.attributes.name} », branche ${BRANCHE}, build n° ${run.data?.attributes?.number ?? "?"}`);
