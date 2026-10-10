import React, { useState } from 'react';
import {
  Plane,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Radio,
  Wifi,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Info,
  Server,
  Database,
  HardDrive,
  Cpu,
  Brain,
  KeyRound,
  Eye,
  Boxes,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PerimeterConfig, SimulationResult } from '../types/perimeter';
import { GCP_SERVICES } from '../data/gcpServices';
import { simulateAccessRequest } from '../utils/airportAnalyzer';

interface AirportBlueprintProps {
  config: PerimeterConfig;
}

const serviceIconMap: Record<string, React.ElementType> = {
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

export const AirportBlueprint: React.FC<AirportBlueprintProps> = ({ config }) => {
  // Simulation test parameters
  const [testCallerType, setTestCallerType] = useState<'office' | 'service_account' | 'unauthorized_wifi'>('office');
  const [customIp, setCustomIp] = useState('198.51.100.45');
  const [customIdentity, setCustomIdentity] = useState('user:analyst@aerosc-airline.internal');
  const [targetService, setTargetService] = useState(config.restrictedServices[0] || 'bigquery.googleapis.com');
  const [targetProject, setTargetProject] = useState(config.projects[0] || 'production-ops-55');

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationStepIndex, setSimulationStepIndex] = useState(0);

  // Inspector modal for clicked elements
  const [inspectedElement, setInspectedElement] = useState<{
    title: string;
    subtitle: string;
    category: 'gate' | 'vault' | 'project' | 'public';
    description: string;
    rules?: string[];
  } | null>(null);

  // Run flight check simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationStepIndex(0);

    let callerIp = customIp;
    let callerIdentity = customIdentity;

    if (testCallerType === 'office') {
      callerIp = config.ingressRules[0]?.allowedIps[0] || '198.51.100.45';
      callerIdentity = config.ingressRules[0]?.identities[0] || 'user:analyst@aerosc-airline.internal';
    } else if (testCallerType === 'service_account') {
      callerIp = '10.128.0.4';
      callerIdentity = 'serviceAccount:runway-loader@production-ops-55.iam.gserviceaccount.com';
    } else if (testCallerType === 'unauthorized_wifi') {
      callerIp = '73.222.14.88'; // Public hotel/coffee shop IP
      callerIdentity = 'user:intruder@external-unknown.com';
    }

    const result = simulateAccessRequest(
      config,
      { identity: callerIdentity, ip: callerIp },
      { service: targetService, project: targetProject }
    );

    setSimulationResult(result);

    // Animate through simulation steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < result.steps.length) {
        setSimulationStepIndex(currentStep);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 700);
  };

  const restrictedServicesData = GCP_SERVICES.filter((s) =>
    config.restrictedServices.includes(s.apiName)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Simulation Trigger Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel-accent border border-sky-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Airport Security Topology Map
            </h3>
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Interactive Blueprint
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live schematic visualizes public concourses, perimeter gates, terminal hangars, and locked data vaults.
          </p>
        </div>

        {/* Quick Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-sky-900/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setTestCallerType('office');
                setCustomIp('198.51.100.45');
                setCustomIdentity('user:analyst@aerosc-airline.internal');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                testCallerType === 'office'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏢 Verified Office IP
            </button>
            <button
              type="button"
              onClick={() => {
                setTestCallerType('service_account');
                setCustomIp('10.128.0.4');
                setCustomIdentity('serviceAccount:runway-loader@production-ops-55.iam.gserviceaccount.com');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                testCallerType === 'service_account'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🤖 Internal Bot
            </button>
            <button
              type="button"
              onClick={() => {
                setTestCallerType('unauthorized_wifi');
                setCustomIp('73.222.14.88');
                setCustomIdentity('user:intruder@external-unknown.com');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                testCallerType === 'unauthorized_wifi'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ☕ Public Wi-Fi
            </button>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isSimulating ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>
              {isSimulating ? 'Verifying Flight Clearance...' : 'Simulate Flight Plan'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE TOPOLOGY CANVAS */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl glass-panel p-5 sm:p-7 overflow-hidden border border-sky-500/20 min-h-[580px] flex flex-col justify-between">
        {/* Radar Background Sweep */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-sky-500/20 flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full border border-sky-500/25 flex items-center justify-center">
              <div className="w-[300px] h-[300px] rounded-full border border-sky-500/30" />
            </div>
          </div>
          {/* Rotating radar ray */}
          <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 origin-center radar-sweep">
            <div className="w-1/2 h-full bg-gradient-to-l from-sky-400/15 to-transparent rounded-r-full" />
          </div>
        </div>

        {/* Airport Runway Indicator Lights */}
        <div className="absolute top-3 left-6 right-6 flex justify-between pointer-events-none opacity-40">
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-sky-400">
            RUNWAY 09L // AIRSPACE GUARDED BY ACCESS CONTEXT MANAGER
          </div>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          </div>
        </div>

        {/* TOPOLOGY REGIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-4 items-stretch">
          {/* ===================================================================== */}
          {/* 1. PUBLIC ZONE (Outside Perimeter Fence) - 4 Cols */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  The Public Zone
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Outside Perimeter
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Corporate offices, mobile laptops, and public internet trying to reach cloud datasets.
            </p>

            {/* Public Cards */}
            <div className="space-y-3">
              {/* Authorized Corporate Office Card */}
              <div
                onClick={() =>
                  setInspectedElement({
                    title: 'Corporate Headquarters Office',
                    subtitle: 'Authorized Network Origin',
                    category: 'public',
                    description:
                      'Employees situated on the company intranet or VPN with whitelisted CIDR subnets.',
                    rules: config.ingressRules.flatMap((r) => r.allowedIps)
                  })
                }
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  testCallerType === 'office'
                    ? 'bg-sky-950/70 border-sky-400 text-sky-200 glow-cyan ring-1 ring-sky-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold">Airline HQ Office</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-300 bg-sky-900/50 px-1.5 py-0.5 rounded">
                    CIDR Allowed
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {config.ingressRules[0]?.allowedIps[0] || '198.51.100.0/24'}
                </div>
              </div>

              {/* Internal Automation Bot Card */}
              <div
                onClick={() =>
                  setInspectedElement({
                    title: 'Flight Ops Automation Bot',
                    subtitle: 'Service Account Principal',
                    category: 'public',
                    description:
                      'Background worker account responsible for syncing telemetry and passenger lists.',
                    rules: config.ingressRules.flatMap((r) => r.identities)
                  })
                }
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  testCallerType === 'service_account'
                    ? 'bg-teal-950/70 border-teal-400 text-teal-200 glow-emerald ring-1 ring-teal-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold">Crew Service Accounts</span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-900/50 px-1.5 py-0.5 rounded">
                    IAM Validated
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  {config.ingressRules[0]?.identities[0] || 'serviceAccount:runway-loader@prod...'}
                </div>
              </div>

              {/* Untrusted / Public Internet */}
              <div
                onClick={() =>
                  setInspectedElement({
                    title: 'Public Internet / Coffee Shop Wi-Fi',
                    subtitle: 'Unscreened Outside Network',
                    category: 'public',
                    description:
                      'Remote actors, external attackers, or employees on unsecured guest networks without VPN.',
                    rules: ['No matching Access Level CIDR', 'Traffic blocked at Perimeter Checkpoint']
                  })
                }
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  testCallerType === 'unauthorized_wifi'
                    ? 'bg-rose-950/70 border-rose-400 text-rose-200 ring-1 ring-rose-400'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold">Public Coffee Shop Wi-Fi</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-900/50 px-1.5 py-0.5 rounded">
                    Untrusted
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  73.222.14.88 (Unscreened Origin)
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 2. CHECKPOINT PERIMETER WALL & GATES - 2 Cols */}
          {/* ===================================================================== */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center relative py-4 lg:py-0">
            {/* The Wall Graphics */}
            <div className="w-full flex lg:flex-col items-center justify-center gap-4 relative">
              {/* Glowing Fence Line */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="hidden lg:block w-1.5 h-full bg-gradient-to-b from-sky-500/30 via-teal-400 to-sky-500/30 rounded-full shadow-lg shadow-sky-400/50" />
                <div className="lg:hidden w-full h-1.5 bg-gradient-to-r from-sky-500/30 via-teal-400 to-sky-500/30 rounded-full shadow-lg shadow-sky-400/50" />
              </div>

              {/* Ingress Gate Badges */}
              <div className="relative z-10 flex flex-col gap-3 items-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-[#0d1527] px-2 py-0.5 rounded-full border border-sky-500/40 shadow-sm whitespace-nowrap">
                  Terminal Gate Scanner
                </div>

                {config.ingressRules.map((gate, idx) => (
                  <div
                    key={gate.id}
                    onClick={() =>
                      setInspectedElement({
                        title: gate.metaphorLabel || gate.name,
                        subtitle: 'Ingress Policy Gate',
                        category: 'gate',
                        description: gate.description,
                        rules: [
                          `Allowed IPs: ${gate.allowedIps.join(', ') || 'Any'}`,
                          `Identities: ${gate.identities.join(', ') || 'Any IAM Identity'}`
                        ]
                      })
                    }
                    className="cursor-pointer group flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <div className="w-full h-full bg-[#0d1527] rounded-[10px] flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-300 mt-1 max-w-[90px] text-center truncate">
                      Gate #{idx + 1}
                    </span>
                  </div>
                ))}

                {/* Unauthorized Blocker Barrier */}
                <div
                  onClick={() =>
                    setInspectedElement({
                      title: 'Automatic Barrier Gate',
                      subtitle: 'VPC SC Interceptor',
                      category: 'gate',
                      description:
                        'Any request failing Access Level CIDR or Ingress rules is instantly intercepted here.',
                      rules: ['Code 7: VPC_SERVICE_CONTROLS_VIOLATION']
                    })
                  }
                  className="cursor-pointer group flex flex-col items-center mt-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 p-0.5 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full bg-[#0d1527] rounded-[9px] flex items-center justify-center">
                      <Lock className="w-4 h-4 text-rose-400" />
                    </div>
                  </div>
                  <span className="text-[9px] font-medium text-rose-300 mt-1">
                    TSA Barrier
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. THE SECURE ZONE (Inside the Airport Fence) - 6 Cols */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900/70 to-teal-950/30 border border-sky-400/30 p-5 space-y-5 relative shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  The Secure Zone (Inside Perimeter)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Protected Airspace
              </span>
            </div>

            {/* Concourse Projects */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Protected Terminal Concourses (GCP Projects):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.projects.map((proj) => (
                  <button
                    key={proj}
                    type="button"
                    onClick={() =>
                      setInspectedElement({
                        title: proj,
                        subtitle: 'Protected Airport Concourse',
                        category: 'project',
                        description: `Google Cloud project guarded by ${config.name} service perimeter.`,
                        rules: [
                          'Project enclosed inside perimeter fence',
                          `Restricted Services: ${config.restrictedServices.length}`
                        ]
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-teal-500/40 text-teal-200 text-xs font-mono font-medium hover:border-teal-400 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Plane className="w-3 h-3 text-teal-400 transform -rotate-45" />
                    <span>{proj}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aircraft Vaults (Restricted Services) */}
            <div className="space-y-2 pt-2 border-t border-sky-900/40">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sealed Aircraft Vaults (Restricted APIs):</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {restrictedServicesData.length} Vaults Guarded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {restrictedServicesData.map((srv) => {
                  const SrvIcon = serviceIconMap[srv.icon] || Database;
                  return (
                    <div
                      key={srv.id}
                      onClick={() =>
                        setInspectedElement({
                          title: srv.metaphorTitle,
                          subtitle: srv.apiName,
                          category: 'vault',
                          description: `${srv.name} (${srv.metaphorRole}). ${srv.riskDescription}`,
                          rules: [
                            'Protected by VPC Service Controls',
                            'Unapproved external calls are rejected with Code 7'
                          ]
                        })
                      }
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-sky-500/25 hover:border-sky-400/60 cursor-pointer transition-all shadow-sm group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 group-hover:scale-105 transition-transform">
                          <SrvIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {srv.metaphorTitle}
                          </div>
                          <div className="text-[10px] text-teal-400 font-mono truncate">
                            {srv.name}
                          </div>
                        </div>
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SIMULATION RADAR MONITOR & FLIGHT CHECK OUTPUT */}
        {/* ========================================================================= */}
        {simulationResult && (
          <div className="mt-4 p-4 rounded-xl glass-panel-accent border border-sky-400/40 relative z-20 transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-400 transform -rotate-45" />
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Flight Simulation Telemetry:
                </h5>
                <span className="text-[11px] text-slate-300 font-mono">
                  {simulationResult.caller.identity} ({simulationResult.caller.ip})
                </span>
              </div>

              {simulationResult.allowed ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cleared for Takeoff (Passed Customs)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-500/50 px-2.5 py-1 rounded-full">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Denied at Checkpoint Scanner (Code 7)</span>
                </span>
              )}
            </div>

            {/* Step-by-step radar trajectory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
              {simulationResult.steps.map((step, idx) => {
                const isCurrent = idx === simulationStepIndex;
                const isDone = idx <= simulationStepIndex;
                return (
                  <div
                    key={step.step}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      step.status === 'passed' && isDone
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : step.status === 'blocked' && isDone
                        ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                        : isCurrent
                        ? 'bg-sky-950/70 border-sky-400 text-sky-200 animate-pulse'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>Step {step.step}: {step.location}</span>
                      {step.status === 'passed' && isDone && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {step.status === 'blocked' && isDone && (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                    <p className="text-[11px] leading-tight opacity-90">
                      {step.message}
                    </p>
                    <p className="text-[10px] mt-1 text-slate-400 italic">
                      ✈️ {step.metaphorNote}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INSPECTOR DETAILS MODAL / DRAWER */}
      {/* ========================================================================= */}
      {inspectedElement && (
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-sky-500/30 flex items-start justify-between gap-4 animate-fadeIn">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-sky-500/20 text-sky-300">
                <Info className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-white">
                {inspectedElement.title}
              </h4>
              <span className="text-[11px] font-mono text-sky-300 bg-sky-950 border border-sky-800 px-2 py-0.5 rounded">
                {inspectedElement.subtitle}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {inspectedElement.description}
            </p>
            {inspectedElement.rules && inspectedElement.rules.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {inspectedElement.rules.map((rule, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setInspectedElement(null)}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
