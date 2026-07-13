package com.jackbrunet.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** Widget « Punchline du jour ». */
public class PunchlineWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        DailyWidgets.refresh(context, PunchlineWidget.class, "punchline");
    }
}
