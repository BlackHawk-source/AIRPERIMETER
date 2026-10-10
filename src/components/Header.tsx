import React from 'react';
import {
  Plane,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  PlusCircle,
  Save,
  Check
} from 'lucide-react';
import { PerimeterConfig } from '../types/perimeter';
import { TEMPLATES } from '../data/templates';

interface HeaderProps {
  currentConfig: PerimeterConfig;
  onSelectTemplate: (template: PerimeterConfig) => void;
  onSaveToStorage: () => void;
  onResetTemplate: () => void;
  onNewBlank: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleEnforcement: () => void;
  savedNotification: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentConfig,
  onSelectTemplate,
  onSaveToStorage,
  onResetTemplate,
  onNewBlank,
  onExportJson,
  onImportJson,
  onToggleEnforcement,
  savedNotification
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isEnforced = currentConfig.enforcementMode === 'ENFORCED';

  return (
    <header className="border-b border-sky-900/30 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#0d1527] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <Shield className="w-6 h-6 text-sky-400 absolute opacity-30" />
              <Plane className="w-5 h-5 text-sky-300 relative z-10 transform -rotate-45 translate-x-0.5 -translate-y-0.5" />
            </div>
            {/* Pulsing beacon light */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>AeroSC</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  VPC Architect
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Airport Security Metaphor for Google Cloud VPC Service Controls
            </p>
          </div>
        </div>

        {/* Center: Health & Status Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={onToggleEnforcement}
            title="Click to toggle between Live Enforced & Dry-Run Audit Mode"
            className={`cursor-pointer px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-2 transition-all shadow-sm ${
              isEnforced
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-400'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40 hover:border-amber-400'
            }`}
          >
            {isEnforced ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Perimeter: Secure & Live ✈️</span>
                <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.2 rounded font-semibold text-emerald-200">
                  Enforced
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Perimeter: Dry-Run Audit 🔍</span>
                <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 px-1.5 py-0.2 rounded font-semibold text-amber-200">
                  Audit Only
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Template Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
          {/* Active Template Selector */}
          <div className="relative">
            <select
              value={currentConfig.id}
              onChange={(e) => {
                const found = TEMPLATES.find((t) => t.id === e.target.value);
                if (found) onSelectTemplate(found);
              }}
              className="appearance-none bg-slate-900/90 text-xs font-medium text-slate-200 border border-sky-800/40 rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer shadow-inner hover:border-sky-700/60 transition-colors"
            >
              <optgroup label="Flight Manifest Templates">
                {TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    🛫 {tmpl.name}
                  </option>
                ))}
              </optgroup>
              {!TEMPLATES.some((t) => t.id === currentConfig.id) && (
                <option value={currentConfig.id}>Custom Perimeter Plan</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Save to LocalStorage */}
          <button
            onClick={onSaveToStorage}
            title="Save Flight Plan to browser storage"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-200 border border-sky-800/50 text-xs font-medium transition-all shadow-sm"
          >
            {savedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </button>

          {/* Reset Template */}
          <button
            onClick={onResetTemplate}
            title="Reset to default template values"
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportJson}
            title="Export architecture JSON"
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import JSON hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportJson}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import architecture JSON"
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* New Blank Plan */}
          <button
            onClick={onNewBlank}
            title="Create blank blueprint"
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
