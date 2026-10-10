import React, { useState } from 'react';
import {
  Shield,
  Plane,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Globe,
  Users,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  HardDrive,
  Cpu,
  Brain,
  Radio,
  KeyRound,
  Eye,
  Boxes,
  Zap,
  ExternalLink
} from 'lucide-react';
import { PerimeterConfig, IngressRule, EgressRule } from '../types/perimeter';
import { GCP_SERVICES } from '../data/gcpServices';

interface FlightPlannerProps {
  config: PerimeterConfig;
  onChangeConfig: (newConfig: PerimeterConfig) => void;
  onActivatePerimeter: () => void;
  isActivating: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Database,
  HardDrive,
  Server,
  Brain,
  Radio,
  KeyRound,
  Eye,
  Cpu,
  Boxes,
  Zap
};

export const FlightPlanner: React.FC<FlightPlannerProps> = ({
  config,
  onChangeConfig,
  onActivatePerimeter,
  isActivating
}) => {
  const [newProjectInput, setNewProjectInput] = useState('');
  const [newIpInput, setNewIpInput] = useState('');
  const [selectedGateId, setSelectedGateId] = useState<string>(config.ingressRules[0]?.id || '');
  const [newIdentityInput, setNewIdentityInput] = useState('');
  const [customServiceInput, setCustomServiceInput] = useState('');

  // Toggle GCP Service in restricted list
  const toggleService = (apiName: string) => {
    const isRestricted = config.restrictedServices.includes(apiName);
    const updatedServices = isRestricted
      ? config.restrictedServices.filter((s) => s !== apiName)
      : [...config.restrictedServices, apiName];
    onChangeConfig({ ...config, restrictedServices: updatedServices });
  };

  // Add Project
  const handleAddProject = () => {
    const trimmed = newProjectInput.trim().toLowerCase();
    if (trimmed && !config.projects.includes(trimmed)) {
      onChangeConfig({ ...config, projects: [...config.projects, trimmed] });
      setNewProjectInput('');
    }
  };

  // Remove Project
  const handleRemoveProject = (proj: string) => {
    onChangeConfig({
      ...config,
      projects: config.projects.filter((p) => p !== proj)
    });
  };

  // Add custom service
  const handleAddCustomService = () => {
    const trimmed = customServiceInput.trim().toLowerCase();
    if (trimmed && !config.restrictedServices.includes(trimmed)) {
      const full = trimmed.includes('.') ? trimmed : `${trimmed}.googleapis.com`;
      onChangeConfig({
        ...config,
        restrictedServices: [...config.restrictedServices, full]
      });
      setCustomServiceInput('');
    }
  };

  // Ingress rule modifications
  const currentGate = config.ingressRules.find((r) => r.id === selectedGateId) || config.ingressRules[0];

  const handleAddIpToGate = () => {
    if (!currentGate || !newIpInput.trim()) return;
    const ip = newIpInput.trim();
    const updatedGates = config.ingressRules.map((gate) => {
      if (gate.id === currentGate.id) {
        return {
          ...gate,
          allowedIps: Array.from(new Set([...gate.allowedIps, ip]))
        };
      }
      return gate;
    });
    onChangeConfig({ ...config, ingressRules: updatedGates });
    setNewIpInput('');
  };

  const handleRemoveIpFromGate = (gateId: string, ipToRemove: string) => {
    const updatedGates = config.ingressRules.map((gate) => {
      if (gate.id === gateId) {
        return {
          ...gate,
          allowedIps: gate.allowedIps.filter((ip) => ip !== ipToRemove)
        };
      }
      return gate;
    });
    onChangeConfig({ ...config, ingressRules: updatedGates });
  };

  const handleAddIdentityToGate = () => {
    if (!currentGate || !newIdentityInput.trim()) return;
    const identity = newIdentityInput.trim();
    const updatedGates = config.ingressRules.map((gate) => {
      if (gate.id === currentGate.id) {
        return {
          ...gate,
          identities: Array.from(new Set([...gate.identities, identity]))
        };
      }
      return gate;
    });
    onChangeConfig({ ...config, ingressRules: updatedGates });
    setNewIdentityInput('');
  };

  const handleRemoveIdentityFromGate = (gateId: string, idToRemove: string) => {
    const updatedGates = config.ingressRules.map((gate) => {
      if (gate.id === gateId) {
        return {
          ...gate,
          identities: gate.identities.filter((id) => id !== idToRemove)
        };
      }
      return gate;
    });
    onChangeConfig({ ...config, ingressRules: updatedGates });
  };

  const handleAddGate = () => {
    const newGate: IngressRule = {
      id: `ing-${Date.now().toString(36)}`,
      name: `Turnstile Gate ${config.ingressRules.length + 1}`,
      metaphorLabel: `Terminal Concourse Gate #${config.ingressRules.length + 1}`,
      identityType: 'SELECTED_IDENTITIES',
      identities: ['user:team-lead@aerosc-airline.internal'],
      allowedIps: ['198.51.100.0/24'],
      description: 'Authorized check-in access lane for validated airline staff.'
    };
    onChangeConfig({
      ...config,
      ingressRules: [...config.ingressRules, newGate]
    });
    setSelectedGateId(newGate.id);
  };

  const handleDeleteGate = (gateId: string) => {
    const filtered = config.ingressRules.filter((g) => g.id !== gateId);
    onChangeConfig({ ...config, ingressRules: filtered });
    if (selectedGateId === gateId && filtered[0]) {
      setSelectedGateId(filtered[0].id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1527]/70 backdrop-blur-xl border-r border-sky-900/30 text-slate-200 overflow-y-auto">
      {/* Panel Banner / Header */}
      <div className="p-4 sm:p-5 border-b border-sky-900/40 bg-gradient-to-r from-sky-950/40 to-teal-950/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Plane className="w-4 h-4 transform -rotate-45" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              The Flight Planner
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded-full">
            Config Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Configure protected terminals, aircraft vaults, and boarding pass security levels.
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-6 flex-1">
        {/* ========================================================================= */}
        {/* SECTION A: Lock Down the Aircraft (Services) */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                A
              </span>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                Lock Down the Aircraft
                <span className="text-xs font-normal text-slate-400">
                  (Restricted GCP Services)
                </span>
              </h3>
            </div>
            <span className="text-xs text-sky-300 font-mono bg-sky-950/70 border border-sky-800/60 px-2 py-0.5 rounded-md">
              {config.restrictedServices.length} Locked
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Selected services are isolated inside the perimeter. Unauthorized callers outside the fence are instantly blocked.
          </p>

          {/* Service Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GCP_SERVICES.map((srv) => {
              const isLocked = config.restrictedServices.includes(srv.apiName);
              const SrvIcon = iconMap[srv.icon] || Database;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => toggleService(srv.apiName)}
                  className={`text-left p-2.5 rounded-xl border transition-all relative group flex items-start gap-2.5 ${
                    isLocked
                      ? 'bg-sky-950/50 border-sky-500/50 text-white shadow-sm shadow-sky-500/10 hover:border-sky-400'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      isLocked
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-slate-800/70 text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    <SrvIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold truncate text-slate-100">
                        {srv.name}
                      </span>
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-sky-400 shrink-0" />
                      ) : (
                        <Unlock className="w-3 h-3 text-slate-600 shrink-0" />
                      )}
                    </div>
                    <div
                      className={`text-[10px] truncate font-medium ${
                        isLocked ? 'text-teal-300' : 'text-slate-500'
                      }`}
                    >
                      [{srv.metaphorTitle}]
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom service addition */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add other service (e.g. pubsub.googleapis.com)"
              value={customServiceInput}
              onChange={(e) => setCustomServiceInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomService()}
              className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={handleAddCustomService}
              className="px-2.5 py-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 border border-sky-800/70 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION B: Set Up the Checkpoint (Projects to Protect) */}
        {/* ========================================================================= */}
        <section className="space-y-3 pt-2 border-t border-sky-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                B
              </span>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                Set Up the Checkpoint
                <span className="text-xs font-normal text-slate-400">
                  (Protected GCP Projects)
                </span>
              </h3>
            </div>
            <span className="text-xs text-teal-300 font-mono bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded-md">
              {config.projects.length} Terminals
            </span>
          </div>

          <p className="text-xs text-slate-400">
            These Google Cloud projects represent airport concourses placed inside the security perimeter fence.
          </p>

          {/* Project Tag Cloud */}
          <div className="flex flex-wrap gap-2">
            {config.projects.map((proj) => (
              <div
                key={proj}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-teal-500/30 text-teal-200 text-xs shadow-sm hover:border-teal-400/60 transition-all group"
              >
                <Server className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-mono text-[11px]">{proj}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(proj)}
                  title={`Remove ${proj}`}
                  className="text-slate-500 hover:text-rose-400 ml-0.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add project input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. analytics-terminal-04"
              value={newProjectInput}
              onChange={(e) => setNewProjectInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 font-mono"
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="px-2.5 py-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 border border-teal-800/70 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Concourse</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION C: Define Approved Travelers (Ingress / Network Access) */}
        {/* ========================================================================= */}
        <section className="space-y-3 pt-2 border-t border-sky-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                C
              </span>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                Define Approved Travelers
                <span className="text-xs font-normal text-slate-400">
                  (Ingress Gates & Passes)
                </span>
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddGate}
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded-md transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>New Gate</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Define authorized traveler tickets: trusted office IP CIDR blocks and flight crew identities (Service Accounts).
          </p>

          {/* Gate Selector Tabs */}
          {config.ingressRules.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {config.ingressRules.map((gate) => (
                <button
                  key={gate.id}
                  type="button"
                  onClick={() => setSelectedGateId(gate.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all font-medium ${
                    (selectedGateId === gate.id || (!selectedGateId && gate === config.ingressRules[0]))
                      ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {gate.name}
                </button>
              ))}
            </div>
          )}

          {/* Current Selected Gate Detail Box */}
          {currentGate ? (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/25 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>{currentGate.metaphorLabel || currentGate.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentGate.description}
                  </p>
                </div>
                {config.ingressRules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteGate(currentGate.id)}
                    title="Delete gate"
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sub-item: Authorized IP CIDRs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-sky-400" />
                  <span>Authorized Physical Networks (CIDRs / Office IPs)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {currentGate.allowedIps.map((ip) => (
                    <span
                      key={ip}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 text-sky-300 text-[11px] font-mono"
                    >
                      {ip}
                      <button
                        type="button"
                        onClick={() => handleRemoveIpFromGate(currentGate.id, ip)}
                        className="text-slate-500 hover:text-rose-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {currentGate.allowedIps.length === 0 && (
                    <span className="text-[11px] text-slate-500 italic">
                      No CIDRs restricted (Any network matching identity can attempt entry)
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 198.51.100.0/24 or 10.0.0.0/16"
                    value={newIpInput}
                    onChange={(e) => setNewIpInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddIpToGate()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddIpToGate}
                    className="px-2 py-1 rounded bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-800 text-xs font-medium"
                  >
                    + CIDR
                  </button>
                </div>
              </div>

              {/* Sub-item: Approved Identities */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Users className="w-3 h-3 text-teal-400" />
                  <span>Boarding Pass Holders (Service Accounts & Users)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {currentGate.identities.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-800/60 text-teal-300 text-[11px] font-mono truncate max-w-full"
                    >
                      <span className="truncate">{id}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIdentityFromGate(currentGate.id, id)}
                        className="text-slate-500 hover:text-rose-300 shrink-0"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {currentGate.identities.length === 0 && (
                    <span className="text-[11px] text-slate-500 italic">
                      Any verified IAM identity from approved IP
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="serviceAccount:bot@project.iam.gserviceaccount.com"
                    value={newIdentityInput}
                    onChange={(e) => setNewIdentityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddIdentityToGate()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddIdentityToGate}
                    className="px-2 py-1 rounded bg-teal-950/70 hover:bg-teal-900 text-teal-200 border border-teal-800 text-xs font-medium"
                  >
                    + Identity
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No Ingress Gates configured. Add a gate above to allow authorized travelers.
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION D: Duty-Free Export Customs (Egress) */}
        {/* ========================================================================= */}
        <section className="space-y-2 pt-2 border-t border-sky-900/30">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Duty-Free Export Customs</span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Egress Controls)
              </span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {config.egressRules.length} Customs Gates
            </span>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            {config.egressRules.length > 0 ? (
              <div className="space-y-1">
                {config.egressRules.map((egr) => (
                  <div key={egr.id} className="flex items-center justify-between">
                    <span className="text-slate-200 font-medium">
                      🛫 {egr.metaphorLabel || egr.name}
                    </span>
                    <span className="text-emerald-400 text-[10px] font-mono">
                      Dest: {egr.targetProjects.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-emerald-400 font-medium">
                🔒 Strict Quarantine: Zero data egress permitted outside airport fence.
              </span>
            )}
          </div>
        </section>
      </div>

      {/* PROMPT ACTION: Glowing Activate Service Perimeter Button */}
      <div className="p-4 sm:p-5 border-t border-sky-900/40 bg-gradient-to-t from-slate-950 to-slate-900/60 sticky bottom-0 z-20">
        <button
          type="button"
          onClick={onActivatePerimeter}
          disabled={isActivating}
          className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 via-teal-500 to-sky-600 hover:from-sky-400 hover:via-teal-400 hover:to-sky-500 text-white font-bold text-sm py-3.5 px-4 shadow-lg shadow-sky-500/25 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {/* Animated Travel Sweep Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          <div className="flex items-center justify-center gap-2.5 relative z-10">
            <Plane
              className={`w-4 h-4 transform -rotate-45 transition-transform ${
                isActivating ? 'translate-x-3 -translate-y-3' : 'group-hover:translate-x-1'
              }`}
            />
            <span>
              {isActivating
                ? 'Validating Flight Radar...'
                : 'Activate Service Perimeter'}
            </span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
        </button>
      </div>
    </div>
  );
};
