import { PerimeterConfig } from '../types/perimeter';

export const TEMPLATES: PerimeterConfig[] = [
  {
    id: 'domestic-shuttle',
    name: 'The Domestic Shuttle',
    title: 'The Domestic Shuttle (Standard Protected Boundary)',
    description: 'Standard protected airport boundary locking Cloud Storage & BigQuery, allowing verified corporate HQ office network & staff boarding passes.',
    accessPolicyId: '849201934812',
    perimeterType: 'REGULAR',
    enforcementMode: 'ENFORCED',
    projects: ['production-ops-55', 'analytics-terminal-04'],
    restrictedServices: ['bigquery.googleapis.com', 'storage.googleapis.com', 'secretmanager.googleapis.com'],
    ingressRules: [
      {
        id: 'ing-1',
        name: 'Corporate HQ VIP Gate',
        metaphorLabel: 'Corporate Concourse Turnstile',
        identityType: 'SELECTED_IDENTITIES',
        identities: [
          'user:flight-ops@aerosc-airline.internal',
          'group:airline-analysts@aerosc-airline.internal'
        ],
        allowedIps: ['198.51.100.0/24', '203.0.113.10/32'],
        description: 'Only employees physically at Terminal Headquarters with authorized staff badges can access BigQuery.'
      },
      {
        id: 'ing-2',
        name: 'Ground Crew Automated Tug',
        metaphorLabel: 'Tarmac Maintenance Badge',
        identityType: 'SERVICE_ACCOUNT',
        identities: ['serviceAccount:runway-loader@production-ops-55.iam.gserviceaccount.com'],
        allowedIps: ['10.128.0.0/20'],
        description: 'Internal automation service account loading daily passenger manifests into Cloud Storage.'
      }
    ],
    egressRules: [
      {
        id: 'egr-1',
        name: 'Baggage Claim Reclaim Only',
        metaphorLabel: 'Domestic Baggage Carousel',
        targetProjects: ['production-ops-55'],
        targetServices: ['storage.googleapis.com'],
        allowedIdentities: ['serviceAccount:runway-loader@production-ops-55.iam.gserviceaccount.com'],
        description: 'Data can only be moved inside internal projects; no external passenger baggage transfer permitted.'
      }
    ]
  },
  {
    id: 'hub-and-bridge',
    name: 'The Hub & Bridge',
    title: 'The Hub & Bridge (Interline Perimeter Transfer)',
    description: 'Two isolated concourses (Data Science Lab & Production Flight Hub) sharing flight telemetries across a secure customs skybridge.',
    accessPolicyId: '849201934812',
    perimeterType: 'BRIDGE',
    enforcementMode: 'ENFORCED',
    projects: ['data-science-hangar-02', 'production-ops-55', 'avionics-core-77'],
    restrictedServices: [
      'bigquery.googleapis.com',
      'storage.googleapis.com',
      'aiplatform.googleapis.com',
      'pubsub.googleapis.com'
    ],
    ingressRules: [
      {
        id: 'ing-hub-1',
        name: 'Data Science Concourse Skybridge',
        metaphorLabel: 'Inter-Terminal Skybridge Gate',
        identityType: 'SELECTED_IDENTITIES',
        identities: [
          'user:chief-scientist@aerosc-airline.internal',
          'serviceAccount:ml-pipeline@data-science-hangar-02.iam.gserviceaccount.com'
        ],
        allowedIps: ['10.200.0.0/16', '192.168.42.0/24'],
        sourceProjects: ['data-science-hangar-02'],
        description: 'Permits AI researchers on the secure lab network to train ML models on BigQuery passenger data.'
      },
      {
        id: 'ing-hub-2',
        name: 'Air Traffic Control Ingest',
        metaphorLabel: 'Radar Stream Checkpoint',
        identityType: 'SERVICE_ACCOUNT',
        identities: ['serviceAccount:atc-beacon@avionics-core-77.iam.gserviceaccount.com'],
        allowedIps: ['172.16.0.0/12'],
        description: 'Pub/Sub telemetry events stream in continuously from avionics controllers.'
      }
    ],
    egressRules: [
      {
        id: 'egr-hub-1',
        name: 'Interline Baggage Transfer',
        metaphorLabel: 'Customs Interline Jetbridge',
        targetProjects: ['production-ops-55', 'data-science-hangar-02'],
        targetServices: ['bigquery.googleapis.com', 'storage.googleapis.com'],
        allowedIdentities: ['serviceAccount:ml-pipeline@data-science-hangar-02.iam.gserviceaccount.com'],
        description: 'Allows trained model artifacts to be deposited back into the Production Vault.'
      }
    ]
  },
  {
    id: 'international-cargo',
    name: 'International Secure Cargo',
    title: 'International Secure Cargo (Air-Gapped Maximum Lockdown)',
    description: 'Zero direct human access; hermetically sealed cargo vault accessible only by hardened backend service accounts and certified IP tunnels.',
    accessPolicyId: '849201934812',
    perimeterType: 'REGULAR',
    enforcementMode: 'ENFORCED',
    projects: ['vault-cargo-alpha-99', 'financial-clearing-88'],
    restrictedServices: [
      'bigquery.googleapis.com',
      'storage.googleapis.com',
      'sqladmin.googleapis.com',
      'secretmanager.googleapis.com',
      'logging.googleapis.com'
    ],
    ingressRules: [
      {
        id: 'ing-cargo-1',
        name: 'Biometric Armored Truck Ramp',
        metaphorLabel: 'Armed Cargo Checkpoint',
        identityType: 'SERVICE_ACCOUNT',
        identities: [
          'serviceAccount:vault-daemon@financial-clearing-88.iam.gserviceaccount.com',
          'serviceAccount:swift-clearing-bot@vault-cargo-alpha-99.iam.gserviceaccount.com'
        ],
        allowedIps: ['10.150.4.12/32', '10.150.4.13/32'],
        description: 'Strict point-to-point dedicated micro-tunnels for financial transactions. Zero humans allowed.'
      }
    ],
    egressRules: [
      {
        id: 'egr-cargo-1',
        name: 'No External Export Allowed',
        metaphorLabel: 'Quarantine Seal (Zero Egress)',
        targetProjects: ['vault-cargo-alpha-99'],
        targetServices: ['secretmanager.googleapis.com'],
        allowedIdentities: ['serviceAccount:vault-daemon@financial-clearing-88.iam.gserviceaccount.com'],
        description: 'Strictly zero egress to any external project or internet destination.'
      }
    ]
  }
];
