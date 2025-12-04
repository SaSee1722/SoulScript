export const speakText = (text) => {
    // Always cancel previous speech to ensure new text is spoken
    window.speechSynthesis.cancel();

    // Small delay to ensure cancellation takes effect
    setTimeout(() => speak(text), 50);
};

const speak = (text) => {
    if (!text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Simple voice selection
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        // Try to find a voice matching the text language, or default to English
        const isTamil = /[\u0B80-\u0BFF]/.test(text);
        const isHindi = /[\u0900-\u097F]/.test(text);
        let targetLang = 'en-US';
        if (isTamil) targetLang = 'ta';
        if (isHindi) targetLang = 'hi';

        const voice = voices.find(v => v.lang.startsWith(targetLang)) || voices[0];
        if (voice) utterance.voice = voice;
    }

    utterance.onerror = (e) => console.error("TTS Error:", e);

    // Small timeout to ensure cancel completes
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 50);
};
