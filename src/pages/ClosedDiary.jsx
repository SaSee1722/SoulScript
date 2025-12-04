import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PinModal from '../components/PinModal';
import { BookHeart } from 'lucide-react';

const ClosedDiary = () => {
    const navigate = useNavigate();
    const [isOpening, setIsOpening] = useState(false);
    const [username, setUsername] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinMode, setPinMode] = useState('verify'); // 'setup' or 'verify'
    const [hasPin, setHasPin] = useState(false);

    useEffect(() => {
        fetchUser();
        checkPinStatus();
    }, []);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUsername(user.user_metadata?.full_name?.split(' ')[0] || 'MY');
        }
    };

    const checkPinStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('user_settings')
            .select('pin_code')
            .eq('user_id', user.id)
            .single();

        if (data?.pin_code) {
            setHasPin(true);
        } else {
            setHasPin(false);
        }
    };

    const handleDiaryClick = () => {
        if (hasPin) {
            setPinMode('verify');
            setShowPinModal(true);
        } else {
            // Optional: Force setup or just open? User said "they can make passwords"
            // Let's prompt setup if they want, or maybe just open. 
            // Better UX: Just open, but let them set it up inside? 
            // User request: "in the front page they can make passwords"
            // Let's prompt setup if none exists for security first approach.
            setPinMode('setup');
            setShowPinModal(true);
        }
    };

    const onPinSuccess = () => {
        setShowPinModal(false);
        setIsOpening(true);
        setTimeout(() => {
            navigate('/diary');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden perspective-1000">
            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSuccess={onPinSuccess}
                mode={pinMode}
            />

            <AnimatePresence>
                {!isOpening && (
                    <motion.div
                        key="closed-book"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{
                            rotateY: -180,
                            opacity: 0,
                            transition: { duration: 0.5 }
                        }}
                        whileHover={{ scale: 1.05, rotateY: -5 }}
                        className="cursor-pointer relative z-10 group perspective-1000"
                        style={{ transformOrigin: 'left center' }}
                        onClick={handleDiaryClick}
                    >
                        {/* Book Cover */}
                        <div className="w-96 h-[32rem] bg-black rounded-r-lg rounded-l-sm shadow-2xl relative preserve-3d transition-transform duration-500 border-l-4 border-gray-800">
                            {/* Leather Texture Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/20 rounded-r-lg pointer-events-none"></div>

                            {/* Spine Detail */}
                            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-900 to-black rounded-l-sm border-r border-gray-800"></div>

                            {/* Title */}
                            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center w-full px-8 flex flex-col items-center">
                                <BookHeart size={64} className="text-gold/80 mb-4 drop-shadow-md" strokeWidth={1.5} />
                                <div className="text-gold/80 font-handwriting text-5xl tracking-widest drop-shadow-md mb-2">
                                    {username}'s
                                </div>
                                <div className="text-gold font-serif text-6xl tracking-widest drop-shadow-lg border-t border-b border-gold/30 py-4 w-full">
                                    DIARY
                                </div>
                            </div>

                            {/* Decorative Corners */}
                            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-gold/30 rounded-tr-lg"></div>
                            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-gold/30 rounded-br-lg"></div>

                            {/* Hint Text */}
                            <div className="absolute bottom-12 w-full text-center">
                                <p className="text-white/30 text-sm font-light tracking-widest uppercase animate-pulse">
                                    {hasPin ? 'Tap to Unlock' : 'Tap to Open & Set PIN'}
                                </p>
                            </div>
                        </div>

                        {/* Pages Edge Effect */}
                        <div className="absolute top-2 right-0 w-4 h-[31rem] bg-[#FDFBF7] rounded-r-sm transform translate-x-3 -translate-y-1 z-[-1] border-l border-gray-300 shadow-sm"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Opening Animation Placeholder (Back Cover) */}
            {isOpening && (
                <motion.div
                    key="opening-book"
                    initial={{ rotateY: 0, scale: 1 }}
                    animate={{
                        rotateY: -120,
                        scale: 3,
                        opacity: 0
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={{ transformOrigin: 'left center' }}
                    className="w-96 h-[32rem] bg-black relative z-10"
                >
                    <div className="w-full h-full bg-[#FDFBF7] transform rotate-y-180 backface-hidden"></div>
                </motion.div>
            )}
        </div>
    );
};

export default ClosedDiary;
