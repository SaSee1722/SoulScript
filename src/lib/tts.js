export const speakText = (text) => {
    // Cancel if already speaking
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        // If we just cancelled, give it a moment to clear before speaking again
        setTimeout(() => speak(text), 100);
    } else {
        speak(text);
    }
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

    // Ensure voices are loaded
    let voice = selectVoice();
    if (!voice) {
        // If voices aren't loaded yet, wait for the event
        window.speechSynthesis.onvoiceschanged = () => {
            voice = selectVoice();
            if (voice) {
                utterance.voice = voice;
                // Adjust rate/pitch slightly for better naturalness if needed
                utterance.rate = 0.9; // Slightly slower is often clearer for non-native TTS
                utterance.pitch = 1;
                window.speechSynthesis.speak(utterance);
            }
        };
        // If they never load (some browsers), we might just let it use default
    } else {
        utterance.voice = voice;
        // Adjust rate/pitch slightly for better naturalness if needed
        utterance.rate = 0.9; // Slightly slower is often clearer for non-native TTS
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
};
