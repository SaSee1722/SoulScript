import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Mic, Image as ImageIcon, Save, ChevronLeft, ChevronRight, Moon, Sun, LogOut, Play, Square, Trash2, Film, Volume2, X, Loader2, Pause, Lock, Unlock, Edit2, CloudUpload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { speakText } from '../lib/tts';
import PinModal from '../components/PinModal';
import Toast from '../components/Toast';
import { MOODS, SEASONAL_THEMES } from '../lib/constants';

const Diary = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date());
    const [content, setContent] = useState('');
    const [mood, setMood] = useState(MOODS[0]); // Default to first mood object
    const [isDark, setIsDark] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const [pageSide, setPageSide] = useState('right');
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [username, setUsername] = useState('My Diary');
    const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
    const [monthEntries, setMonthEntries] = useState({}); // { 'YYYY-MM-DD': moodObject }
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'entry'
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Toast State
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // Media State
    const [media, setMedia] = useState([]);
    const { isRecording, audioURL, audioBlob, startRecording, stopRecording, clearAudio } = useVoiceRecorder();
    const [playingAudio, setPlayingAudio] = useState(null);

    // Theme based on current month
    const currentTheme = SEASONAL_THEMES[date.getMonth()];

    // Fetch User & Month Data on Load/Date Change
    useEffect(() => {
        fetchUser();
        fetchMonthEntries();
    }, [date.getMonth(), date.getFullYear()]);

    // Fetch Entry on Date Change
    useEffect(() => {
        fetchEntry();
        return () => {
            if (window.audioPlayer) {
                window.audioPlayer.pause();
                window.audioPlayer = null;
            }
        };
    }, [date]);

    // Add recorded audio to media list
    useEffect(() => {
        if (audioURL && audioBlob) {
            const newAudio = {
                id: `temp-${Date.now()}`,
                url: audioURL,
                type: 'audio',
                blob: audioBlob,
                isNew: true
            };
            setMedia(prev => [...prev, newAudio]);
            clearAudio();
        }
    }, [audioURL, audioBlob]);

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUsername(user.user_metadata?.full_name || 'My Diary');
            if (user.user_metadata?.avatar_url) {
                setAvatarUrl(user.user_metadata.avatar_url);
            }
        }
    };

    const fetchMonthEntries = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('diary_entries')
            .select('date, mood')
            .eq('user_id', user.id)
            .gte('date', startOfMonth)
            .lte('date', endOfMonth);

        if (data) {
            const entries = {};
            data.forEach(entry => {
                // Find mood object from stored mood label/emoji or default
                // Assuming stored mood is the emoji or label. Let's try to match.
                const moodObj = MOODS.find(m => m.emoji === entry.mood || m.label === entry.mood) || MOODS[0];
                entries[entry.date] = moodObj;
            });
            setMonthEntries(entries);
        }
    };

    const fetchEntry = async () => {
        setIsLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data: entry, error } = await supabase
                .from('diary_entries')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', dateStr)
                .single();

            if (entry) {
                setContent(entry.text || '');
                const moodObj = MOODS.find(m => m.emoji === entry.mood || m.label === entry.mood) || MOODS[0];
                setMood(moodObj);

                const { data: mediaData } = await supabase
                    .from('diary_media')
                    .select('*')
                    .eq('entry_id', entry.id);

                if (mediaData) setMedia(mediaData);
            } else {
                setContent('');
                setMood(MOODS[0]);
                setMedia([]);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // Upsert Entry
            const { data: entry, error: entryError } = await supabase
                .from('diary_entries')
                .upsert({
                    user_id: user.id,
                    date: dateStr,
                    text: content,
                    mood: mood.label, // Store label or emoji. Let's store label for better readability, or emoji for backward compat? 
                    // Previous code stored emoji. Let's store emoji to be safe with existing data, 
                    // BUT user wants stickers. I'll store the emoji as the key, and map it back to sticker.
                    // Actually, let's store the emoji.
                    mood: mood.emoji,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, date' })
                .select()
                .single();

            if (entryError) throw entryError;

            // Upload Media
            const newMedia = media.filter(m => m.isNew);
            for (const item of newMedia) {
                let publicUrl = item.url;
                if (item.blob) {
                    const fileName = `${user.id}/${entry.id}/${Date.now()}-${item.type === 'audio' ? 'audio.webm' : 'image.jpg'}`;
                    const { error: uploadError } = await supabase.storage
                        .from('diary-media')
                        .upload(fileName, item.blob);
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl: url } } = supabase.storage
                        .from('diary-media')
                        .getPublicUrl(fileName);
                    publicUrl = url;
                }
                await supabase
                    .from('diary_media')
                    .insert({ entry_id: entry.id, url: publicUrl, type: item.type });
            }

            await fetchEntry();
            await fetchMonthEntries(); // Refresh calendar
            showToast('Diary saved successfully!', 'success');
        } catch (err) {
            console.error('Error saving:', err);
            showToast('Failed to save diary.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileName = `${user.id}/avatar-${Date.now()}`;
            const { error: uploadError } = await supabase.storage
                .from('diary-media')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('diary-media')
                .getPublicUrl(fileName);

            // Update Auth Metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            showToast('Profile picture updated!', 'success');
        } catch (err) {
            console.error('Error uploading avatar:', err);
            showToast('Failed to update profile picture.', 'error');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setMedia(prev => [...prev, {
                id: `temp-${Date.now()}`,
                url: imageUrl,
                type: 'image',
                blob: file,
                isNew: true
            }]);
        }
    };

    const handleDeleteMedia = async (item) => {
        if (item.isNew) {
            setMedia(prev => prev.filter(m => m.id !== item.id));
        } else {
            const { error } = await supabase.from('diary_media').delete().eq('id', item.id);
            if (!error) setMedia(prev => prev.filter(m => m.id !== item.id));
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const imageUrl = URL.createObjectURL(blob);
                setMedia(prev => [...prev, {
                    id: `temp-${Date.now()}`,
                    url: imageUrl,
                    type: 'image',
                    blob: blob,
                    isNew: true
                }]);
                e.preventDefault();
            }
        }
    };

    const handleDateChange = (newDate) => {
        if (isFlipping) return;
        const direction = newDate > date ? 'right' : 'left';
        setPageSide(direction);
        setIsFlipping(true);
        setTimeout(() => {
            setDate(newDate);
            setIsFlipping(false);
            if (isMobile) setViewMode('entry');
        }, 300);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleCloudBackup = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            showToast('Creating cloud backup...', 'success');

            const { data: entries, error } = await supabase
                .from('diary_entries')
                .select('*, diary_media(*)')
                .eq('user_id', user.id);

            if (error) throw error;

            const backupData = {
                user: user.email,
                backupDate: new Date().toISOString(),
                entries: entries
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const fileName = `${user.id}/backups/backup-${Date.now()}.json`;

            const { error: uploadError } = await supabase.storage
                .from('diary-media')
                .upload(fileName, blob, {
                    contentType: 'application/json',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            showToast('Backup saved to cloud successfully!', 'success');
        } catch (err) {
            console.error('Backup error:', err);
            showToast('Failed to create cloud backup.', 'error');
        }
    };

    const playAudio = (url) => {
        if (playingAudio === url) {
            window.audioPlayer.pause();
            setPlayingAudio(null);
        } else {
            if (window.audioPlayer) window.audioPlayer.pause();
            window.audioPlayer = new Audio(url);
            window.audioPlayer.onended = () => setPlayingAudio(null);
            window.audioPlayer.play();
            setPlayingAudio(url);
        }
    };

    const handleLockToggle = () => {
        if (isLocked) {
            setShowPinModal(true);
        } else {
            setIsLocked(true);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-1000 ${isDark ? 'bg-gray-950' : currentTheme.background}`}>
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSuccess={() => {
                    setIsLocked(false);
                    setShowPinModal(false);
                }}
                mode="verify"
            />


            {/* Controls */}
            <div className="absolute top-6 right-6 flex gap-4 z-50">
                <button
                    onClick={handleCloudBackup}
                    className={`p-3 rounded-full shadow-lg transition-all ${isDark ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-500'}`}
                    title="Backup to Cloud"
                >
                    <CloudUpload size={20} />
                </button>
                <button
                    onClick={handleLockToggle}
                    className={`p-3 rounded-full shadow-lg transition-all ${isLocked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}
                    title={isLocked ? "Unlock Diary" : "Lock Diary"}
                >
                    {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className={`p-3 rounded-full shadow-lg transition-all ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-600'}`}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={handleSignOut}
                    className={`p-3 rounded-full shadow-lg transition-all ${isDark ? 'bg-gray-800 text-red-400' : 'bg-white text-red-500'}`}
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Book Container */}
            <div className="relative w-full max-w-6xl md:aspect-[3/2] perspective-1000 h-[90dvh] md:h-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className={`relative w-full h-full flex flex-col md:flex-row shadow-book rounded-3xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-[#FDFBF7]'}`}
                >

                    {/* Left Page (Sidebar/Calendar) */}
                    <div className={`w-full md:w-1/2 h-full p-6 md:p-8 relative z-10 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-[#FDFBF7] text-ink'} border-b md:border-b-0 md:border-r border-gray-200/20 overflow-y-auto custom-scrollbar ${isMobile && viewMode === 'entry' ? 'hidden' : 'block'}`}>
                        {/* Seasonal Overlay */}
                        <div className={`absolute inset-0 pointer-events-none z-0 ${currentTheme.overlay} mix-blend-multiply`} />

                        <div className="h-full flex flex-col relative z-10">
                            {/* Profile Section */}
                            <div className="mb-6 md:mb-8 flex items-center gap-4">
                                <div className="relative group">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                                        <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm cursor-pointer hover:bg-gray-100 transition-colors">
                                        <Edit2 size={12} className="text-gray-600" />
                                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                    </label>
                                </div>
                                <div>
                                    <h3 className={`font-handwriting text-2xl md:text-3xl ${isDark ? 'text-white' : currentTheme.accent}`}>{username}</h3>
                                    <p className="text-xs opacity-60">Keep your memories alive</p>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div className="flex-1">
                                <div className={`rounded-xl p-4 md:p-6 mb-4 shadow-inner ${isDark ? 'bg-black/20' : 'bg-white/50 backdrop-blur-sm'}`}>
                                    <h4 className={`font-medium mb-4 md:mb-6 flex items-center gap-2 text-base md:text-lg ${isDark ? 'text-white' : currentTheme.accent}`}>
                                        <CalendarIcon size={18} />
                                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </h4>
                                    <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                            <div key={i} className="h-8 flex items-center justify-center">
                                                <span className="opacity-50 font-bold text-xs">{d}</span>
                                            </div>
                                        ))}

                                        {/* Empty cells for start of month */}
                                        {Array.from({ length: new Date(date.getFullYear(), date.getMonth(), 1).getDay() }).map((_, i) => (
                                            <div key={`empty-${i}`} />
                                        ))}

                                        {/* Days */}
                                        {Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                            const day = i + 1;
                                            const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
                                            const dateString = currentDate.toISOString().split('T')[0];
                                            const entryMood = monthEntries[dateString];
                                            const isSelected = date.getDate() === day;
                                            const isToday = new Date().toDateString() === currentDate.toDateString();

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleDateChange(currentDate)}
                                                    className={`relative h-8 md:h-10 w-full rounded-lg transition-all flex flex-col items-center justify-center
                                                        ${isSelected ? 'bg-white shadow-md ring-2 ring-offset-2 ring-gray-200 z-10' : 'hover:bg-gray-100'}
                                                        ${isToday && !isSelected ? 'bg-blue-50 text-blue-600' : ''}
                                                    `}
                                                >
                                                    <span className={`text-xs md:text-sm ${isSelected ? 'font-bold' : ''}`}>{day}</span>
                                                    {entryMood && (
                                                        <div className="absolute -bottom-1">
                                                            <img
                                                                src={entryMood.image}
                                                                alt={entryMood.label}
                                                                className="w-3 h-3 md:w-4 md:h-4"
                                                            />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-4">
                                <button
                                    onClick={() => navigate('/memories')}
                                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm font-medium ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <Film size={20} />
                                    <span>View Memories</span>
                                </button>

                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-white/60 border-yellow-100/50'}`}>
                                    <p className={`text-sm italic font-serif text-center opacity-80 ${isDark ? 'text-gray-300' : currentTheme.accent}`}>
                                        "The only way to do great work is to love what you do."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Page (Writing Area) */}
                    <div className={`w-full md:w-1/2 h-full relative z-20 ${isDark ? 'bg-gray-900' : 'bg-[#FDFBF7]'} perspective-1000 ${isMobile && viewMode === 'calendar' ? 'hidden' : 'block'}`}>
                        {/* Seasonal Overlay */}
                        <div className={`absolute inset-0 pointer-events-none z-0 ${currentTheme.overlay} mix-blend-multiply`} />

                        <AnimatePresence mode='wait'>
                            {!isFlipping && (
                                <motion.div
                                    key={date.toString()}
                                    initial={{ opacity: 0, rotateY: pageSide === 'right' ? -15 : 15 }}
                                    animate={{ opacity: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, rotateY: pageSide === 'right' ? 15 : -15 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-full p-6 md:p-8 flex flex-col relative origin-left z-10"
                                >
                                    {/* Date Header */}
                                    <div className={`flex justify-between items-end mb-4 md:mb-6 border-b-2 ${isDark ? 'border-gray-800' : 'border-gray-100'} pb-4`}>
                                        <div className="flex items-center gap-2">
                                            {isMobile && (
                                                <button
                                                    onClick={() => setViewMode('calendar')}
                                                    className="p-2 -ml-2 rounded-full hover:bg-gray-100/10"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                            )}
                                            <div>
                                                <h2 className={`text-3xl md:text-5xl font-handwriting mb-1 ${isDark ? 'text-white' : currentTheme.accent}`}>
                                                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                </h2>
                                                <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest font-medium">
                                                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 md:gap-3 items-center">
                                            {/* Mood Picker */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowMoodPicker(!showMoodPicker)}
                                                    className="hover:scale-110 transition-transform p-1 rounded-full hover:bg-gray-100"
                                                >
                                                    <img
                                                        src={mood.image}
                                                        alt={mood.label}
                                                        className="w-8 h-8 md:w-10 md:h-10 drop-shadow-sm"
                                                    />
                                                </button>
                                                {showMoodPicker && (
                                                    <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-2xl p-3 grid grid-cols-4 gap-2 z-50 w-64 border border-gray-100">
                                                        {MOODS.map(m => (
                                                            <button
                                                                key={m.label}
                                                                onClick={() => { setMood(m); setShowMoodPicker(false); }}
                                                                className="p-2 hover:bg-gray-50 rounded-xl transition-colors flex flex-col items-center gap-1"
                                                                title={m.label}
                                                            >
                                                                <img
                                                                    src={m.image}
                                                                    alt={m.label}
                                                                    className="w-8 h-8"
                                                                />
                                                                <span className="text-[10px] text-gray-500 font-medium">{m.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tools */}
                                            <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-100">
                                                <button
                                                    onClick={() => speakText(content)}
                                                    className="p-1.5 md:p-2 hover:bg-white rounded-full transition-all text-gray-500 hover:text-gray-800 hover:shadow-sm"
                                                    title="Read Aloud"
                                                >
                                                    <Volume2 size={16} className="md:w-[18px] md:h-[18px]" />
                                                </button>

                                                <button
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    className={`p-1.5 md:p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-md' : 'hover:bg-white text-gray-500 hover:text-red-500 hover:shadow-sm'}`}
                                                    title={isRecording ? "Stop Recording" : "Start Recording"}
                                                >
                                                    {isRecording ? <Square size={16} fill="currentColor" className="md:w-[18px] md:h-[18px]" /> : <Mic size={16} className="md:w-[18px] md:h-[18px]" />}
                                                </button>

                                                <label className="p-1.5 md:p-2 hover:bg-white rounded-full transition-all text-gray-500 hover:text-blue-500 hover:shadow-sm cursor-pointer">
                                                    <ImageIcon size={16} className="md:w-[18px] md:h-[18px]" />
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 relative overflow-y-auto pr-2 custom-scrollbar">
                                        {isLocked ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                <Lock size={48} className="mb-4 opacity-50" />
                                                <p className="font-handwriting text-2xl">This page is locked.</p>
                                                <button
                                                    onClick={() => setShowPinModal(true)}
                                                    className="mt-4 px-6 py-2 bg-ink text-white rounded-full text-sm hover:scale-105 transition-transform"
                                                >
                                                    Unlock to Read
                                                </button>
                                            </div>
                                        ) : isLoading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="animate-spin text-gray-400" size={32} />
                                            </div>
                                        ) : (
                                            <>
                                                <textarea
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    onPaste={handlePaste}
                                                    placeholder="Dear Diary..."
                                                    className={`w-full min-h-[50%] bg-transparent resize-none outline-none font-handwriting text-lg md:text-xl leading-[2.5rem] ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                                                    style={{
                                                        backgroundImage: isDark
                                                            ? 'linear-gradient(transparent 95%, rgba(255, 255, 255, 0.05) 95%)'
                                                            : 'linear-gradient(transparent 95%, #E5E7EB 95%)',
                                                        backgroundSize: '100% 2.5rem',
                                                        lineHeight: '2.5rem',
                                                        paddingTop: '0.2rem'
                                                    }}
                                                />

                                                {/* Media Stickers Area */}
                                                <div className="mt-6 flex flex-wrap gap-4 pb-20 md:pb-0">
                                                    {/* Audio Stickers */}
                                                    {media.filter(m => m.type === 'audio').map((item) => (
                                                        <div key={item.id} className="relative group">
                                                            <div
                                                                onClick={() => playAudio(item.url)}
                                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm cursor-pointer transition-all border ${playingAudio === item.url ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'}`}
                                                            >
                                                                <div className={`p-2 rounded-full ${playingAudio === item.url ? 'bg-green-200' : 'bg-gray-100'}`}>
                                                                    {playingAudio === item.url ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                                                </div>
                                                                <span className="text-sm font-medium">Voice Note</span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item); }}
                                                                className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* Image Stickers */}
                                                    {media.filter(m => m.type === 'image').length > 0 && (
                                                        <div className="w-full grid grid-cols-2 gap-4 mt-2">
                                                            {media.filter(m => m.type === 'image').map((item) => (
                                                                <div key={item.id} className="relative group aspect-video rounded-xl overflow-hidden shadow-md bg-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300 border-4 border-white">
                                                                    <img src={item.url} alt="Memory" className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={() => handleDeleteMedia(item)}
                                                                        className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm backdrop-blur-sm"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Save Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleSave}
                                        disabled={isSaving || isLocked}
                                        className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.button || 'bg-ink'} text-white z-50`}
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="md:w-6 md:h-6" />}
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/5 to-transparent pointer-events-none hidden md:block"></div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default Diary;
