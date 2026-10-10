export interface SampleLog {
  id: string;
  title: string;
  badge: string;
  rawJson: string;
}

export const SAMPLE_LOGS: SampleLog[] = [
  {
    id: 'missing-ip-alice',
    title: 'Alice Denied at Terminal Gate (Missing Office IP)',
    badge: 'Ingress Violation',
    rawJson: JSON.stringify(
      {
        protoPayload: {
          "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
          status: {
            code: 7,
            message: "Request is prohibited by organization's policy: VPC Service Controls violation: Ingress policy denied access.",
            details: [
              {
                "@type": "type.googleapis.com/google.identity.accesscontextmanager.v1.VpcServiceControlsViolationInfo",
                violationReason: "NO_MATCHING_INGRESS_RULE",
                resourceNames: [
                  "projects/analytics-terminal-04/datasets/flight_manifest_2026"
                ],
                serviceName: "bigquery.googleapis.com",
                servicePerimeterName: "accessPolicies/849201934812/servicePerimeters/sp_secure_terminal",
                methodName: "google.cloud.bigquery.v2.JobService.InsertJob"
              }
            ]
          },
          authenticationInfo: {
            principalEmail: "alice.chen@aerosc-airline.internal",
            authoritySelector: "corp-desktop"
          },
          requestMetadata: {
            callerIp: "198.51.100.45",
            callerSuppliedUserAgent: "Google-BigQuery-Client/2.35.0"
          },
          serviceName: "bigquery.googleapis.com",
          resourceName: "projects/analytics-terminal-04/datasets/flight_manifest_2026"
        },
        severity: "ERROR",
        logName: "projects/analytics-terminal-04/logs/cloudaudit.googleapis.com%2Fpolicy"
      },
      null,
      2
    )
  },
  {
    id: 'starbucks-wifi',
    title: 'Engineer on Public Wi-Fi Blocked from Black Box Secrets',
    badge: 'Untrusted Network',
    rawJson: JSON.stringify(
      {
        protoPayload: {
          "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
          status: {
            code: 7,
            message: "Security checkpoint interception: Caller IP not within authorized Access Level CIDRs.",
            details: [
              {
                "@type": "type.googleapis.com/google.identity.accesscontextmanager.v1.VpcServiceControlsViolationInfo",
                violationReason: "ACCESS_LEVEL_IP_MISMATCH",
                resourceNames: [
                  "projects/production-ops-55/secrets/master-avionics-private-key"
                ],
                serviceName: "secretmanager.googleapis.com",
                servicePerimeterName: "accessPolicies/849201934812/servicePerimeters/sp_secure_terminal",
                methodName: "google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"
              }
            ]
          },
          authenticationInfo: {
            principalEmail: "devops-marc@aerosc-airline.internal"
          },
          requestMetadata: {
            callerIp: "73.222.14.88",
            callerSuppliedUserAgent: "gcloud/480.0.0"
          },
          serviceName: "secretmanager.googleapis.com"
        },
        severity: "ERROR",
        logName: "projects/production-ops-55/logs/cloudaudit.googleapis.com%2Fpolicy"
      },
      null,
      2
    )
  },
  {
    id: 'egress-baggage-leak',
    title: 'Unauthorized Data Export to External Bucket',
    badge: 'Egress Customs Block',
    rawJson: JSON.stringify(
      {
        protoPayload: {
          "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
          status: {
            code: 7,
            message: "VPC Service Controls violation: Egress rule does not permit destination project: external-partner-unverified.",
            details: [
              {
                "@type": "type.googleapis.com/google.identity.accesscontextmanager.v1.VpcServiceControlsViolationInfo",
                violationReason: "NO_MATCHING_EGRESS_RULE",
                resourceNames: [
                  "projects/_/buckets/external-unscreened-freight-dump"
                ],
                serviceName: "storage.googleapis.com",
                servicePerimeterName: "accessPolicies/849201934812/servicePerimeters/sp_secure_terminal",
                methodName: "storage.objects.copy"
              }
            ]
          },
          authenticationInfo: {
            principalEmail: "serviceAccount:runway-loader@production-ops-55.iam.gserviceaccount.com"
          },
          requestMetadata: {
            callerIp: "10.128.0.4",
            destinationProject: "external-partner-unverified"
          },
          serviceName: "storage.googleapis.com"
        },
        severity: "ERROR",
        logName: "projects/production-ops-55/logs/cloudaudit.googleapis.com%2Fpolicy"
      },
      null,
      2
    )
  }
];
