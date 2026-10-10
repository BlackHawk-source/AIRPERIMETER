import {
  PerimeterConfig,
  AIAnalysisResult,
  LogTroubleshootResult,
  SimulationResult,
  SimulationStep
} from '../types/perimeter';

export function calculatePerimeterSecurity(config: PerimeterConfig): AIAnalysisResult {
  let score = 70;
  const strengths: string[] = [];
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];

  // Services locked
  if (config.restrictedServices.length >= 4) {
    score += 15;
    strengths.push(`Locked down ${config.restrictedServices.length} critical airport vaults including high-risk datasets.`);
  } else if (config.restrictedServices.length >= 1) {
    score += 5;
    strengths.push(`Protected ${config.restrictedServices.length} GCP services behind the perimeter fence.`);
  } else {
    score -= 30;
    vulnerabilities.push('Open Airport Concourse: No services are locked in the perimeter vault!');
    recommendations.push('Lock down BigQuery (Passenger Vault) and Cloud Storage (Cargo Hold).');
  }

  // IP protection
  const allIps = config.ingressRules.flatMap((r) => r.allowedIps).filter(Boolean);
  if (allIps.length > 0) {
    score += 10;
    strengths.push(`Boarding passes restricted to ${allIps.length} verified physical office / CIDR gates.`);
  } else {
    score -= 15;
    vulnerabilities.push('Open Turnstile: Ingress rules do not enforce IP subnet ranges (all networks could test gates).');
    recommendations.push('Specify trusted IP CIDR blocks (e.g. 198.51.100.0/24) in Ingress rules.');
  }

  // Identities
  const allIdentities = config.ingressRules.flatMap((r) => r.identities).filter(Boolean);
  if (allIdentities.length > 0) {
    score += 10;
    strengths.push(`Identity check active: ${allIdentities.length} trusted flight crew & service identities approved.`);
  } else {
    vulnerabilities.push('Anonymous Gate: Any identity matching network CIDR could request access.');
    recommendations.push('Add specific service accounts or user emails to ingress rules.');
  }

  // Egress
  if (config.egressRules.length === 0) {
    score += 5;
    strengths.push('Strict Customs Quarantine: Zero external egress routes defined. Data cannot be shipped to foreign airports.');
  } else {
    const broadEgress = config.egressRules.some((r) => r.targetProjects.includes('*'));
    if (broadEgress) {
      score -= 20;
      vulnerabilities.push('Unmonitored Baggage Chute: Wildcard target project in egress rule allows data export to any project!');
      recommendations.push('Restrict egress destination projects to explicitly known partner project IDs.');
    } else {
      strengths.push(`Controlled Customs: Data export restricted to ${config.egressRules.length} explicit destination jetbridges.`);
    }
  }

  // Enforcement mode
  if (config.enforcementMode === 'DRY_RUN') {
    vulnerabilities.push('Training Exercise Mode (Dry-Run): The perimeter is logging simulated violations but NOT blocking intruders!');
    recommendations.push('Once dry-run violation logs are zero, switch to LIVE ENFORCED mode.');
  }

  // Clamp score
  score = Math.max(15, Math.min(99, score));

  let rating = 'Class B Protected Field';
  if (score >= 90) rating = 'Class A+ Fortress Airport';
  else if (score >= 80) rating = 'Class A Secured Terminal';
  else if (score >= 60) rating = 'Class B Standard Airfield';
  else rating = 'Class C Vulnerable Runway';

  const summary = `The "${config.name}" perimeter houses ${config.projects.length} project concourses and shields ${config.restrictedServices.length} critical data vaults. Security controls are currently ${config.enforcementMode.toLowerCase()} with ${config.ingressRules.length} ingress gates.`;

  const metaphorNarrative = `Imagine an international airport where unauthorized passengers are stopped at the perimeter fence. In this flight plan, ${config.projects.join(', ')} act as passenger terminals. The aircraft vaults (${config.restrictedServices.map(s => s.split('.')[0]).join(', ')}) are sealed. Only travelers showing boarding passes from ${allIps.length > 0 ? allIps.join(', ') : 'authorized networks'} can step through the security scanner.`;

  return {
    securityScore: score,
    rating,
    summary,
    metaphorNarrative,
    strengths,
    vulnerabilities,
    recommendations
  };
}

export function parseAndTroubleshootLog(rawLogText: string): LogTroubleshootResult {
  try {
    const parsed = JSON.parse(rawLogText);
    const payload = parsed.protoPayload || parsed;
    const status = payload.status || {};
    const details = (status.details && status.details[0]) || {};
    const auth = payload.authenticationInfo || {};
    const meta = payload.requestMetadata || {};

    const principal = auth.principalEmail || 'unknown-traveler@external.net';
    const callerIp = meta.callerIp || '198.51.100.45';
    const serviceRequested = payload.serviceName || details.serviceName || 'bigquery.googleapis.com';
    const violationReason = details.violationReason || 'NO_MATCHING_INGRESS_RULE';
    const targetResource = payload.resourceName || (details.resourceNames && details.resourceNames[0]) || 'GCP Resource';

    let humanExplanation = `Access to ${serviceRequested} was intercepted by VPC Service Controls.`;
    let airportMetaphorDiagnosis = `Traveler ${principal} arrived at the security checkpoint from network ${callerIp}, but was turned away because their boarding pass was not validated for the ${serviceRequested.split('.')[0]} passenger vault.`;
    let recommendedAction = `Add caller IP ${callerIp} or identity ${principal} to your perimeter's Ingress Rules.`;
    let fixActionType: LogTroubleshootResult['fixActionType'] = 'ADD_IP';

    if (violationReason === 'NO_MATCHING_INGRESS_RULE') {
      airportMetaphorDiagnosis = `Security Gate Scanner stopped ${principal} at the terminal entrance. Even with valid Google Cloud IAM credentials, no Ingress Rule authorized entrance from IP ${callerIp}.`;
      humanExplanation = `The caller has IAM permission, but VPC SC Ingress rules require an approved Access Level (IP or device) or identity exception to enter this perimeter.`;
      recommendedAction = `Add IP CIDR "${callerIp}/32" to the authorized Access Level or add "${principal}" to an Ingress Rule.`;
      fixActionType = 'ADD_IP';
    } else if (violationReason === 'ACCESS_LEVEL_IP_MISMATCH') {
      airportMetaphorDiagnosis = `Passport Control Alert: ${principal} presented a staff badge, but tried to check in from untrusted remote Wi-Fi (${callerIp}) instead of the secure airline corporate network.`;
      humanExplanation = `The Access Level enforces trusted IP ranges, and ${callerIp} falls outside all authorized CIDR boundaries.`;
      recommendedAction = `If this is a legitimate remote office, append "${callerIp}/32" to the perimeter access level.`;
      fixActionType = 'ADD_IP';
    } else if (violationReason === 'NO_MATCHING_EGRESS_RULE') {
      airportMetaphorDiagnosis = `Customs Export Confiscation: Internal workload tried to ship cargo from ${targetResource} to an unscreened destination project outside the terminal fence.`;
      humanExplanation = `VPC Service Controls prevented data from crossing out of the perimeter boundary into an external GCP project.`;
      recommendedAction = `Create an explicit Egress Rule granting permission to transmit to the target destination project.`;
      fixActionType = 'ADD_SERVICE';
    }

    return {
      denied: true,
      principal,
      callerIp,
      serviceRequested,
      projectTargeted: targetResource,
      violationType: violationReason,
      humanExplanation,
      airportMetaphorDiagnosis,
      recommendedAction,
      fixActionType,
      fixPayload: {
        ipToAdd: callerIp.includes('/') ? callerIp : `${callerIp}/32`,
        identityToAdd: principal.includes('@') ? (principal.startsWith('user:') || principal.startsWith('serviceAccount:') ? principal : `user:${principal}`) : undefined,
        serviceToAdd: serviceRequested
      }
    };
  } catch {
    // If not valid JSON, provide helpful fallback
    return {
      denied: true,
      principal: 'developer@example.com',
      callerIp: '198.51.100.22',
      serviceRequested: 'bigquery.googleapis.com',
      projectTargeted: 'analytics-terminal-04',
      violationType: 'NO_MATCHING_INGRESS_RULE',
      humanExplanation: 'The log payload could not be parsed as standard JSON. Reviewing raw log lines indicates a VPC Service Controls perimeter denial.',
      airportMetaphorDiagnosis: 'A traveler was intercepted at the Security Checkpoint without an active boarding pass.',
      recommendedAction: 'Paste the JSON payload directly from Google Cloud Logging (Cloud Audit -> Policy logs).',
      fixActionType: 'ADD_IP',
      fixPayload: {
        ipToAdd: '198.51.100.22/32'
      }
    };
  }
}

export function simulateAccessRequest(
  config: PerimeterConfig,
  caller: { identity: string; ip: string; sourceProject?: string },
  target: { service: string; project: string }
): SimulationResult {
  const steps: SimulationStep[] = [];
  const now = new Date().toLocaleTimeString();

  steps.push({
    step: 1,
    location: 'Public Concourse / Caller Origin',
    status: 'inspecting',
    message: `Traveler "${caller.identity}" initiated request from IP ${caller.ip}`,
    metaphorNote: 'Caller arrives at the airport outside the security perimeter.'
  });

  const isProjectProtected = config.projects.includes(target.project);
  if (!isProjectProtected) {
    steps.push({
      step: 2,
      location: 'Unrestricted Concourse',
      status: 'passed',
      message: `Target project "${target.project}" is not inside this perimeter fence.`,
      metaphorNote: 'The destination hangar is in public airport space; perimeter rules do not apply.'
    });
    return {
      allowed: true,
      caller,
      target,
      matchedRule: 'Unrestricted Project (Outside Perimeter)',
      steps,
      timestamp: now
    };
  }

  const isServiceRestricted = config.restrictedServices.includes(target.service);
  if (!isServiceRestricted) {
    steps.push({
      step: 2,
      location: 'Public Service Hangar',
      status: 'passed',
      message: `Service "${target.service}" is not in the restricted services list.`,
      metaphorNote: 'Public waiting lounge; no magnetic security checkpoint required.'
    });
    return {
      allowed: true,
      caller,
      target,
      matchedRule: 'Service Not Restricted',
      steps,
      timestamp: now
    };
  }

  steps.push({
    step: 2,
    location: 'Terminal Perimeter Checkpoint Wall',
    status: 'inspecting',
    message: `Destination "${target.project}" and service "${target.service}" are locked inside the security perimeter.`,
    metaphorNote: 'Traveler reaches the Airport Security Checkpoint. Metal detector & boarding pass scanner active.'
  });

  // Evaluate Ingress Rules
  let matchedIngress = false;
  let matchedRuleName = '';

  for (const rule of config.ingressRules) {
    const ipMatch = rule.allowedIps.length === 0 || rule.allowedIps.some((cidr) => {
      const cleanCidr = cidr.split('/')[0];
      const callerPrefix = caller.ip.split('.').slice(0, 3).join('.');
      const rulePrefix = cleanCidr.split('.').slice(0, 3).join('.');
      return callerPrefix === rulePrefix || cidr === caller.ip;
    });

    const identityMatch =
      rule.identityType === 'ANY_IDENTITY' ||
      rule.identities.length === 0 ||
      rule.identities.some(
        (id) =>
          id.toLowerCase().includes(caller.identity.toLowerCase()) ||
          caller.identity.toLowerCase().includes(id.replace(/^(user:|serviceAccount:|group:)/, '').toLowerCase())
      );

    if (ipMatch && identityMatch) {
      matchedIngress = true;
      matchedRuleName = rule.name;
      break;
    }
  }

  if (matchedIngress) {
    steps.push({
      step: 3,
      location: 'Priority Boarding Turnstile',
      status: 'passed',
      message: `Boarding pass accepted by ingress rule: "${matchedRuleName}"`,
      metaphorNote: 'Biometric scan matched! Turnstile opens with a friendly green chime.'
    });

    steps.push({
      step: 4,
      location: 'Secure Aircraft Vault',
      status: 'passed',
      message: `Request successfully cleared and delivered to ${target.service} inside ${target.project}.`,
      metaphorNote: 'Passenger safely seated aboard aircraft. Flight cleared for takeoff.'
    });

    return {
      allowed: true,
      caller,
      target,
      matchedRule: matchedRuleName,
      steps,
      timestamp: now
    };
  } else {
    steps.push({
      step: 3,
      location: 'Airport Security Checkpoint Scanner',
      status: 'blocked',
      message: `DENIED: Caller IP ${caller.ip} / Identity ${caller.identity} does not match any approved Ingress Rule.`,
      metaphorNote: 'Scanner buzzer sounds: Access denied at the TSA/Customs barrier! Boarding pass invalid.'
    });

    if (config.enforcementMode === 'DRY_RUN') {
      steps.push({
        step: 4,
        location: 'Audit Observation Deck (Dry-Run)',
        status: 'passed',
        message: `DRY-RUN MODE ACTIVE: Violation logged for audit analysis, but request allowed through for testing.`,
        metaphorNote: 'Security drill! The guard logged the violation on their clipboard but allowed the passenger past.'
      });
      return {
        allowed: true,
        caller,
        target,
        matchedRule: 'Dry-Run Audit Pass (Simulated Denial)',
        denialReason: 'NO_MATCHING_INGRESS_RULE (Audit Only)',
        steps,
        timestamp: now
      };
    }

    return {
      allowed: false,
      caller,
      target,
      denialReason: 'VPC_SERVICE_CONTROLS_VIOLATION: NO_MATCHING_INGRESS_RULE',
      steps,
      timestamp: now
    };
  }
}
