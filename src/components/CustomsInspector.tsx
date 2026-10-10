import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Sparkles,
  Upload,
  FileText,
  RotateCw,
  CheckCircle2,
  Wrench,
  AlertOctagon,
  ArrowRight,
  Plane,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { SAMPLE_LOGS } from '../data/sampleLogs';
import { LogTroubleshootResult, PerimeterConfig } from '../types/perimeter';
import { parseAndTroubleshootLog } from '../utils/airportAnalyzer';

interface CustomsInspectorProps {
  config: PerimeterConfig;
  onApplyFix: (fix: NonNullable<LogTroubleshootResult['fixPayload']>) => void;
}

export const CustomsInspector: React.FC<CustomsInspectorProps> = ({
  config,
  onApplyFix
}) => {
  const [rawLogInput, setRawLogInput] = useState<string>(SAMPLE_LOGS[0].rawJson);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_LOGS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<LogTroubleshootResult | null>(() =>
    parseAndTroubleshootLog(SAMPLE_LOGS[0].rawJson)
  );
  const [fixApplied, setFixApplied] = useState<boolean>(false);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);

  // Analyze log (local + Gemini AI if enabled)
  const handleDiagnose = async (logText: string) => {
    setIsAnalyzing(true);
    setFixApplied(false);

    // Immediate local parse
    const localResult = parseAndTroubleshootLog(logText);
    setDiagnosisResult(localResult);

    // Call server Gemini endpoint
    try {
      const res = await fetch('/api/troubleshoot-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawLog: logText })
      });
      const data = await res.json();
      if (data && data.result) {
        setDiagnosisResult(data.result);
      }
    } catch (e) {
      console.warn('AI troubleshoot fallback to local engine:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_LOGS[0]) => {
    setSelectedSampleId(sample.id);
    setRawLogInput(sample.rawJson);
    handleDiagnose(sample.rawJson);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setRawLogInput(content);
          handleDiagnose(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleApplyFixAction = () => {
    if (diagnosisResult?.fixPayload) {
      onApplyFix(diagnosisResult.fixPayload);
      setFixApplied(true);
    }
  };

  const handleCopyLog = () => {
    navigator.clipboard.writeText(rawLogInput);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel-accent border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              The Customs Inspector
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              VPC SC Log Troubleshooter
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Drop in raw Google Cloud audit or dry-run violation logs. We translate cryptic Code 7 errors into human airport checkpoint stories and offer one-click fixes.
          </p>
        </div>

        {/* Preset Sample Picker */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-sky-900/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2">
            Sample Logs:
          </span>
          {SAMPLE_LOGS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedSampleId === sample.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sample.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Log Input & Diagnosis Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw Log Input Zone (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Raw GCP Violation Log
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLog}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {copiedLog ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <label className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1 font-medium">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".json,.txt,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="relative flex-1 min-h-[340px]">
            <textarea
              value={rawLogInput}
              onChange={(e) => setRawLogInput(e.target.value)}
              placeholder="Paste raw Google Cloud VPC Service Controls audit log JSON here..."
              className="w-full h-full min-h-[340px] bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-[11px] font-mono text-sky-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 resize-none selection:bg-sky-500/30"
            />
          </div>

          <button
            type="button"
            onClick={() => handleDiagnose(rawLogInput)}
            disabled={isAnalyzing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-sky-500 hover:from-amber-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isAnalyzing ? 'Inspecting Baggage & Passes...' : 'Diagnose Violation Log'}</span>
          </button>
        </div>

        {/* Right: Diagnosis & Quick-Fix Action (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Inspection Report & Customs Verdict</span>
            </h4>
            {diagnosisResult && (
              <span className="text-[10px] font-mono text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded">
                {diagnosisResult.violationType}
              </span>
            )}
          </div>

          {diagnosisResult ? (
            <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-4 flex-1">
              {/* Metaphor Diagnosis Hero */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-rose-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-500/20 text-amber-300">
                    <Plane className="w-4 h-4 transform -rotate-45" />
                  </span>
                  <span className="text-xs font-extrabold text-amber-200 uppercase tracking-wider">
                    Airport Security Incident Narrative
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  "{diagnosisResult.airportMetaphorDiagnosis}"
                </p>
              </div>

              {/* Technical breakdown grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Traveler (Principal Identity)
                  </div>
                  <div className="font-mono text-sky-300 mt-0.5 truncate text-[11px]">
                    {diagnosisResult.principal}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Origin Network (Caller IP)
                  </div>
                  <div className="font-mono text-teal-300 mt-0.5 text-[11px]">
                    {diagnosisResult.callerIp}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Target Vault (GCP Service)
                  </div>
                  <div className="font-mono text-amber-300 mt-0.5 text-[11px]">
                    {diagnosisResult.serviceRequested}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Checkpoint Reason
                  </div>
                  <div className="font-mono text-rose-300 mt-0.5 text-[11px]">
                    {diagnosisResult.violationType}
                  </div>
                </div>
              </div>

              {/* Human Technical Explanation */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-300">
                  Why access was prohibited:
                </span>
                <p className="text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {diagnosisResult.humanExplanation}
                </p>
              </div>

              {/* Recommended Action & ONE-CLICK FIX BUTTON */}
              <div className="p-4 rounded-xl bg-sky-950/50 border border-sky-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-200">
                    Recommended Fix:
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosisResult.recommendedAction}
                </p>

                {diagnosisResult.fixPayload && (
                  <button
                    type="button"
                    onClick={handleApplyFixAction}
                    disabled={fixApplied}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      fixApplied
                        ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/50'
                        : 'bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white shadow-md shadow-sky-500/20 active:scale-95'
                    }`}
                  >
                    {fixApplied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Boarding Pass Added to Active Perimeter!</span>
                      </>
                    ) : (
                      <>
                        <Plane className="w-4 h-4 transform -rotate-45" />
                        <span>
                          One-Click Fix: Issue Boarding Pass (Add {diagnosisResult.fixPayload.ipToAdd || diagnosisResult.fixPayload.identityToAdd || 'Rule'})
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl glass-panel text-center text-slate-500 space-y-2 border border-slate-800">
              <AlertOctagon className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">
                No log analyzed yet. Select a sample above or paste a log on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
