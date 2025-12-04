import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Play, Pause, Loader2, Volume2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { speakText } from '../lib/tts';

const Memories = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch all media of type image, joined with entry details
            // Since we can't easily do a deep filter on the parent in one go without a view,
            // we'll fetch media and then the related entries, or use the relational query if setup.
            // Let's try the relational query assuming foreign keys are detected by PostgREST.

            const { data, error } = await supabase
                .from('diary_media')
                .select(`
                    *,
                    diary_entries (
                        date,
                        text,
                        mood
                    )
                `)
                .eq('type', 'image')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter out any media where entry might be null (if RLS hides it or deleted)
            const validMemories = data
                .filter(item => item.diary_entries)
                .map(item => ({
                    id: item.id,
                    image: item.url,
                    date: item.diary_entries.date,
                    text: item.diary_entries.text,
                    mood: item.diary_entries.mood
                }));

            setMemories(validMemories);
        } catch (err) {
            console.error('Error fetching memories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (isPlaying && memories.length > 0) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % memories.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, memories.length]);

    const nextSlide = () => {
        if (memories.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % memories.length);
    };

    const prevSlide = () => {
        if (memories.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={48} />
            </div>
        );
    }

    if (memories.length === 0) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white p-8">
                <h2 className="text-3xl font-handwriting mb-4">No Memories Yet</h2>
                <p className="text-gray-400 mb-8 text-center max-w-md">
                    Start writing in your diary and adding photos to see them appear here as beautiful memories.
                </p>
                <button
                    onClick={() => navigate('/diary')}
                    className="px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform"
                >
                    Go to Diary
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black relative overflow-hidden flex items-center justify-center">
            {/* Background Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 transition-all duration-1000"
                style={{ backgroundImage: `url(${memories[currentIndex].image})` }}
            />

            {/* Close Button */}
            <button
                onClick={() => navigate('/diary')}
                className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            >
                <X size={24} />
            </button>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
                <button onClick={prevSlide} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button onClick={nextSlide} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl px-8 flex flex-col md:flex-row items-center gap-12">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="w-full md:w-1/2 aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden shadow-2xl relative"
                    >
                        <img
                            src={memories[currentIndex].image}
                            alt="Memory"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 text-4xl drop-shadow-lg">
                            {memories[currentIndex].mood}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={`text-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-1/2 text-white"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-5xl font-handwriting text-yellow-100">
                                {new Date(memories[currentIndex].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </h2>
                            {!window.Capacitor?.isNativePlatform() && (
                                <button
                                    onClick={() => speakText(memories[currentIndex].text)}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                                    title="Read Aloud"
                                >
                                    <Volume2 size={24} />
                                </button>
                            )}
                        </div>
                        <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90 italic">
                            "{memories[currentIndex].text}"
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Memories;
