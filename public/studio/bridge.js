/* Pont entre le Studio (page autonome, chargée dans /admin/studio) et Supabase.
 *
 * Le Studio parle à une petite base de documents : collection(...).add / onSnapshot,
 * doc("collection/id").set / update / delete / onSnapshot. Ce fichier fournit cette
 * interface au-dessus de la table `studio_docs`, avec le client Supabase de la page
 * parente (même session que le site). La sécurité est assurée côté base : la RLS
 * de `studio_docs` réserve lecture et écriture à l'admin (is_admin()).
 */
(function () {
  var sb = null;
  try {
    if (window.parent !== window) sb = window.parent.__studioSupabase || null;
  } catch (e) {
    sb = null;
  }

  var TABLE = "studio_docs";
  var REFRESH_MS = 60000;
  var listeners = new Set();
  var refreshTimer = null;

  /* Relit toutes les vues ouvertes, regroupé si plusieurs écritures s'enchaînent. */
  function refreshAll() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      listeners.forEach(function (run) { run(); });
    }, 80);
  }

  function fail(result) {
    if (result.error) throw result.error;
    return result;
  }

  function newId() {
    return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/[^a-z0-9]/gi, "").slice(0, 20);
  }

  function listen(run) {
    listeners.add(run);
    run();
    return function () { listeners.delete(run); };
  }

  function docRef(coll, id) {
    function readOne() {
      return sb.from(TABLE).select("data").eq("coll", coll).eq("id", id).maybeSingle();
    }
    return {
      onSnapshot: function (next, onError) {
        return listen(async function () {
          var r = await readOne();
          if (r.error) { if (onError) onError(r.error); return; }
          next({ id: id, exists: !!r.data, data: function () { return r.data ? r.data.data : undefined; } });
        });
      },
      set: async function (data) {
        fail(await sb.from(TABLE).upsert({ coll: coll, id: id, data: data, updated_at: new Date().toISOString() }));
        refreshAll();
      },
      update: async function (patch) {
        var cur = fail(await readOne());
        var merged = Object.assign({}, cur.data ? cur.data.data : {}, patch);
        fail(await sb.from(TABLE).upsert({ coll: coll, id: id, data: merged, updated_at: new Date().toISOString() }));
        refreshAll();
      },
      delete: async function () {
        fail(await sb.from(TABLE).delete().eq("coll", coll).eq("id", id));
        refreshAll();
      },
    };
  }

  function collection(coll) {
    var query = {
      limit: function () { return query; },
      onSnapshot: function (next, onError) {
        return listen(async function () {
          var r = await sb.from(TABLE).select("id,data").eq("coll", coll).limit(5000);
          if (r.error) { if (onError) onError(r.error); return; }
          next({
            docs: r.data.map(function (row) {
              return { id: row.id, exists: true, data: function () { return row.data; } };
            }),
          });
        });
      },
      add: async function (data) {
        var id = newId();
        fail(await sb.from(TABLE).insert({ coll: coll, id: id, data: data }));
        refreshAll();
        return { id: id };
      },
      doc: function (id) { return docRef(coll, id); },
    };
    return query;
  }

  var db = {
    collection: collection,
    doc: function (path) {
      var parts = path.split("/");
      return docRef(parts[0], parts[1]);
    },
  };

  // Les chiffres écrits par l'analyse du lundi apparaissent sans recharger la page.
  setInterval(refreshAll, REFRESH_MS);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) refreshAll();
  });

  /* Chiffres de l'application RHEMA pour l'accueil du Studio. analytics_app_daily donne la courbe
   * jour par jour ; tant que cette fonction n'est pas installée, on se rabat sur les totaux de
   * analytics_app_insights (sans courbe). */
  var rhema = {
    activite: async function (jours) {
      var r = await sb.rpc("analytics_app_daily", { jours: jours });
      if (!r.error && r.data) return Object.assign({ complet: true }, r.data);
      var ins = await sb.rpc("analytics_app_insights");
      if (ins.error || !ins.data) return null;
      var since = new Date(Date.now() - jours * 864e5).toISOString();
      var p = await sb.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since);
      return { complet: false, serie: null, actifs_periode: ins.data.app_active_month, actifs_aujourdhui: ins.data.app_active_day,
        inscrits_periode: p.error ? null : p.count };
    },
    avatar: async function () {
      var u = await sb.auth.getUser();
      var id = u.data && u.data.user ? u.data.user.id : null;
      if (!id) return null;
      var r = await sb.from("profiles").select("avatar_url").eq("id", id).maybeSingle();
      return r.data ? r.data.avatar_url : null;
    },
  };

  window.claude = {
    use: async function (name) {
      if (!sb) return null;
      if (name === "db") return db;
      if (name === "rhema") return rhema;
      // La page parente n'affiche le Studio qu'à l'admin ; la RLS fait foi.
      if (name === "user") return { isOwner: async function () { return true; } };
      return null;
    },
  };
})();
