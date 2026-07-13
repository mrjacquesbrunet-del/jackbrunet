// Widgets d'écran d'accueil iOS (WidgetKit) : « Verset du jour » et
// « Punchline du jour », aux couleurs de la charte (nuit / lime / crème).
// Ils lisent le flux quotidien publié sur le site (voir gen-widget-feed.mjs).
//
// À ajouter dans Xcode via un target « Widget Extension » (voir
// ios/WIDGETS-README.md).

import WidgetKit
import SwiftUI

// MARK: - Données

struct DayEntry: TimelineEntry {
    let date: Date
    let verseText: String
    let verseReference: String
    let punchline: String

    static let placeholder = DayEntry(
        date: Date(),
        verseText: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
        verseReference: "Psaume 119.105",
        punchline: "Sans la Parole, tu avances à l'aveugle. Allume la lampe."
    )
}

private struct Feed: Decodable {
    struct Day: Decodable {
        let date: String
        let verseText: String
        let verseReference: String
        let punchline: String
    }
    let days: [Day]
}

private func fetchEntry(_ completion: @escaping (DayEntry) -> Void) {
    guard let url = URL(string: "https://jackbrunet.com/widget/feed.json") else {
        completion(.placeholder); return
    }
    URLSession.shared.dataTask(with: url) { data, _, _ in
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        fmt.locale = Locale(identifier: "en_US_POSIX")
        let today = fmt.string(from: Date())
        if let data = data, let feed = try? JSONDecoder().decode(Feed.self, from: data) {
            let day = feed.days.first(where: { $0.date == today }) ?? feed.days.first
            if let d = day {
                completion(DayEntry(date: Date(), verseText: d.verseText,
                                    verseReference: d.verseReference, punchline: d.punchline))
                return
            }
        }
        completion(.placeholder)
    }.resume()
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> DayEntry { .placeholder }
    func getSnapshot(in context: Context, completion: @escaping (DayEntry) -> Void) {
        fetchEntry(completion)
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<DayEntry>) -> Void) {
        fetchEntry { entry in
            let next = Calendar.current.date(byAdding: .hour, value: 6, to: Date()) ?? Date().addingTimeInterval(21600)
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }
}

// MARK: - Charte

private extension Color {
    static let jbNight = Color(red: 20/255, green: 22/255, blue: 14/255)
    static let jbLime = Color(red: 202/255, green: 240/255, blue: 0/255)
    static let jbCream = Color(red: 243/255, green: 243/255, blue: 237/255)
}

@ViewBuilder
private func widgetBackground<T: View>(_ content: T) -> some View {
    if #available(iOS 17.0, *) {
        content.containerBackground(Color.jbNight, for: .widget)
    } else {
        content.background(Color.jbNight)
    }
}

// MARK: - Vues

struct VerseWidgetView: View {
    var entry: DayEntry
    var body: some View {
        widgetBackground(
            VStack(alignment: .leading, spacing: 6) {
                Text("VERSET DU JOUR")
                    .font(.system(size: 10, weight: .bold)).kerning(1.2).foregroundColor(.jbLime)
                Text("« \(entry.verseText) »")
                    .font(.system(size: 15)).foregroundColor(.jbCream).lineLimit(5)
                Spacer(minLength: 0)
                Text(entry.verseReference)
                    .font(.system(size: 12, weight: .bold)).foregroundColor(.jbLime)
            }
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        )
    }
}

struct PunchlineWidgetView: View {
    var entry: DayEntry
    var body: some View {
        widgetBackground(
            VStack(alignment: .leading, spacing: 6) {
                Text("PUNCHLINE DU JOUR")
                    .font(.system(size: 10, weight: .bold)).kerning(1.2).foregroundColor(.jbLime)
                Text(entry.punchline)
                    .font(.system(size: 17, weight: .bold)).foregroundColor(.jbCream).lineLimit(6)
                Spacer(minLength: 0)
            }
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        )
    }
}

// MARK: - Widgets

struct VerseWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "JackBrunetVerse", provider: Provider()) { entry in
            VerseWidgetView(entry: entry)
        }
        .configurationDisplayName("Verset du jour")
        .description("Le verset du jour de Jack Brunet.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct PunchlineWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "JackBrunetPunchline", provider: Provider()) { entry in
            PunchlineWidgetView(entry: entry)
        }
        .configurationDisplayName("Punchline du jour")
        .description("La punchline du jour de Jack Brunet.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct JackBrunetWidgetBundle: WidgetBundle {
    var body: some Widget {
        VerseWidget()
        PunchlineWidget()
    }
}
