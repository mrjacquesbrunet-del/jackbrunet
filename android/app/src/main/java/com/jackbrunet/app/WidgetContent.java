package com.jackbrunet.app;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;

/**
 * Contenu « du jour » des widgets RHEMA (verset + punchline), lu depuis
 * assets/widget-content.json. L'index du jour reprend la même logique que
 * l'app (jour de l'année modulo le nombre d'éléments), pour rester synchronisé.
 */
public final class WidgetContent {
    public String verse = "";
    public String reference = "";
    public String punchline = "";

    public static WidgetContent today(Context ctx) {
        WidgetContent c = new WidgetContent();
        try {
            InputStream is = ctx.getAssets().open("widget-content.json");
            byte[] buf = new byte[is.available()];
            //noinspection ResultOfMethodCallIgnored
            is.read(buf);
            is.close();
            JSONObject root = new JSONObject(new String(buf, StandardCharsets.UTF_8));
            JSONArray items = root.getJSONArray("items");
            int n = items.length();
            if (n == 0) return c;
            int day = Calendar.getInstance().get(Calendar.DAY_OF_YEAR); // 1..366
            int idx = ((day % n) + n) % n;
            JSONObject o = items.getJSONObject(idx);
            c.verse = o.optString("v", "");
            c.reference = o.optString("r", "");
            c.punchline = o.optString("p", "");
        } catch (Exception e) {
            c.punchline = "Une révélation chaque jour dans notre App";
        }
        return c;
    }
}
