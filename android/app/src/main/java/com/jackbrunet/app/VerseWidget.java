package com.jackbrunet.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** Widget « Verset du jour ». */
public class VerseWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        DailyWidgets.refresh(context, VerseWidget.class, "verse");
    }
}
