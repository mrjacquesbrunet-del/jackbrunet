import WidgetKit
import SwiftUI

// MARK: - Contenu « du jour »

struct DailyItem {
    let verse: String
    let reference: String
    let punchline: String
}

/// Charge le contenu du jour depuis widget-content.json (embarqué dans le
/// bundle de l'extension). L'index reprend la logique de l'app : jour de
/// l'année modulo le nombre d'éléments.
func loadTodayItem() -> DailyItem {
    let fallback = DailyItem(verse: "", reference: "",
                             punchline: "Une révélation chaque jour dans notre App")
    guard let url = Bundle.main.url(forResource: "widget-content", withExtension: "json"),
          let data = try? Data(contentsOf: url),
          let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let items = root["items"] as? [[String: Any]], !items.isEmpty else {
        return fallback
    }
    let day = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
    let idx = ((day % items.count) + items.count) % items.count
    let o = items[idx]
    return DailyItem(verse: o["v"] as? String ?? "",
                     reference: o["r"] as? String ?? "",
                     punchline: o["p"] as? String ?? "")
}

// MARK: - Timeline

struct RhemaEntry: TimelineEntry {
    let date: Date
    let item: DailyItem
    let showVerse: Bool
}

struct RhemaProvider: TimelineProvider {
    let showVerse: Bool

    func placeholder(in context: Context) -> RhemaEntry {
        RhemaEntry(date: Date(), item: loadTodayItem(), showVerse: showVerse)
    }
    func getSnapshot(in context: Context, completion: @escaping (RhemaEntry) -> Void) {
        completion(RhemaEntry(date: Date(), item: loadTodayItem(), showVerse: showVerse))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<RhemaEntry>) -> Void) {
        let entry = RhemaEntry(date: Date(), item: loadTodayItem(), showVerse: showVerse)
        // Rafraîchit peu après minuit pour changer de contenu chaque jour.
        let next = Calendar.current.nextDate(
            after: Date(),
            matching: DateComponents(hour: 0, minute: 1),
            matchingPolicy: .nextTime
        ) ?? Date().addingTimeInterval(6 * 3600)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Vue

private let limeColor = Color(red: 0.79, green: 0.94, blue: 0.0)
private let limeSoft = Color(red: 0.66, green: 0.77, blue: 0.0)
private let creamColor = Color(red: 0.95, green: 0.95, blue: 0.93)
private let nightColor = Color(red: 0.047, green: 0.047, blue: 0.043)

struct RhemaWidgetView: View {
    var entry: RhemaEntry

    private var mainText: String {
        if entry.showVerse {
            return entry.item.verse.isEmpty ? entry.item.punchline : "« \(entry.item.verse) »"
        }
        return entry.item.punchline
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(entry.showVerse ? "VERSET DU JOUR" : "PUNCHLINE DU JOUR")
                .font(.system(size: 10, weight: .bold))
                .tracking(1)
                .foregroundColor(limeColor)
            Text(mainText)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(creamColor)
                .lineLimit(5)
                .minimumScaleFactor(0.7)
            Spacer(minLength: 0)
            Text(entry.item.reference)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(limeSoft)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .modifier(WidgetBackground())
    }
}

/// Fond du widget : containerBackground sur iOS 17+, sinon fond classique.
struct WidgetBackground: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.padding(16).containerBackground(nightColor, for: .widget)
        } else {
            content.padding(16).background(nightColor)
        }
    }
}

// MARK: - Widgets

struct PunchlineWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "RhemaPunchline", provider: RhemaProvider(showVerse: false)) { entry in
            RhemaWidgetView(entry: entry)
        }
        .configurationDisplayName("Punchline du jour")
        .description("La punchline du jour, sur ton écran d'accueil.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct VerseWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "RhemaVerse", provider: RhemaProvider(showVerse: true)) { entry in
            RhemaWidgetView(entry: entry)
        }
        .configurationDisplayName("Verset du jour")
        .description("Le verset du jour, sur ton écran d'accueil.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct RhemaWidgetBundle: WidgetBundle {
    var body: some Widget {
        PunchlineWidget()
        VerseWidget()
    }
}
