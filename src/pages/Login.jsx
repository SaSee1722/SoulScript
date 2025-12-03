import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                navigate('/closed-diary');
            } else {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        },
                    },
                });
                if (error) throw error;
                // For now, auto login or show success message
                navigate('/closed-diary');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-beige-100 p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-pastel-green rounded-full blur-3xl"></div>
                <div className="absolute top-10 right-10 w-80 h-80 bg-pastel-lavender rounded-full blur-3xl"></div>
            </div>

            <div
                className="bg-cream w-full max-w-md p-8 rounded-2xl shadow-book relative z-10 border border-white/50"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-handwriting text-ink mb-2">
                        {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isLogin ? 'Continue writing your story.' : 'Create your personal sanctuary.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-beige-100 rounded-xl border-none focus:ring-2 focus:ring-pastel-blue/50 outline-none transition-all"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-beige-100 rounded-xl border-none focus:ring-2 focus:ring-pastel-blue/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-beige-100 rounded-xl border-none focus:ring-2 focus:ring-pastel-blue/50 outline-none transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-ink text-cream rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-gray-400 text-sm">OR</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                </div>

                <button
                    onClick={async () => {
                        try {
                            const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
                            const redirectTo = isNative
                                ? 'com.soulscript.app://closed-diary'
                                : window.location.origin + '/closed-diary';

                            const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: redirectTo
                                }
                            });
                            if (error) throw error;
                        } catch (err) {
                            setError(err.message);
                        }
                    }}
                    className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                </button>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-gray-500 hover:text-ink text-sm font-medium transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
