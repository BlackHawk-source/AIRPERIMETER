import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RotateCw,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { PerimeterConfig, AIAnalysisResult } from '../types/perimeter';
import { calculatePerimeterSecurity } from '../utils/airportAnalyzer';

interface PolicyRiskReportProps {
  config: PerimeterConfig;
}

export const PolicyRiskReport: React.FC<PolicyRiskReportProps> = ({ config }) => {
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReport, setAiReport] = useState<AIAnalysisResult | null>(null);

  // Compute local baseline security analysis
  const localAnalysis = calculatePerimeterSecurity(config);
  const currentAnalysis = aiReport || localAnalysis;

  // Run Gemini deep analysis
  const handleRunAiAudit = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/analyze-perimeter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      if (data && data.analysis) {
        setAiReport(data.analysis);
      } else {
        // Fallback to local
        setAiReport(localAnalysis);
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err);
      setAiReport(localAnalysis);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const allIps = config.ingressRules.flatMap((r) => r.allowedIps).filter(Boolean);
  const allIdentities = config.ingressRules.flatMap((r) => r.identities).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Banner & Security Score Gauge */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel-accent border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Airport Perimeter Risk & Policy Audit
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
              Plain English Rules
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Translates complex GCP Access Context Manager constraints into clear, human-understandable airline security policies.
          </p>
        </div>

        {/* Score Card Badge */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-sky-500/30 shadow-lg shadow-sky-500/10">
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  currentAnalysis.securityScore >= 80
                    ? 'text-teal-400'
                    : currentAnalysis.securityScore >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                } transition-all duration-1000`}
                strokeDasharray={`${currentAnalysis.securityScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold text-white font-mono">
              {currentAnalysis.securityScore}%
            </span>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Security Rating
            </div>
            <div className="text-sm font-extrabold text-teal-300">
              {currentAnalysis.rating}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {config.enforcementMode === 'ENFORCED' ? 'Live Enforced' : 'Dry-Run Testing'}
            </div>
          </div>
        </div>
      </div>

      {/* Metaphor Narrative Box */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-sky-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold text-white">
              The Flight Metaphor Narrative
            </h4>
          </div>
          <button
            type="button"
            onClick={handleRunAiAudit}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-medium transition-all shadow-sm disabled:opacity-60"
          >
            {isLoadingAi ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isLoadingAi ? 'Scanning with Gemini...' : 'Run Gemini AI Deep-Scan'}</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 italic">
          "{currentAnalysis.metaphorNarrative}"
        </p>

        {/* Technical Summary */}
        <div className="text-xs text-slate-300 pt-1">
          <span className="font-semibold text-sky-300">Technical Overview: </span>
          {currentAnalysis.summary}
        </div>
      </div>

      {/* Plain English Rules Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingress Rules Translated */}
        <div className="p-5 rounded-2xl glass-panel border border-sky-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Who Can Enter the Terminal (Ingress)</span>
            </h4>
            <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded">
              {config.ingressRules.length} Gates Active
            </span>
          </div>

          <div className="space-y-2.5">
            {config.ingressRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1"
              >
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{rule.metaphorLabel || rule.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5.5">
                  {rule.description}
                </p>
                <div className="pl-5.5 pt-1 flex flex-wrap gap-1 text-[10px] font-mono text-sky-300">
                  {rule.allowedIps.map((ip) => (
                    <span key={ip} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      IP: {ip}
                    </span>
                  ))}
                  {rule.identities.map((id) => (
                    <span key={id} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[200px]">
                      ID: {id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Egress & Customs Rules Translated */}
        <div className="p-5 rounded-2xl glass-panel border border-sky-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Duty-Free Export Customs (Egress)</span>
            </h4>
            <span className="text-[11px] font-mono text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded">
              {config.egressRules.length} Channels
            </span>
          </div>

          {config.egressRules.length > 0 ? (
            <div className="space-y-2.5">
              {config.egressRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1"
                >
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{rule.metaphorLabel || rule.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5.5">
                    {rule.description}
                  </p>
                  <div className="pl-5.5 pt-1 text-[10px] font-mono text-emerald-300">
                    Destination Projects: {rule.targetProjects.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Data Exfiltration Policy</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All data stored in restricted services (BigQuery, Storage) is legally restricted to internal perimeter projects. Cargo check-in is safe and has no direct leakage pathways.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Strengths, Vulnerabilities & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="p-4.5 rounded-2xl glass-panel border border-emerald-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h5 className="text-xs font-bold uppercase tracking-wider">
              Perimeter Strengths
            </h5>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {currentAnalysis.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vulnerabilities / Gaps */}
        <div className="p-4.5 rounded-2xl glass-panel border border-amber-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h5 className="text-xs font-bold uppercase tracking-wider">
              Potential Vulnerabilities
            </h5>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {currentAnalysis.vulnerabilities.length > 0 ? (
              currentAnalysis.vulnerabilities.map((vuln, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 shrink-0 font-bold">!</span>
                  <span>{vuln}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">
                No major security gaps detected.
              </li>
            )}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-4.5 rounded-2xl glass-panel border border-sky-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-sky-300">
            <Lightbulb className="w-4 h-4 text-sky-400" />
            <h5 className="text-xs font-bold uppercase tracking-wider">
              Flight Plan Next Steps
            </h5>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {currentAnalysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-sky-400 shrink-0">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
