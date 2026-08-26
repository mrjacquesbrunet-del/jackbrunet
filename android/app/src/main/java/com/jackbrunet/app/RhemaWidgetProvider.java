package com.jackbrunet.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/**
 * Base des widgets RHEMA. Deux variantes : la punchline du jour, ou le verset
 * du jour. Un appui ouvre l'application.
 */
public abstract class RhemaWidgetProvider extends AppWidgetProvider {

    /** true = affiche le verset ; false = affiche la punchline. */
    protected abstract boolean showVerse();

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        WidgetContent c = WidgetContent.today(ctx);
        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_rhema);
            if (showVerse()) {
                String text = c.verse == null || c.verse.isEmpty() ? c.punchline : "« " + c.verse + " »";
                v.setTextViewText(R.id.widget_kicker, "Verset du jour");
                v.setTextViewText(R.id.widget_text, text);
            } else {
                v.setTextViewText(R.id.widget_kicker, "Punchline du jour");
                v.setTextViewText(R.id.widget_text, c.punchline);
            }
            v.setTextViewText(R.id.widget_ref, c.reference);

            Intent i = new Intent(ctx, MainActivity.class);
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
            PendingIntent pi = PendingIntent.getActivity(ctx, showVerse() ? 1 : 2, i, flags);
            v.setOnClickPendingIntent(R.id.widget_root, pi);

            mgr.updateAppWidget(id, v);
        }
    }
}
