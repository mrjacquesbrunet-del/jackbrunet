import AVFoundation
import Capacitor

// RHEMA — version corrigée du module @capacitor-community/text-to-speech
// (copiée par scripts/patch-natif.mjs après chaque npm install) :
//  - catégorie « playback » : la voix continue écran verrouillé / app en
//    arrière-plan (le module d'origine ignorait ce réglage) ;
//  - chaque énoncé garde SON appel : on peut mettre tout un chapitre en file
//    (lecture continue sans JavaScript), et l'arrêt libère toute la file.

enum QUEUE_STRATEGY: Int {
    case QUEUE_ADD = 1, QUEUE_FLUSH = 0
}

@objc public class TextToSpeech: NSObject, AVSpeechSynthesizerDelegate {
    let synthesizer = AVSpeechSynthesizer()
    var calls: [ObjectIdentifier: CAPPluginCall] = [:]

    override init() {
        super.init()
        self.synthesizer.usesApplicationAudioSession = false
        self.synthesizer.delegate = self
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        self.resolve(utterance)
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        self.resolve(utterance)
    }

    @objc public func speak(_ text: String, _ lang: String, _ rate: Float, _ pitch: Float, _ category: String, _ volume: Float, _ voice: Int, _ queueStrategy: Int, _ call: CAPPluginCall) throws {
        if category == "playback" {
            let session = AVAudioSession.sharedInstance()
            try? session.setCategory(.playback, mode: .spokenAudio, options: [])
            try? session.setActive(true)
            self.synthesizer.usesApplicationAudioSession = true
        }
        if queueStrategy == QUEUE_STRATEGY.QUEUE_FLUSH.rawValue {
            self.stop()
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: lang)
        utterance.rate = adjustRate(rate)
        utterance.pitchMultiplier = pitch
        utterance.volume = volume

        // Find the voice associated with the voice parameter if a voice specified.
        // If the specified voice is not available we will fall back to default voice rather than raising an error.
        if voice >= 0 {
            let allVoices = AVSpeechSynthesisVoice.speechVoices()
            if voice < allVoices.count {
                utterance.voice = allVoices[voice]
            }
        }

        self.calls[ObjectIdentifier(utterance)] = call
        synthesizer.speak(utterance)
    }

    @objc public func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        // Les énoncés encore en file ne reçoivent pas tous « didCancel » :
        // on libère leurs appels pour que rien ne reste en attente.
        let restants = Array(self.calls.values)
        self.calls.removeAll()
        restants.forEach { $0.resolve() }
    }

    @objc public func getSupportedLanguages() -> [String] {
        return Array(AVSpeechSynthesisVoice.speechVoices().map {
            return $0.language
        })
    }

    @objc public func isLanguageSupported(_ lang: String) -> Bool {
        let voice = AVSpeechSynthesisVoice(language: lang)
        return voice != nil
    }

    // Adjust rate for a closer match to other platform.
    @objc private func adjustRate(_ rate: Float) -> Float {
        let baseRate: Float = AVSpeechUtteranceDefaultSpeechRate
        if rate >= 1.0 {
            return (0.1 * rate) + (baseRate - 0.1)
        }
        return rate * baseRate
    }

    private func resolve(_ utterance: AVSpeechUtterance) {
        if let call = self.calls.removeValue(forKey: ObjectIdentifier(utterance)) {
            call.resolve()
        }
    }
}
