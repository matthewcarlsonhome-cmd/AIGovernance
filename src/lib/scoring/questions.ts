import type { AssessmentQuestion } from '@/types';

/**
 * Complete question bank for the AI Governance Feasibility Assessment.
 *
 * Questions are organised by domain and scored to feed the feasibility engine.
 * Each question carries a weight (importance within its domain) and an optional
 * scoring map that translates answer values to a 0-100 numeric score.
 */
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // =========================================================================
  // INFRASTRUCTURE READINESS  (6 questions)
  // =========================================================================
  {
    id: 'infra-001',
    section: 'Infrastructure Readiness',
    domain: 'infrastructure',
    text: 'Which cloud provider(s) does your organization primarily use for development workloads?',
    type: 'single_select',
    options: ['AWS', 'Google Cloud', 'Microsoft Azure', 'Multi-cloud', 'On-premises only', 'None / not established'],
    weight: 10,
    scoring: {
      'AWS': 90,
      'Google Cloud': 90,
      'Microsoft Azure': 90,
      'Multi-cloud': 80,
      'On-premises only': 50,
      'None / not established': 10,
    },
    help_text: 'AI coding tools often require cloud-hosted API access. Cloud-native environments simplify sandbox setup.',
    required: true,
    order: 1,
  },
  {
    id: 'infra-002',
    section: 'Infrastructure Readiness',
    domain: 'infrastructure',
    text: 'Is your development network segmented from production and corporate networks?',
    type: 'single_select',
    options: ['Yes, fully segmented with firewall rules', 'Partially segmented', 'No segmentation', 'Unsure'],
    weight: 10,
    scoring: {
      'Yes, fully segmented with firewall rules': 100,
      'Partially segmented': 60,
      'No segmentation': 20,
      'Unsure': 10,
    },
    help_text: 'Network segmentation is critical for isolating AI sandbox traffic from sensitive systems.',
    required: true,
    order: 2,
  },
  {
    id: 'infra-003',
    section: 'Infrastructure Readiness',
    domain: 'infrastructure',
    text: 'Do you use a forward proxy or API gateway to control outbound developer traffic?',
    type: 'single_select',
    options: ['Yes, with allowlist/blocklist capabilities', 'Yes, basic proxy without granular controls', 'No proxy in place', 'Unsure'],
    weight: 8,
    scoring: {
      'Yes, with allowlist/blocklist capabilities': 100,
      'Yes, basic proxy without granular controls': 60,
      'No proxy in place': 20,
      'Unsure': 10,
    },
    help_text: 'A forward proxy enables you to control which AI model endpoints developers can reach and log all traffic.',
    required: true,
    order: 3,
  },
  {
    id: 'infra-004',
    section: 'Infrastructure Readiness',
    domain: 'infrastructure',
    text: 'What developer environment model do you primarily use?',
    type: 'single_select',
    options: ['Cloud-based (GitHub Codespaces, Gitpod, etc.)', 'Containers (Docker/devcontainers)', 'VDI / managed desktops', 'Local machines (unmanaged)', 'Mixed'],
    weight: 8,
    scoring: {
      'Cloud-based (GitHub Codespaces, Gitpod, etc.)': 100,
      'Containers (Docker/devcontainers)': 90,
      'VDI / managed desktops': 70,
      'Local machines (unmanaged)': 30,
      'Mixed': 60,
    },
    help_text: 'Cloud or container-based environments provide better isolation and control for AI tool sandboxes.',
    required: true,
    order: 4,
  },
  {
    id: 'infra-005',
    section: 'Infrastructure Readiness',
    domain: 'infrastructure',
    text: 'Do you use an artifact/package manager proxy (e.g., Artifactory, Nexus) for dependency management?',
    type: 'single_select',
    options: ['Yes, all dependencies are proxied and scanned', 'Yes, but not all languages/ecosystems are covered', 'No, developers pull directly from public registries', 'Unsure'],
    weight: 7,
    scoring: {
      'Yes, all dependencies are proxied and scanned': 100,
      'Yes, but not all languages/ecosystems are covered': 65,
      'No, developers pull directly from public registries': 25,
      'Unsure': 10,
    },
    help_text: 'Package proxies help control and audit dependencies that AI tools may suggest or install.',
    required: true,
    order: 5,
  },
  {
    id: 'infra-006',
    section: 'Infrastructure Readiness',
    domain: 'infrastructure',
    text: 'Do you use Infrastructure-as-Code (IaC) for provisioning environments?',
    type: 'single_select',
    options: ['Yes, fully (Terraform, Pulumi, CloudFormation, etc.)', 'Partially - some resources are IaC-managed', 'No, manual provisioning', 'Unsure'],
    weight: 7,
    scoring: {
      'Yes, fully (Terraform, Pulumi, CloudFormation, etc.)': 100,
      'Partially - some resources are IaC-managed': 60,
      'No, manual provisioning': 20,
      'Unsure': 10,
    },
    help_text: 'IaC enables repeatable, auditable sandbox environment creation.',
    required: true,
    order: 6,
  },

  // =========================================================================
  // SECURITY POSTURE  (6 questions)
  // =========================================================================
  {
    id: 'sec-001',
    section: 'Security Posture',
    domain: 'security',
    text: 'Has your organization completed a data classification exercise for source code repositories?',
    type: 'single_select',
    options: ['Yes, all repos are classified', 'Partially - some repos classified', 'No data classification for code', 'Unsure'],
    weight: 10,
    scoring: {
      'Yes, all repos are classified': 100,
      'Partially - some repos classified': 55,
      'No data classification for code': 15,
      'Unsure': 5,
    },
    help_text: 'Data classification determines which repositories are safe for AI tool access and which require additional controls.',
    required: true,
    order: 7,
  },
  {
    id: 'sec-002',
    section: 'Security Posture',
    domain: 'security',
    text: 'Do you have Data Loss Prevention (DLP) controls that can monitor AI tool interactions?',
    type: 'single_select',
    options: ['Yes, DLP with AI/ML-specific rules', 'Yes, general DLP but no AI-specific rules', 'DLP exists but not applicable to dev tools', 'No DLP in place'],
    weight: 10,
    scoring: {
      'Yes, DLP with AI/ML-specific rules': 100,
      'Yes, general DLP but no AI-specific rules': 60,
      'DLP exists but not applicable to dev tools': 30,
      'No DLP in place': 10,
    },
    help_text: 'DLP prevents sensitive data (PII, secrets, proprietary code) from being sent to external AI models.',
    required: true,
    order: 8,
  },
  {
    id: 'sec-003',
    section: 'Security Posture',
    domain: 'security',
    text: 'Do you have a SIEM or centralized logging platform that could ingest AI tool audit logs?',
    type: 'single_select',
    options: ['Yes, with capacity for new log sources', 'Yes, but at capacity or limited ingestion', 'No centralized logging', 'Unsure'],
    weight: 8,
    scoring: {
      'Yes, with capacity for new log sources': 100,
      'Yes, but at capacity or limited ingestion': 55,
      'No centralized logging': 15,
      'Unsure': 10,
    },
    help_text: 'Centralized logging is essential for monitoring AI tool usage, detecting anomalies, and meeting audit requirements.',
    required: true,
    order: 9,
  },
  {
    id: 'sec-004',
    section: 'Security Posture',
    domain: 'security',
    text: 'How does your organization manage secrets (API keys, tokens, credentials) in development?',
    type: 'single_select',
    options: ['Centralized vault (HashiCorp Vault, AWS Secrets Manager, etc.)', 'Environment variables with some controls', 'Mixed / inconsistent approaches', 'Secrets often found in code or config files'],
    weight: 9,
    scoring: {
      'Centralized vault (HashiCorp Vault, AWS Secrets Manager, etc.)': 100,
      'Environment variables with some controls': 60,
      'Mixed / inconsistent approaches': 30,
      'Secrets often found in code or config files': 5,
    },
    help_text: 'AI tools process code context. Poor secrets management means credentials may be sent to external AI models.',
    required: true,
    order: 10,
  },
  {
    id: 'sec-005',
    section: 'Security Posture',
    domain: 'security',
    text: 'Does your organization have existing policies that address AI or machine learning tool usage?',
    type: 'single_select',
    options: ['Yes, comprehensive AI/ML security policy', 'Yes, basic guidelines exist', 'No, but general software policies could extend', 'No policies addressing AI'],
    weight: 7,
    scoring: {
      'Yes, comprehensive AI/ML security policy': 100,
      'Yes, basic guidelines exist': 65,
      'No, but general software policies could extend': 35,
      'No policies addressing AI': 10,
    },
    help_text: 'Pre-existing AI policies accelerate governance setup and demonstrate organizational maturity.',
    required: true,
    order: 11,
  },
  {
    id: 'sec-006',
    section: 'Security Posture',
    domain: 'security',
    text: 'Do you have an incident response plan that could be extended to cover AI-related security events?',
    type: 'single_select',
    options: ['Yes, mature IR plan easily extensible', 'Yes, but would need significant updates', 'Basic IR process, not formalized', 'No incident response plan'],
    weight: 6,
    scoring: {
      'Yes, mature IR plan easily extensible': 100,
      'Yes, but would need significant updates': 55,
      'Basic IR process, not formalized': 25,
      'No incident response plan': 5,
    },
    help_text: 'AI tools introduce new incident vectors (data leaks, IP contamination). Your IR plan should account for these.',
    required: true,
    order: 12,
  },

  // =========================================================================
  // GOVERNANCE MATURITY  (6 questions)
  // =========================================================================
  {
    id: 'gov-001',
    section: 'Governance Maturity',
    domain: 'governance',
    text: 'Does your organization have an Acceptable Use Policy (AUP) for developer tools?',
    type: 'single_select',
    options: ['Yes, comprehensive and regularly updated', 'Yes, but outdated or narrow in scope', 'No, but willing to create one', 'No, and no plans to create one'],
    weight: 10,
    scoring: {
      'Yes, comprehensive and regularly updated': 100,
      'Yes, but outdated or narrow in scope': 55,
      'No, but willing to create one': 35,
      'No, and no plans to create one': 5,
    },
    branches: {
      'No, and no plans to create one': ['gov-001-blocker'],
    },
    help_text: 'An AUP is the foundational governance document for AI tool adoption.',
    required: true,
    order: 13,
  },
  {
    id: 'gov-002',
    section: 'Governance Maturity',
    domain: 'governance',
    text: 'Which compliance frameworks does your organization adhere to?',
    type: 'multi_select',
    options: ['SOC 2', 'HIPAA', 'NIST CSF', 'GDPR', 'ISO 27001', 'PCI DSS', 'FedRAMP', 'None'],
    weight: 8,
    scoring: {
      'SOC 2': 80,
      'HIPAA': 85,
      'NIST CSF': 85,
      'GDPR': 80,
      'ISO 27001': 90,
      'PCI DSS': 80,
      'FedRAMP': 90,
      'None': 10,
    },
    help_text: 'Existing compliance frameworks provide a structure onto which AI governance controls can be mapped.',
    required: true,
    order: 14,
  },
  {
    id: 'gov-003',
    section: 'Governance Maturity',
    domain: 'governance',
    text: 'Do you have a formal vendor risk assessment process?',
    type: 'single_select',
    options: ['Yes, mature process with regular reviews', 'Yes, basic questionnaire-based process', 'Informal / ad-hoc', 'No vendor risk process'],
    weight: 7,
    scoring: {
      'Yes, mature process with regular reviews': 100,
      'Yes, basic questionnaire-based process': 65,
      'Informal / ad-hoc': 30,
      'No vendor risk process': 10,
    },
    help_text: 'AI tool vendors (Anthropic, OpenAI) must be assessed for data handling, availability, and contractual terms.',
    required: true,
    order: 15,
  },
  {
    id: 'gov-004',
    section: 'Governance Maturity',
    domain: 'governance',
    text: 'How does your organization manage change for new tool introductions?',
    type: 'single_select',
    options: ['Formal change advisory board (CAB) process', 'Lightweight change request process', 'Team-level decisions with manager approval', 'No formal process'],
    weight: 7,
    scoring: {
      'Formal change advisory board (CAB) process': 100,
      'Lightweight change request process': 70,
      'Team-level decisions with manager approval': 40,
      'No formal process': 15,
    },
    help_text: 'AI tool adoption is a significant change requiring stakeholder alignment and phased rollout.',
    required: true,
    order: 16,
  },
  {
    id: 'gov-005',
    section: 'Governance Maturity',
    domain: 'governance',
    text: 'Has your organization previously evaluated or piloted any AI coding assistants?',
    type: 'single_select',
    options: ['Yes, completed a structured pilot', 'Yes, informal/shadow usage exists', 'No, but leadership is interested', 'No, and there is resistance'],
    weight: 5,
    scoring: {
      'Yes, completed a structured pilot': 100,
      'Yes, informal/shadow usage exists': 50,
      'No, but leadership is interested': 40,
      'No, and there is resistance': 10,
    },
    branches: {
      'Yes, informal/shadow usage exists': ['gov-005-shadow'],
    },
    help_text: 'Prior experience with AI tools (even informal) provides valuable baseline data.',
    required: true,
    order: 17,
  },
  {
    id: 'gov-006',
    section: 'Governance Maturity',
    domain: 'governance',
    text: 'Does your organization have a defined intellectual property (IP) policy for code contributions?',
    type: 'single_select',
    options: ['Yes, clear IP ownership and licensing terms', 'Yes, but does not address AI-generated code', 'No formal IP policy', 'Unsure'],
    weight: 6,
    scoring: {
      'Yes, clear IP ownership and licensing terms': 100,
      'Yes, but does not address AI-generated code': 50,
      'No formal IP policy': 15,
      'Unsure': 10,
    },
    help_text: 'AI-generated code raises IP ownership questions that must be addressed in policy.',
    required: true,
    order: 18,
  },

  // =========================================================================
  // ENGINEERING CULTURE  (6 questions)
  // =========================================================================
  {
    id: 'eng-001',
    section: 'Engineering Culture',
    domain: 'engineering',
    text: 'What is the maturity of your CI/CD pipelines?',
    type: 'single_select',
    options: ['Fully automated with quality gates', 'Automated build and test, manual deploy', 'Partial automation', 'Mostly manual processes'],
    weight: 10,
    scoring: {
      'Fully automated with quality gates': 100,
      'Automated build and test, manual deploy': 70,
      'Partial automation': 40,
      'Mostly manual processes': 10,
    },
    help_text: 'Mature CI/CD ensures AI-generated code goes through the same quality checks as human-written code.',
    required: true,
    order: 19,
  },
  {
    id: 'eng-002',
    section: 'Engineering Culture',
    domain: 'engineering',
    text: 'Is code review mandatory for all changes merged to main/production branches?',
    type: 'single_select',
    options: ['Yes, enforced via branch protection', 'Yes, by convention but not enforced', 'For most changes, with exceptions', 'No mandatory code review'],
    weight: 9,
    scoring: {
      'Yes, enforced via branch protection': 100,
      'Yes, by convention but not enforced': 65,
      'For most changes, with exceptions': 45,
      'No mandatory code review': 10,
    },
    help_text: 'Code review is the primary human oversight mechanism for AI-generated code quality and security.',
    required: true,
    order: 20,
  },
  {
    id: 'eng-003',
    section: 'Engineering Culture',
    domain: 'engineering',
    text: 'What is your approximate automated test coverage?',
    type: 'single_select',
    options: ['Above 80%', '60-80%', '40-60%', 'Below 40%', 'Unknown / not measured'],
    weight: 8,
    scoring: {
      'Above 80%': 100,
      '60-80%': 75,
      '40-60%': 50,
      'Below 40%': 25,
      'Unknown / not measured': 10,
    },
    help_text: 'Automated tests catch regressions from AI-generated code before they reach production.',
    required: true,
    order: 21,
  },
  {
    id: 'eng-004',
    section: 'Engineering Culture',
    domain: 'engineering',
    text: 'How would you describe your development team\'s openness to AI coding tools?',
    type: 'single_select',
    options: ['Enthusiastic - developers are already requesting access', 'Curious - open to trying with guidance', 'Neutral - will use if mandated', 'Skeptical - significant resistance expected'],
    weight: 6,
    scoring: {
      'Enthusiastic - developers are already requesting access': 100,
      'Curious - open to trying with guidance': 75,
      'Neutral - will use if mandated': 40,
      'Skeptical - significant resistance expected': 15,
    },
    help_text: 'Developer buy-in is a strong predictor of successful AI tool adoption.',
    required: true,
    order: 22,
  },
  {
    id: 'eng-005',
    section: 'Engineering Culture',
    domain: 'engineering',
    text: 'How large is the engineering team that would initially use AI coding tools?',
    type: 'single_select',
    options: ['1-10 developers', '11-50 developers', '51-200 developers', '200+ developers'],
    weight: 4,
    scoring: {
      '1-10 developers': 80,
      '11-50 developers': 90,
      '51-200 developers': 70,
      '200+ developers': 50,
    },
    help_text: 'Smaller initial cohorts are easier to manage for pilots. Very large groups need more governance controls.',
    required: true,
    order: 23,
  },
  {
    id: 'eng-006',
    section: 'Engineering Culture',
    domain: 'engineering',
    text: 'Do your teams use static analysis or code quality tools (SonarQube, CodeClimate, etc.)?',
    type: 'single_select',
    options: ['Yes, integrated into CI with quality gates', 'Yes, available but not enforced', 'Occasionally / ad-hoc', 'No static analysis tools'],
    weight: 6,
    scoring: {
      'Yes, integrated into CI with quality gates': 100,
      'Yes, available but not enforced': 60,
      'Occasionally / ad-hoc': 30,
      'No static analysis tools': 10,
    },
    help_text: 'Static analysis tools help verify the quality and security of AI-generated code automatically.',
    required: true,
    order: 24,
  },

  // =========================================================================
  // BUSINESS ALIGNMENT  (6 questions)
  // =========================================================================
  {
    id: 'biz-001',
    section: 'Business Alignment',
    domain: 'business',
    text: 'Is there an executive sponsor for AI coding tool adoption?',
    type: 'single_select',
    options: ['Yes, C-level or VP with allocated budget', 'Yes, director-level champion', 'Informal interest from leadership', 'No executive sponsorship'],
    weight: 10,
    scoring: {
      'Yes, C-level or VP with allocated budget': 100,
      'Yes, director-level champion': 70,
      'Informal interest from leadership': 35,
      'No executive sponsorship': 5,
    },
    branches: {
      'No executive sponsorship': ['biz-001-blocker'],
    },
    help_text: 'Executive sponsorship is the single strongest predictor of successful enterprise AI adoption.',
    required: true,
    order: 25,
  },
  {
    id: 'biz-002',
    section: 'Business Alignment',
    domain: 'business',
    text: 'What are the primary business outcomes you expect from AI coding tools?',
    type: 'multi_select',
    options: [
      'Developer productivity improvement',
      'Faster time-to-market',
      'Reduced development costs',
      'Improved code quality',
      'Developer satisfaction and retention',
      'Competitive advantage',
      'Not clearly defined yet',
    ],
    weight: 8,
    scoring: {
      'Developer productivity improvement': 80,
      'Faster time-to-market': 80,
      'Reduced development costs': 75,
      'Improved code quality': 85,
      'Developer satisfaction and retention': 75,
      'Competitive advantage': 70,
      'Not clearly defined yet': 15,
    },
    help_text: 'Clearly defined outcomes allow you to measure pilot success and build a compelling ROI case.',
    required: true,
    order: 26,
  },
  {
    id: 'biz-003',
    section: 'Business Alignment',
    domain: 'business',
    text: 'Is there a dedicated budget allocated for AI tool evaluation and deployment?',
    type: 'single_select',
    options: ['Yes, formal budget approved', 'Budget available but not formally allocated', 'Would need to request budget', 'No budget and unlikely to be approved'],
    weight: 8,
    scoring: {
      'Yes, formal budget approved': 100,
      'Budget available but not formally allocated': 65,
      'Would need to request budget': 30,
      'No budget and unlikely to be approved': 5,
    },
    help_text: 'Budget includes tool licensing, infrastructure costs, training, and consulting fees.',
    required: true,
    order: 27,
  },
  {
    id: 'biz-004',
    section: 'Business Alignment',
    domain: 'business',
    text: 'What is your target timeline for moving from evaluation to production deployment?',
    type: 'single_select',
    options: ['1-3 months (aggressive)', '3-6 months (standard)', '6-12 months (conservative)', 'No defined timeline'],
    weight: 5,
    scoring: {
      '1-3 months (aggressive)': 60,
      '3-6 months (standard)': 100,
      '6-12 months (conservative)': 80,
      'No defined timeline': 20,
    },
    help_text: '3-6 months is typical for a structured evaluation-to-production timeline. Overly aggressive timelines increase risk.',
    required: true,
    order: 28,
  },
  {
    id: 'biz-005',
    section: 'Business Alignment',
    domain: 'business',
    text: 'How would you describe your organization\'s risk appetite for adopting new developer technologies?',
    type: 'single_select',
    options: ['Innovator - early adopter of emerging tech', 'Fast follower - adopt after initial market validation', 'Mainstream - adopt when widely proven', 'Conservative - adopt only when necessary'],
    weight: 5,
    scoring: {
      'Innovator - early adopter of emerging tech': 90,
      'Fast follower - adopt after initial market validation': 85,
      'Mainstream - adopt when widely proven': 55,
      'Conservative - adopt only when necessary': 25,
    },
    help_text: 'Risk appetite influences the pace and scope of the governance framework required.',
    required: true,
    order: 29,
  },
  {
    id: 'biz-006',
    section: 'Business Alignment',
    domain: 'business',
    text: 'Does your organization have a broader AI/ML strategy that AI coding tools would align with?',
    type: 'single_select',
    options: ['Yes, formal AI strategy with coding tools included', 'Yes, AI strategy exists but does not cover developer tools', 'AI strategy is under development', 'No AI strategy'],
    weight: 6,
    scoring: {
      'Yes, formal AI strategy with coding tools included': 100,
      'Yes, AI strategy exists but does not cover developer tools': 60,
      'AI strategy is under development': 40,
      'No AI strategy': 15,
    },
    help_text: 'Alignment with a broader AI strategy provides institutional support and shared governance infrastructure.',
    required: true,
    order: 30,
  },
];

/**
 * Return questions filtered by domain.
 */
export function getQuestionsByDomain(domain: string): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS.filter((q) => q.domain === domain);
}

/**
 * Return questions filtered by section name.
 */
export function getQuestionsBySection(section: string): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS.filter((q) => q.section === section);
}

/**
 * Return unique section names in display order.
 */
export function getSections(): string[] {
  const seen = new Set<string>();
  const sections: string[] = [];
  for (const q of ASSESSMENT_QUESTIONS) {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      sections.push(q.section);
    }
  }
  return sections;
}

/**
 * Return a single question by ID.
 */
export function getQuestionById(id: string): AssessmentQuestion | undefined {
  return ASSESSMENT_QUESTIONS.find((q) => q.id === id);
}
