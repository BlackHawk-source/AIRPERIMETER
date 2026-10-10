import React, { useEffect, useState } from 'react';
import {
  Globe,
  Star,
  Download,
  Trash2,
  RotateCw,
  Search,
  User,
  Calendar,
  Lock,
  Server,
  Plane,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  PublishedBlueprint,
  getPublishedPerimeters,
  starPublishedPerimeter,
  deletePublishedPerimeter
} from '../lib/firebase';
import { PerimeterConfig } from '../types/perimeter';
import { useAuth } from '../context/AuthContext';

interface CommunityRosterProps {
  onLoadBlueprint: (blueprint: PerimeterConfig) => void;
  onOpenPublish: () => void;
}

export const CommunityRoster: React.FC<CommunityRosterProps> = ({
  onLoadBlueprint,
  onOpenPublish
}) => {
  const { user } = useAuth();
  const [blueprints, setBlueprints] = useState<PublishedBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getPublishedPerimeters();
      setBlueprints(data);
    } catch (e) {
      console.warn('Failed to load published perimeters:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStar = async (id: string) => {
    if (starredIds[id]) return;
    setStarredIds((prev) => ({ ...prev, [id]: true }));
    setBlueprints((prev) =>
      prev.map((bp) => (bp.publishedId === id ? { ...bp, stars: (bp.stars || 0) + 1 } : bp))
    );
    await starPublishedPerimeter(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove your published architecture from the roster?')) return;
    try {
      await deletePublishedPerimeter(id);
      setBlueprints((prev) => prev.filter((bp) => bp.publishedId !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = blueprints.filter(
    (bp) =>
      bp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.restrictedServices?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel-accent border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <Globe className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Community Flight Roster
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
              Published VPC SC Blueprints
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Explore and clone real-world VPC Service Controls architectures published by cloud security architects worldwide.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition-colors"
            title="Refresh Roster"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onOpenPublish}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Publish Current Plan</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-sky-900/40">
        <Search className="w-4 h-4 text-slate-500 ml-1.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by architecture name, author, or service (e.g. bigquery, storage)..."
          className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-500 hover:text-slate-300 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Roster Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <RotateCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading flight roster from Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl glass-panel border border-slate-800 space-y-3 p-6">
          <Plane className="w-10 h-10 text-slate-600 mx-auto transform -rotate-45" />
          <h4 className="text-sm font-bold text-slate-300">
            No Published Architectures Found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first pilot to publish your VPC Service Controls perimeter to the community!
          </p>
          <button
            type="button"
            onClick={onOpenPublish}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors"
          >
            Publish Current Blueprint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bp) => {
            const isAuthor = user && user.uid === bp.authorId;
            return (
              <div
                key={bp.publishedId}
                className="rounded-2xl glass-panel border border-sky-500/20 p-5 flex flex-col justify-between space-y-4 hover:border-sky-400/50 transition-all shadow-lg group relative"
              >
                <div className="space-y-3">
                  {/* Card Header: Mode & Stars */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        bp.enforcementMode === 'ENFORCED'
                          ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {bp.enforcementMode === 'ENFORCED' ? '🔒 LIVE ENFORCED' : '🔍 DRY-RUN AUDIT'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStar(bp.publishedId)}
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-all ${
                        starredIds[bp.publishedId]
                          ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          starredIds[bp.publishedId] ? 'fill-current text-amber-400' : ''
                        }`}
                      />
                      <span className="font-mono">{bp.stars || 1}</span>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {bp.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {bp.description}
                    </p>
                  </div>

                  {/* Metaphor Metrics Chips */}
                  <div className="grid grid-cols-3 gap-2 py-1 border-y border-slate-800/80 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Terminals
                      </div>
                      <div className="text-xs font-mono font-bold text-teal-300">
                        {bp.projects?.length || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Vaults
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-300">
                        {bp.restrictedServices?.length || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Gates
                      </div>
                      <div className="text-xs font-mono font-bold text-sky-300">
                        {bp.ingressRules?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Author & Date metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400 truncate max-w-[150px]">
                      <User className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{bp.authorName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(bp.publishedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onLoadBlueprint(bp)}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-800/60 text-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Clone & Load Plan</span>
                  </button>

                  {isAuthor && (
                    <button
                      type="button"
                      onClick={() => handleDelete(bp.publishedId)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                      title="Delete your published blueprint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
