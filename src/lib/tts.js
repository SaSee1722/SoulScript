export const speakText = (text) => {
    // Always cancel previous speech to ensure new text is spoken
    window.speechSynthesis.cancel();

    // Small delay to ensure cancellation takes effect
    setTimeout(() => speak(text), 50);
};

const speak = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Language Detection Logic
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    const isHindi = /[\u0900-\u097F]/.test(text);

    let lang = 'en-US'; // Default

    if (isTamil) {
        lang = 'ta-IN';
    } else if (isHindi) {
        lang = 'hi-IN';
    } else {
        lang = 'en-IN';
    }

    utterance.lang = lang;

    // Helper to select voice
    const selectVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return null;

        // 1. Try exact match
        let voice = voices.find(v => v.lang === lang);

        // 2. Try match by language code only
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        }

        // 3. Fallback for English
        if (!voice && lang === 'en-IN') {
            voice = voices.find(v => v.lang === 'en-US');
        }

        return voice;
    };

    const doSpeak = () => {
        const voice = selectVoice();
        if (voice) {
            utterance.voice = voice;
        }
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
        };

        window.speechSynthesis.speak(utterance);
    };

    // Ensure voices are loaded
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            doSpeak();
            window.speechSynthesis.onvoiceschanged = null; // Cleanup
        };
    } else {
        doSpeak();
    }
};
