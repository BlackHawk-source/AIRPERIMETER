export interface GCPService {
  id: string;
  name: string;
  apiName: string;
  metaphorTitle: string;
  metaphorRole: string;
  icon: string;
  category: 'analytics' | 'storage' | 'compute' | 'ai' | 'security' | 'database';
  riskDescription: string;
}

export interface IngressRule {
  id: string;
  name: string;
  identityType: 'ANY_IDENTITY' | 'SELECTED_IDENTITIES' | 'SERVICE_ACCOUNT';
  identities: string[];
  allowedIps: string[];
  sourceProjects?: string[];
  description: string;
  metaphorLabel: string; // e.g. "VIP Priority Gate", "Terminal Crew Pass"
}

export interface EgressRule {
  id: string;
  name: string;
  targetProjects: string[];
  targetServices: string[];
  allowedIdentities: string[];
  description: string;
  metaphorLabel: string; // e.g. "Cargo Export Customs", "Interline Transfer Jetbridge"
}

export interface PerimeterConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  accessPolicyId: string;
  perimeterType: 'REGULAR' | 'BRIDGE';
  enforcementMode: 'ENFORCED' | 'DRY_RUN';
  projects: string[];
  restrictedServices: string[];
  ingressRules: IngressRule[];
  egressRules: EgressRule[];
  unrestrictedServices?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationStep {
  step: number;
  location: string;
  status: 'passed' | 'blocked' | 'inspecting';
  message: string;
  metaphorNote: string;
}

export interface SimulationResult {
  allowed: boolean;
  caller: {
    identity: string;
    ip: string;
    sourceProject?: string;
  };
  target: {
    service: string;
    project: string;
  };
  matchedRule?: string;
  denialReason?: string;
  steps: SimulationStep[];
  timestamp: string;
}

export interface LogTroubleshootResult {
  denied: boolean;
  principal: string;
  callerIp: string;
  serviceRequested: string;
  projectTargeted: string;
  violationType: string;
  humanExplanation: string;
  airportMetaphorDiagnosis: string;
  recommendedAction: string;
  fixActionType?: 'ADD_IP' | 'ADD_SERVICE_ACCOUNT' | 'ADD_SERVICE' | 'SWITCH_DRY_RUN';
  fixPayload?: {
    ipToAdd?: string;
    identityToAdd?: string;
    serviceToAdd?: string;
  };
}

export interface AIAnalysisResult {
  securityScore: number; // 0-100
  rating: string; // e.g. "A+ Class 1 Secure Hub"
  summary: string;
  metaphorNarrative: string;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
}
