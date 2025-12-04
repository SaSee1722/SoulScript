import { useState, useRef } from 'react';

const useVoiceRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/aac',
                '' // Default
            ];

            let options = undefined;
            for (const type of mimeTypes) {
                if (type === '' || MediaRecorder.isTypeSupported(type)) {
                    options = type ? { mimeType: type } : undefined;
                    break;
                }
            }

            mediaRecorderRef.current = new MediaRecorder(stream, options);

            const chunks = [];
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: options?.mimeType || 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const clearAudio = () => {
        setAudioURL(null);
        setAudioBlob(null);
    };

    return {
        isRecording,
        audioURL,
        audioBlob,
        startRecording,
        stopRecording,
        clearAudio,
        setAudioURL,
        setAudioBlob
    };
};

export default useVoiceRecorder;
