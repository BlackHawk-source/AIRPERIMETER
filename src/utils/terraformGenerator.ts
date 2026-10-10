import { PerimeterConfig } from '../types/perimeter';

export function generateTerraformCode(config: PerimeterConfig): string {
  const isDryRun = config.enforcementMode === 'DRY_RUN';
  const perimeterBlockName = config.name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_');

  const accessLevelName = `al_${perimeterBlockName}_authorized_gate`;

  // Collect all CIDRs across ingress rules
  const allIps = Array.from(new Set(config.ingressRules.flatMap((r) => r.allowedIps))).filter(Boolean);

  let tf = `# ==============================================================================
# AeroSC: Airport Security VPC Service Controls Manifest
# Metaphor: "${config.name}" - ${config.title}
# Generated: ${new Date().toISOString().split('T')[0]}
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "access_policy_id" {
  type        = string
  description = "The Google Cloud Access Policy numerical identifier"
  default     = "${config.accessPolicyId || '849201934812'}"
}

# ------------------------------------------------------------------------------
# THE BOARDING PASS: Access Level (Authorized Airport Travelers & IP Ranges)
# ------------------------------------------------------------------------------
resource "google_access_context_manager_access_level" "${accessLevelName}" {
  parent = "accessPolicies/\${var.access_policy_id}"
  name   = "accessPolicies/\${var.access_policy_id}/accessLevels/${accessLevelName}"
  title  = "Airport Gate Access Level for ${config.name}"
  
  basic {
    conditions {
      ip_subnetworks = [
${allIps.length > 0 ? allIps.map((ip) => `        "${ip}",`).join('\n') : '        # No static CIDRs defined'}
      ]
    }
  }
}

# ------------------------------------------------------------------------------
# THE TERMINAL PERIMETER: Service Perimeter (${isDryRun ? 'Dry-Run Audit Scanner' : 'Fully Enforced Security Perimeter'})
# ------------------------------------------------------------------------------
resource "google_access_context_manager_service_perimeter" "perimeter_${perimeterBlockName}" {
  parent         = "accessPolicies/\${var.access_policy_id}"
  name           = "accessPolicies/\${var.access_policy_id}/servicePerimeters/sp_${perimeterBlockName}"
  title          = "${config.name}"
  description    = "${config.description.replace(/"/g, '\\"')}"
  perimeter_type = "${config.perimeterType === 'BRIDGE' ? 'PERIMETER_TYPE_BRIDGE' : 'PERIMETER_TYPE_REGULAR'}"

  ${isDryRun ? '# DRY RUN (AUDIT SCANNER): Evaluates violations without blocking live traffic' : '# LIVE ENFORCED: Blocks all unverified requests at the perimeter wall'}
  ${isDryRun ? 'spec {' : 'status {'}
    # Protected Concourses (GCP Projects)
    resources = [
${config.projects.map((p) => `      "projects/${p}",`).join('\n')}
    ]

    # Locked Aircraft Services (Restricted APIs)
    restricted_services = [
${config.restrictedServices.map((s) => `      "${s}",`).join('\n')}
    ]

    # Access levels granted entry through Terminal Ingress Gates
    access_levels = [
      google_access_context_manager_access_level.${accessLevelName}.name
    ]

${
  config.ingressRules.length > 0
    ? `    # ------------------------------------------------------------------------
    # TERMINAL INGRESS GATES: Who can cross into the secure zone
    # ------------------------------------------------------------------------
${config.ingressRules
  .map(
    (rule, idx) => `    ingress_policies {
      ingress_from {
        identity_type = "${rule.identityType}"
${
  rule.identities.length > 0
    ? `        identities = [
${rule.identities.map((id) => `          "${id}",`).join('\n')}
        ]`
    : ''
}
        sources {
          access_level = google_access_context_manager_access_level.${accessLevelName}.name
        }
      }

      ingress_to {
        resources = [
${config.projects.map((p) => `          "projects/${p}",`).join('\n')}
        ]
        operations {
          service_name = "*"
          method_selectors {
            method = "*"
          }
        }
      }
    }`
  )
  .join('\n\n')}`
    : ''
}

${
  config.egressRules.length > 0
    ? `    # ------------------------------------------------------------------------
    # DUTY-FREE EXPORT CUSTOMS: Who can send data outside the perimeter
    # ------------------------------------------------------------------------
${config.egressRules
  .map(
    (rule) => `    egress_policies {
      egress_from {
        identity_type = "ANY_IDENTITY"
${
  rule.allowedIdentities.length > 0
    ? `        identities = [
${rule.allowedIdentities.map((id) => `          "${id}",`).join('\n')}
        ]`
    : ''
}
      }

      egress_to {
        resources = [
${rule.targetProjects.map((p) => `          "projects/${p}",`).join('\n')}
        ]
        operations {
${rule.targetServices.map((s) => `          service_name = "${s}"`).join('\n')}
          method_selectors {
            method = "*"
          }
        }
      }
    }`
  )
  .join('\n\n')}`
    : ''
}
  }

  lifecycle {
    ignore_changes = []
  }
}
`;

  return tf;
}
