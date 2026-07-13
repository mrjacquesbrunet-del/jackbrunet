package com.jackbrunet.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Logique commune des widgets d'écran d'accueil : récupère le flux quotidien
 * (verset + punchline du jour) publié sur le site, choisit l'entrée du jour,
 * et met à jour les vues. Un clic ouvre l'application.
 */
public class DailyWidgets {
    static final String FEED_URL = "https://jackbrunet.com/widget/feed.json";

    static void refresh(final Context context, final Class<?> providerClass, final String kind) {
        final Context appCtx = context.getApplicationContext();
        new Thread(new Runnable() {
            @Override
            public void run() {
                JSONObject today = fetchToday();
                AppWidgetManager mgr = AppWidgetManager.getInstance(appCtx);
                int[] ids = mgr.getAppWidgetIds(new ComponentName(appCtx, providerClass));
                for (int id : ids) {
                    mgr.updateAppWidget(id, buildViews(appCtx, kind, today));
                }
            }
        }).start();
    }

    static JSONObject fetchToday() {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(FEED_URL).openConnection();
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            conn.setRequestProperty("Accept", "application/json");
            BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = r.readLine()) != null) sb.append(line);
            r.close();
            JSONObject root = new JSONObject(sb.toString());
            JSONArray days = root.getJSONArray("days");
            String todayStr = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            for (int i = 0; i < days.length(); i++) {
                JSONObject d = days.getJSONObject(i);
                if (todayStr.equals(d.optString("date"))) return d;
            }
            if (days.length() > 0) return days.getJSONObject(0);
        } catch (Exception e) {
            // silencieux : on garde le contenu précédent
        } finally {
            if (conn != null) conn.disconnect();
        }
        return null;
    }

    static RemoteViews buildViews(Context ctx, String kind, JSONObject today) {
        boolean punch = "punchline".equals(kind);
        int layout = punch ? R.layout.widget_punchline : R.layout.widget_verse;
        RemoteViews views = new RemoteViews(ctx.getPackageName(), layout);
        if (today != null) {
            if (punch) {
                views.setTextViewText(R.id.widget_punchline_text, today.optString("punchline"));
            } else {
                views.setTextViewText(R.id.widget_verse_text, "« " + today.optString("verseText") + " »");
                views.setTextViewText(R.id.widget_verse_ref, today.optString("verseReference"));
            }
        }
        Intent intent = new Intent(ctx, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getActivity(ctx, punch ? 2 : 1, intent, flags);
        views.setOnClickPendingIntent(R.id.widget_root, pi);
        return views;
    }
}
