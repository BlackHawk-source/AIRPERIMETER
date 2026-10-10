import React, { useState } from 'react';
import {
  Send,
  Plane,
  Shield,
  Sparkles,
  CheckCircle2,
  X,
  Globe,
  Lock,
  Layers
} from 'lucide-react';
import { PerimeterConfig } from '../types/perimeter';
import { useAuth } from '../context/AuthContext';
import { publishPerimeter } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface PublishModalProps {
  config: PerimeterConfig;
  onClose: () => void;
  onPublishedSuccess: (publishedId: string) => void;
  onOpenLogin: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  config,
  onClose,
  onPublishedSuccess,
  onOpenLogin
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(config.name);
  const [description, setDescription] = useState(config.description);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }

    setIsPublishing(true);
    setError(null);
    try {
      const configToPublish: PerimeterConfig = {
        ...config,
        name: title,
        description
      };
      const id = await publishPerimeter(user, configToPublish);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#0284c7', '#0d9488', '#f59e0b', '#38bdf8']
      });

      onPublishedSuccess(id);
      onClose();
    } catch (err: any) {
      console.error('Publish error:', err);
      setError(err.message || 'Failed to publish flight plan to community.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="max-w-lg w-full rounded-2xl glass-panel border border-sky-500/40 p-6 sm:p-7 space-y-5 relative bg-[#090d16]/95 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1527] rounded-[14px] flex items-center justify-center">
              <Globe className="w-5 h-5 text-teal-300" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Publish to Community Flight Roster
            </h3>
            <p className="text-xs text-slate-400">
              Share your VPC SC blueprint with fellow cloud architects.
            </p>
          </div>
        </div>

        {/* User state reminder */}
        {!user && (
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-3">
            <span>You need to be signed in to publish your flight architecture.</span>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-colors"
            >
              Sign In First
            </button>
          </div>
        )}

        {/* Architecture Snapshot Summary */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span>Flight Architecture Snapshot:</span>
            <span className="font-mono text-sky-300 text-[11px]">
              {config.enforcementMode}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Terminals
              </div>
              <div className="text-xs font-mono font-bold text-teal-300">
                {config.projects.length}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Vaults
              </div>
              <div className="text-xs font-mono font-bold text-amber-300">
                {config.restrictedServices.length}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Gates
              </div>
              <div className="text-xs font-mono font-bold text-sky-300">
                {config.ingressRules.length}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Blueprint Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The International Secure Cargo"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Description / Metaphor Notes
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what services are shielded and who is allowed to enter..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPublishing || !user}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing Flight Plan...' : 'Publish to Roster'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
