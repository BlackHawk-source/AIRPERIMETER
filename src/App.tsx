/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Map,
  FileText,
  ShieldAlert,
  FileCode,
  Plane,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { PerimeterConfig, LogTroubleshootResult } from './types/perimeter';
import { TEMPLATES } from './data/templates';
import { Header } from './components/Header';
import { FlightPlanner } from './components/FlightPlanner';
import { AirportBlueprint } from './components/AirportBlueprint';
import { PolicyRiskReport } from './components/PolicyRiskReport';
import { CustomsInspector } from './components/CustomsInspector';
import { TerraformViewer } from './components/TerraformViewer';

const STORAGE_KEY = 'aerosc_active_perimeter_v1';

export default function App() {
  // Load initial config from LocalStorage or fallback to template 0
  const [config, setConfig] = useState<PerimeterConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return TEMPLATES[0];
  });

  const [activeTab, setActiveTab] = useState<'blueprint' | 'policies' | 'inspector' | 'terraform'>('blueprint');
  const [isActivating, setIsActivating] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMetaphorGuide, setShowMetaphorGuide] = useState(false);

  // Auto-save to LocalStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to auto-save:', e);
    }
  }, [config]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch Template
  const handleSelectTemplate = (template: PerimeterConfig) => {
    setConfig(template);
    showToast(`Switched flight plan to "${template.name}"`);
  };

  // Reset to original template
  const handleResetTemplate = () => {
    const original = TEMPLATES.find((t) => t.id === config.id) || TEMPLATES[0];
    setConfig(original);
    showToast(`Reset to default "${original.name}" specifications`);
  };

  // New Blank Blueprint
  const handleNewBlank = () => {
    const blank: PerimeterConfig = {
      id: `custom-${Date.now().toString(36)}`,
      name: 'Custom Airfield Perimeter',
      title: 'Custom Airfield Security Perimeter',
      description: 'Custom perimeter configured from scratch.',
      accessPolicyId: '849201934812',
      perimeterType: 'REGULAR',
      enforcementMode: 'ENFORCED',
      projects: ['my-flight-project-01'],
      restrictedServices: ['bigquery.googleapis.com'],
      ingressRules: [
        {
          id: 'ing-init',
          name: 'Main Terminal Entrance',
          metaphorLabel: 'North Terminal Turnstile',
          identityType: 'ANY_IDENTITY',
          identities: [],
          allowedIps: ['198.51.100.0/24'],
          description: 'Initial entry point for corporate staff.'
        }
      ],
      egressRules: []
    };
    setConfig(blank);
    showToast('Created new blank perimeter plan');
  };

  // Explicit Save
  const handleSaveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSavedNotification(true);
      showToast('Flight plan successfully saved to browser storage!');
      setTimeout(() => setSavedNotification(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aerosc_${config.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Downloaded flight blueprint JSON file');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.name && Array.isArray(imported.projects)) {
            setConfig(imported);
            showToast(`Imported flight blueprint "${imported.name}"`);
          } else {
            showToast('Invalid blueprint JSON format');
          }
        } catch {
          showToast('Failed to parse blueprint JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  // Toggle Enforced / Dry-Run
  const handleToggleEnforcement = () => {
    const newMode = config.enforcementMode === 'ENFORCED' ? 'DRY_RUN' : 'ENFORCED';
    setConfig({ ...config, enforcementMode: newMode });
    showToast(
      newMode === 'ENFORCED'
        ? 'Switched to LIVE ENFORCED mode (blocking unapproved traffic)'
        : 'Switched to DRY-RUN mode (logging simulated violations)'
    );
  };

  // Activate Service Perimeter
  const handleActivatePerimeter = () => {
    setIsActivating(true);

    // Trigger upbeat celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#0284c7', '#0d9488', '#38bdf8', '#f59e0b', '#10b981']
    });

    setTimeout(() => {
      setIsActivating(false);
      showToast('✈️ Perimeter Activated! Airport Security Checkpoints Guarded.');
    }, 1200);
  };

  // Apply fix from Customs Inspector
  const handleApplyFix = (fix: NonNullable<LogTroubleshootResult['fixPayload']>) => {
    let updatedGates = [...config.ingressRules];

    if (fix.ipToAdd) {
      if (updatedGates.length > 0) {
        updatedGates[0] = {
          ...updatedGates[0],
          allowedIps: Array.from(new Set([...updatedGates[0].allowedIps, fix.ipToAdd]))
        };
      } else {
        updatedGates.push({
          id: `ing-${Date.now()}`,
          name: 'Troubleshoot Rescue Gate',
          metaphorLabel: 'Customs Emergency Entry Pass',
          identityType: 'ANY_IDENTITY',
          identities: [],
          allowedIps: [fix.ipToAdd],
          description: `Auto-generated gate to admit ${fix.ipToAdd}`
        });
      }
    }

    if (fix.identityToAdd) {
      if (updatedGates.length > 0) {
        updatedGates[0] = {
          ...updatedGates[0],
          identities: Array.from(new Set([...updatedGates[0].identities, fix.identityToAdd]))
        };
      }
    }

    let updatedServices = config.restrictedServices;
    if (fix.serviceToAdd && !config.restrictedServices.includes(fix.serviceToAdd)) {
      updatedServices = [...updatedServices, fix.serviceToAdd];
    }

    setConfig({
      ...config,
      ingressRules: updatedGates,
      restrictedServices: updatedServices
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8']
    });

    showToast(`Quick-Fix Applied: Boarding pass granted to ${fix.ipToAdd || fix.identityToAdd}!`);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        currentConfig={config}
        onSelectTemplate={handleSelectTemplate}
        onSaveToStorage={handleSaveToStorage}
        onResetTemplate={handleResetTemplate}
        onNewBlank={handleNewBlank}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onToggleEnforcement={handleToggleEnforcement}
        savedNotification={savedNotification}
      />

      {/* Main Split-Panel Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1720px] w-full mx-auto">
        {/* ===================================================================== */}
        {/* LEFT PANEL: The Flight Planner */}
        {/* ===================================================================== */}
        <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 border-b lg:border-b-0 lg:border-r border-sky-900/30">
          <FlightPlanner
            config={config}
            onChangeConfig={setConfig}
            onActivatePerimeter={handleActivatePerimeter}
            isActivating={isActivating}
          />
        </div>

        {/* ===================================================================== */}
        {/* RIGHT PANEL: Visualization Canvas & Policy Details */}
        {/* ===================================================================== */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#090d16] via-[#0b101e] to-[#090d16]">
          {/* Tabs Navigation Bar */}
          <div className="px-4 sm:px-8 pt-5 pb-3 border-b border-sky-900/30 flex items-center justify-between flex-wrap gap-3 bg-[#090d16]/60 backdrop-blur sticky top-0 z-30">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('blueprint')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'blueprint'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Map className="w-4 h-4 text-sky-400" />
                <span>Security Blueprint (Map)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('policies')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'policies'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Plain English Policies</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inspector')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'inspector'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>The Customs Inspector</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terraform')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'terraform'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>Terraform Flight Manifest</span>
              </button>
            </div>

            {/* Metaphor Guide Helper Pill */}
            <button
              type="button"
              onClick={() => setShowMetaphorGuide(true)}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/50 hover:bg-sky-900/50 border border-sky-800/60 transition-colors shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Airport Metaphor Guide</span>
            </button>
          </div>

          {/* Active Tab Viewport */}
          <div className="p-4 sm:p-8 flex-1">
            {activeTab === 'blueprint' && <AirportBlueprint config={config} />}
            {activeTab === 'policies' && <PolicyRiskReport config={config} />}
            {activeTab === 'inspector' && (
              <CustomsInspector config={config} onApplyFix={handleApplyFix} />
            )}
            {activeTab === 'terraform' && <TerraformViewer config={config} />}
          </div>
        </div>
      </div>

      {/* Airport Metaphor Guide Modal */}
      {showMetaphorGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-2xl w-full rounded-2xl glass-panel border border-sky-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <Plane className="w-5 h-5 transform -rotate-45" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    The Airport Security Metaphor
                  </h3>
                  <p className="text-xs text-slate-400">
                    How Google Cloud VPC Service Controls map to international air travel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMetaphorGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-sky-500/20 space-y-1">
                <div className="font-bold text-sky-300">
                  🔒 The Vault / Aircraft
                </div>
                <div className="text-[11px] text-slate-300 font-semibold">
                  Restricted GCP Services (BigQuery, Storage, Vertex AI)
                </div>
                <p className="text-[11px] text-slate-400">
                  Valuable passenger records and cargo held safely inside magnetic hangar doors.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-teal-500/20 space-y-1">
                <div className="font-bold text-teal-300">
                  🛡️ The Terminal Checkpoint
                </div>
                <div className="text-[11px] text-slate-300 font-semibold">
                  Service Perimeter Boundary
                </div>
                <p className="text-[11px] text-slate-400">
                  The security perimeter fence isolating protected projects from the public internet.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-300">
                  🎫 The Border Gate & Tickets
                </div>
                <div className="text-[11px] text-slate-300 font-semibold">
                  Ingress Rules & Access Levels
                </div>
                <p className="text-[11px] text-slate-400">
                  Turnstiles requiring verified employee badges and authorized office IP ranges to enter.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-500/20 space-y-1">
                <div className="font-bold text-emerald-300">
                  🛄 Duty-Free Export Customs
                </div>
                <div className="text-[11px] text-slate-300 font-semibold">
                  Egress Rules
                </div>
                <p className="text-[11px] text-slate-400">
                  Customs inspectors preventing data from being slipped out to unauthorized foreign airports.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-rose-500/20 space-y-1 sm:col-span-2">
                <div className="font-bold text-rose-300">
                  🔍 Baggage Scan / Violation Logs
                </div>
                <div className="text-[11px] text-slate-300 font-semibold">
                  Audit Logs & Dry-Run Troubleshooter
                </div>
                <p className="text-[11px] text-slate-400">
                  Airport security logs recording unapproved travelers stopped at the gates with diagnostic reasons.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMetaphorGuide(false)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors"
              >
                Got It, Flight Clear!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-slate-100 border border-sky-500/50 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
