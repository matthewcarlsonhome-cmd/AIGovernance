import type { Industry } from '@/types';

/**
 * Configuration shape for industry-specific governance defaults.
 */
interface IndustryConfig {
  industry: Industry;
  label: string;
  regulatory_frameworks: string[];
  key_risks: string[];
  special_considerations: string[];
}

/**
 * All supported industry values.
 */
export const INDUSTRIES: Industry[] = [
  'financial_services',
  'healthcare',
  'government',
  'technology',
  'manufacturing',
  'retail',
  'education',
  'other',
];

/**
 * Human-readable display names for each industry.
 */
export const INDUSTRY_LABELS: Record<Industry, string> = {
  financial_services: 'Financial Services',
  healthcare: 'Healthcare',
  government: 'Government',
  technology: 'Technology',
  manufacturing: 'Manufacturing',
  retail: 'Retail',
  education: 'Education',
  other: 'Other',
} satisfies Record<Industry, string>;

/**
 * Industry-specific configuration for regulatory frameworks, key risks,
 * and special considerations when deploying AI coding tools.
 *
 * Each configuration provides:
 * - `regulatory_frameworks`: Compliance standards relevant to the industry.
 * - `key_risks`: Primary risk areas for AI adoption in that sector.
 * - `special_considerations`: Additional governance or deployment notes.
 */
export const INDUSTRY_CONFIGS: Record<Industry, IndustryConfig> = {
  financial_services: {
    industry: 'financial_services',
    label: 'Financial Services',
    regulatory_frameworks: ['SOC2', 'GDPR', 'GLBA', 'FCRA', 'ECOA'],
    key_risks: [
      'Model risk management requirements (SR 11-7) apply to AI-generated code affecting financial decisions',
      'Fair lending and ECOA compliance when AI tools interact with credit or lending systems',
      'Data residency and cross-border transfer restrictions for financial data processed by AI models',
      'Audit trail requirements for AI-assisted code changes in regulated transaction systems',
    ],
    special_considerations: [
      'Ensure AI tool usage aligns with OCC and FFIEC guidance on model risk management',
      'Implement enhanced code review for AI-generated code touching financial calculations',
      'Maintain separation of duties between AI tool configuration and production deployment',
      'Consider SOX implications for AI-assisted changes to financial reporting systems',
    ],
  },
  healthcare: {
    industry: 'healthcare',
    label: 'Healthcare',
    regulatory_frameworks: ['HIPAA', 'HITECH', 'FDA', 'GDPR'],
    key_risks: [
      'PHI exposure risk when AI coding tools process or generate code handling patient data',
      'FDA regulatory requirements if AI-generated code is used in medical device software',
      'HIPAA minimum necessary standard may be violated by broad AI model context windows',
      'Business associate agreement requirements for AI tool vendors accessing ePHI',
    ],
    special_considerations: [
      'Classify all repositories by PHI exposure level before enabling AI coding tools',
      'Implement DLP controls that detect and block PHI in AI tool prompts and responses',
      'Evaluate whether AI-generated code in clinical systems triggers FDA SaMD classification',
      'Ensure AI tool vendors sign BAAs and meet HIPAA security rule requirements',
    ],
  },
  government: {
    industry: 'government',
    label: 'Government',
    regulatory_frameworks: ['FedRAMP', 'FISMA', 'NIST_AI_RMF'],
    key_risks: [
      'Transparency and explainability requirements for AI-assisted government systems',
      'FedRAMP authorization requirements for cloud-based AI coding tools',
      'FISMA compliance for AI tools accessing government information systems',
      'Public accountability concerns when AI tools contribute to citizen-facing services',
    ],
    special_considerations: [
      'Verify AI tool vendors hold appropriate FedRAMP authorization levels',
      'Implement NIST AI RMF practices for AI tool risk assessment and monitoring',
      'Ensure AI-generated code in government systems meets accessibility standards (Section 508)',
      'Maintain audit trails sufficient for congressional oversight and FOIA compliance',
    ],
  },
  technology: {
    industry: 'technology',
    label: 'Technology',
    regulatory_frameworks: ['SOC2', 'GDPR', 'CCPA'],
    key_risks: [
      'IP protection and trade secret exposure when proprietary code is sent to AI model providers',
      'Open-source license contamination from AI-generated code trained on copyleft codebases',
      'Competitive intelligence leakage through AI tool telemetry and usage data',
      'Supply chain security risks from AI-generated dependencies and code patterns',
    ],
    special_considerations: [
      'Evaluate AI tool data retention and training policies to protect proprietary code',
      'Implement license scanning for AI-generated code to detect copyleft contamination',
      'Consider self-hosted or air-gapped AI tool deployments for sensitive IP',
      'Establish clear IP ownership policies for AI-assisted code contributions',
    ],
  },
  manufacturing: {
    industry: 'manufacturing',
    label: 'Manufacturing',
    regulatory_frameworks: ['ISO_27001', 'NIST_CSF'],
    key_risks: [
      'Safety system integrity risks if AI-generated code affects industrial control systems (ICS/SCADA)',
      'Supply chain disruption from AI-generated code defects in manufacturing execution systems',
      'OT/IT convergence security risks when AI tools bridge operational and information technology',
      'Quality management system compliance when AI assists in production software development',
    ],
    special_considerations: [
      'Prohibit AI coding tool access to OT networks and safety-critical control systems',
      'Implement enhanced testing requirements for AI-generated code in MES and ERP integrations',
      'Ensure AI tool deployment aligns with IEC 62443 for industrial cybersecurity',
      'Maintain ISO 9001 documentation for AI-assisted development processes',
    ],
  },
  retail: {
    industry: 'retail',
    label: 'Retail',
    regulatory_frameworks: ['PCI_DSS', 'CCPA', 'GDPR'],
    key_risks: [
      'Customer data exposure when AI tools process code handling PII and payment information',
      'PCI DSS scope expansion if AI tools interact with cardholder data environments',
      'Consumer privacy regulation violations from AI-generated personalization or profiling code',
      'Brand reputation risks from AI-generated code defects in customer-facing applications',
    ],
    special_considerations: [
      'Isolate AI coding tool environments from PCI DSS cardholder data scope',
      'Implement CCPA and GDPR data subject rights in AI-generated customer data handling code',
      'Ensure AI-generated recommendation and personalization code includes bias testing',
      'Maintain PCI DSS segmentation when AI tools are deployed in retail environments',
    ],
  },
  education: {
    industry: 'education',
    label: 'Education',
    regulatory_frameworks: ['FERPA', 'COPPA', 'GDPR'],
    key_risks: [
      'Student data privacy violations when AI tools access education records protected by FERPA',
      'COPPA compliance risks if AI-generated code processes data from children under 13',
      'Academic integrity concerns when AI tools are used in educational platform development',
      'Accessibility compliance when AI-generated code affects student-facing applications',
    ],
    special_considerations: [
      'Classify all student data repositories and restrict AI tool access to non-FERPA systems',
      'Implement age-verification and parental consent workflows for AI features in K-12 platforms',
      'Ensure AI-generated educational content meets WCAG 2.1 AA accessibility standards',
      'Establish ethical guidelines for AI tool usage in academic assessment systems',
    ],
  },
  other: {
    industry: 'other',
    label: 'Other',
    regulatory_frameworks: ['SOC2', 'GDPR'],
    key_risks: [
      'General data privacy and protection risks when AI tools process sensitive information',
      'Intellectual property exposure through AI tool vendor data handling practices',
      'Operational risks from over-reliance on AI-generated code without adequate review',
      'Regulatory uncertainty as AI governance frameworks continue to evolve',
    ],
    special_considerations: [
      'Conduct a data classification exercise before enabling AI coding tools',
      'Establish a baseline AI governance policy aligned to emerging industry standards',
      'Implement code review requirements proportional to the sensitivity of affected systems',
      'Monitor evolving AI regulations (EU AI Act, NIST AI RMF) for applicability',
    ],
  },
} satisfies Record<Industry, IndustryConfig>;
