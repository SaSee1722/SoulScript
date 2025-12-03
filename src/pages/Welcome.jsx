import React from 'react';
import { motion } from 'framer-motion';
import { BookHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-beige-100 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-64 h-64 bg-pastel-pink rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-pastel-blue rounded-full blur-3xl"></div>
            </div>

            <div
                className="z-10 flex flex-col items-center text-center p-8"
            >
                <div
                    className="mb-6 text-ink"
                >
                    <BookHeart size={80} strokeWidth={1.5} />
                </div>

                <h1 className="text-6xl font-handwriting text-ink mb-4 drop-shadow-sm">
                    SoulScript
                </h1>

                <p className="text-lg text-gray-600 font-light italic mb-12 max-w-md">
                    "Your life is a story. Write it well."
                </p>

                <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-ink text-cream rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                    Open Diary
                </button>
            </div>
        </div>
    );
};

export default Welcome;
