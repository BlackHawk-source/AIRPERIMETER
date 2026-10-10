import React, { useState } from 'react';
import {
  Plane,
  Shield,
  KeyRound,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose, isModal = false }) => {
  const {
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAsGuest,
    error,
    clearError
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in both email and password.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setLocalError('Flight security requires passwords to be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName || 'Chief Flight Architect');
      }
      if (onClose) onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      if (onClose) onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in was cancelled or blocked.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    clearError();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await loginAsGuest();
      if (onClose) onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Guest flight access failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn'
          : 'min-h-[80vh] flex items-center justify-center p-4'
      }
    >
      <div className="max-w-md w-full rounded-2xl glass-panel border border-sky-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative bg-[#090d16]/95">
        {/* Close Button if in Modal mode */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Branding Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-indigo-600 p-0.5 shadow-xl shadow-sky-500/20 mb-1">
            <div className="w-full h-full bg-[#0d1527] rounded-[14px] flex items-center justify-center relative">
              <Shield className="w-7 h-7 text-sky-400 absolute opacity-30" />
              <Plane className="w-6 h-6 text-sky-300 relative z-10 transform -rotate-45" />
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            AeroSC Flight Deck Access
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to synchronize custom VPC Service Controls architectures, access cloud blueprints, and publish to the Community Flight Roster.
          </p>
        </div>

        {/* Error Alert */}
        {(localError || error) && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{localError || error}</div>
          </div>
        )}

        {/* Social / Google Sign-In */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500/20 via-teal-500/20 to-sky-500/20 hover:from-sky-500/30 hover:via-teal-500/30 hover:to-sky-500/30 border border-sky-400/50 text-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md shadow-sky-500/10 active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google (Recommended)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#090d16] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider absolute">
            Or Use Pilot Passcode
          </span>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'signin'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'register'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Pass
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>Pilot Callsign / Display Name</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Captain Chen"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Architect Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pilot@airline.internal"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Passcode</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            <span>{mode === 'signin' ? 'Verify Credentials & Enter' : 'Issue Architect Pass'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Guest Access Alternative */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={isSubmitting}
            className="text-xs text-slate-400 hover:text-sky-300 font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Browse as Anonymous Guest Pilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
