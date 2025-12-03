import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PinModal = ({ isOpen, onClose, onSuccess, mode = 'verify' }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState(mode === 'setup' ? 'create' : 'verify'); // create, confirm, verify
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            setError('');
            setStep(mode === 'setup' ? 'create' : 'verify');
        }
    }, [isOpen, mode]);

    const handleDigit = (digit) => {
        setError('');
        const currentPin = step === 'confirm' ? confirmPin : pin;
        const setCurrentPin = step === 'confirm' ? setConfirmPin : setPin;

        const firstEmptyIndex = currentPin.findIndex(d => d === '');
        if (firstEmptyIndex !== -1) {
            const newPin = [...currentPin];
            newPin[firstEmptyIndex] = digit;
            setCurrentPin(newPin);

            // Check if complete
            if (firstEmptyIndex === 3) {
                handleComplete(newPin.join(''));
            }
        }
    };

    const handleBackspace = () => {
        setError('');
        const currentPin = step === 'confirm' ? confirmPin : pin;
        const setCurrentPin = step === 'confirm' ? setConfirmPin : setPin;

        const lastFilledIndex = [...currentPin].reverse().findIndex(d => d !== '');
        if (lastFilledIndex !== -1) {
            const realIndex = 3 - lastFilledIndex;
            const newPin = [...currentPin];
            newPin[realIndex] = '';
            setCurrentPin(newPin);
        }
    };

    const handleComplete = async (enteredPin) => {
        if (step === 'create') {
            setTimeout(() => {
                setStep('confirm');
            }, 300);
        } else if (step === 'confirm') {
            if (enteredPin === pin.join('')) {
                await savePin(enteredPin);
            } else {
                setError("PINs don't match. Try again.");
                setConfirmPin(['', '', '', '']);
                setPin(['', '', '', '']);
                setStep('create');
            }
        } else if (step === 'verify') {
            await verifyPin(enteredPin);
        }
    };

    const savePin = async (newPin) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const { error } = await supabase
                .from('user_settings')
                .upsert({ user_id: user.id, pin_code: newPin });

            if (error) throw error;
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Failed to save PIN');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyPin = async (enteredPin) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const { data, error } = await supabase
                .from('user_settings')
                .select('pin_code')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (data.pin_code === enteredPin) {
                onSuccess();
            } else {
                setError('Incorrect PIN');
                setPin(['', '', '', '']);
            }
        } catch (err) {
            console.error(err);
            setError('Error verifying PIN');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {step === 'create' && 'Create New PIN'}
                        {step === 'confirm' && 'Confirm PIN'}
                        {step === 'verify' && 'Enter PIN to Unlock'}
                    </h3>
                    {mode === 'verify' && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="p-8 flex flex-col items-center">
                    <div className="mb-8 flex gap-4">
                        {(step === 'confirm' ? confirmPin : pin).map((digit, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full border-2 transition-all ${digit ? 'bg-ink border-ink scale-110' : 'border-gray-300 bg-transparent'}`}
                            />
                        ))}
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4 animate-pulse">{error}</p>}
                    {isLoading && <Loader2 className="animate-spin text-ink mb-4" />}

                    <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handleDigit(num.toString())}
                                className="w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-medium text-gray-700 transition-colors"
                            >
                                {num}
                            </button>
                        ))}
                        <div />
                        <button
                            onClick={() => handleDigit('0')}
                            className="w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-medium text-gray-700 transition-colors"
                        >
                            0
                        </button>
                        <button
                            onClick={handleBackspace}
                            className="w-16 h-16 rounded-full hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                        >
                            ⌫
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PinModal;
