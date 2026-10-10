import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Shield,
  Plane,
  Info
} from 'lucide-react';
import { PerimeterConfig } from '../types/perimeter';
import { generateTerraformCode } from '../utils/terraformGenerator';

interface TerraformViewerProps {
  config: PerimeterConfig;
}

export const TerraformViewer: React.FC<TerraformViewerProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const tfCode = generateTerraformCode(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(tfCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([tfCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `aerosc_perimeter_${config.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.tf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel-accent border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <FileCode className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Flight Manifest & Infrastructure-as-Code
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Terraform HCL
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Production-ready Google Cloud Access Context Manager Terraform configuration. Ready to commit to your GitOps pipeline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-200 border border-sky-700/50 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-sky-400" />
                <span>Copy Flight Plan (Terraform)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download .tf File</span>
          </button>
        </div>
      </div>

      {/* Metaphor Mapping Cheat Sheet */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl glass-panel border border-sky-500/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Airport Boarding Pass
          </div>
          <div className="font-mono text-sky-300 font-semibold mt-0.5 text-[11px] truncate">
            google_access_level
          </div>
        </div>

        <div className="p-3 rounded-xl glass-panel border border-teal-500/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Terminal Fence
          </div>
          <div className="font-mono text-teal-300 font-semibold mt-0.5 text-[11px] truncate">
            service_perimeter
          </div>
        </div>

        <div className="p-3 rounded-xl glass-panel border border-amber-500/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Terminal Checkpoint Gate
          </div>
          <div className="font-mono text-amber-300 font-semibold mt-0.5 text-[11px] truncate">
            ingress_policies
          </div>
        </div>

        <div className="p-3 rounded-xl glass-panel border border-emerald-500/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Customs Export Gate
          </div>
          <div className="font-mono text-emerald-300 font-semibold mt-0.5 text-[11px] truncate">
            egress_policies
          </div>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">
              main.tf — Google Access Context Manager
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {tfCode.split('\n').length} lines
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-[#070b14] overflow-x-auto max-h-[600px] overflow-y-auto">
          <pre className="font-mono text-xs text-sky-200/90 leading-relaxed selection:bg-sky-500/30">
            <code>{tfCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
