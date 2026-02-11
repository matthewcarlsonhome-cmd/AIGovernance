import type { ComplianceRequirement, RiskTier } from '@/types';

/**
 * Compliance Framework Data
 *
 * Pre-defined requirement sets for major regulatory frameworks relevant to
 * AI governance.  Each requirement is initialised with a `needs_review` status
 * so organisations can progressively assess their compliance posture.
 *
 * All data is static and the lookup function is a pure function with no
 * side effects.
 */

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function req(
  framework: string,
  index: number,
  article: string,
  requirement: string,
  priority: RiskTier = 'medium'
): ComplianceRequirement {
  const paddedIndex = String(index).padStart(3, '0');
  return {
    id: `${framework.toLowerCase().replace(/\s+/g, '-')}-${paddedIndex}`,
    framework,
    article,
    requirement,
    status: 'needs_review',
    evidence: null,
    gap: null,
    priority,
  };
}

// ---------------------------------------------------------------------------
// EU AI Act
// ---------------------------------------------------------------------------

/**
 * Key requirements from the EU Artificial Intelligence Act covering high-risk
 * AI system obligations.
 */
export const EU_AI_ACT_REQUIREMENTS: ComplianceRequirement[] = [
  req(
    'EU AI Act',
    1,
    'Art. 6',
    'Risk Classification: Classify AI systems according to their risk level (unacceptable, high, limited, minimal) and apply corresponding regulatory obligations.',
    'critical'
  ),
  req(
    'EU AI Act',
    2,
    'Art. 9',
    'Risk Management System: Establish and maintain a continuous, iterative risk management system throughout the AI system lifecycle, identifying and mitigating known and foreseeable risks.',
    'critical'
  ),
  req(
    'EU AI Act',
    3,
    'Art. 10',
    'Data Governance: Ensure training, validation, and testing datasets are relevant, representative, free of errors, and complete, with appropriate data governance and management practices.',
    'high'
  ),
  req(
    'EU AI Act',
    4,
    'Art. 11',
    'Technical Documentation: Maintain up-to-date technical documentation demonstrating compliance with AI Act requirements, prepared before the system is placed on the market or put into service.',
    'high'
  ),
  req(
    'EU AI Act',
    5,
    'Art. 12',
    'Record-Keeping: Design high-risk AI systems with automatic logging capabilities to ensure traceability of the system functioning throughout its lifecycle.',
    'high'
  ),
  req(
    'EU AI Act',
    6,
    'Art. 13',
    'Transparency: Design and develop high-risk AI systems to ensure their operation is sufficiently transparent to enable users to interpret and use the system output appropriately.',
    'high'
  ),
  req(
    'EU AI Act',
    7,
    'Art. 14',
    'Human Oversight: Design high-risk AI systems to allow effective human oversight, including the ability to fully understand, monitor, and intervene in the system operation.',
    'critical'
  ),
  req(
    'EU AI Act',
    8,
    'Art. 15',
    'Accuracy & Robustness: Ensure high-risk AI systems achieve appropriate levels of accuracy, robustness, and cybersecurity, and perform consistently throughout their lifecycle.',
    'high'
  ),
];

// ---------------------------------------------------------------------------
// GDPR
// ---------------------------------------------------------------------------

/**
 * Key requirements from the General Data Protection Regulation relevant to
 * AI systems processing personal data.
 */
export const GDPR_REQUIREMENTS: ComplianceRequirement[] = [
  req(
    'GDPR',
    1,
    'Art. 5',
    'Processing Principles: Ensure all personal data processed by AI systems adheres to lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity, and accountability.',
    'critical'
  ),
  req(
    'GDPR',
    2,
    'Art. 6',
    'Lawful Basis: Identify and document a valid legal basis (consent, contract, legal obligation, vital interests, public task, or legitimate interests) for each AI processing activity involving personal data.',
    'critical'
  ),
  req(
    'GDPR',
    3,
    'Art. 13-14',
    'Transparency: Provide clear, accessible information to data subjects about AI system processing, including purpose, legal basis, retention periods, and the existence of automated decision-making.',
    'high'
  ),
  req(
    'GDPR',
    4,
    'Art. 15-22',
    'Data Subject Rights: Implement mechanisms to honour data subject rights including access, rectification, erasure, restriction, portability, objection, and rights related to automated decision-making and profiling.',
    'high'
  ),
  req(
    'GDPR',
    5,
    'Art. 25',
    'Privacy by Design: Implement appropriate technical and organisational measures (pseudonymisation, data minimisation) at the design stage and by default in all AI systems processing personal data.',
    'high'
  ),
  req(
    'GDPR',
    6,
    'Art. 32',
    'Security Measures: Implement appropriate technical and organisational security measures for AI systems, including encryption, pseudonymisation, resilience, availability, and regular testing of security controls.',
    'high'
  ),
  req(
    'GDPR',
    7,
    'Art. 35',
    'DPIA: Conduct a Data Protection Impact Assessment for AI processing likely to result in high risk to individuals, including systematic profiling, large-scale processing of sensitive data, or public monitoring.',
    'critical'
  ),
];

// ---------------------------------------------------------------------------
// HIPAA
// ---------------------------------------------------------------------------

/**
 * Key requirements from the Health Insurance Portability and Accountability
 * Act relevant to AI systems handling protected health information (PHI).
 */
export const HIPAA_REQUIREMENTS: ComplianceRequirement[] = [
  req(
    'HIPAA',
    1,
    'Privacy Rule',
    'Ensure AI systems handling PHI comply with permitted uses and disclosures, minimum necessary standard, and individual rights under the HIPAA Privacy Rule (45 CFR Part 160 and Subparts A and E of Part 164).',
    'critical'
  ),
  req(
    'HIPAA',
    2,
    'Security Rule',
    'Implement administrative, physical, and technical safeguards for AI systems that create, receive, maintain, or transmit electronic PHI, including access controls, audit controls, integrity controls, and transmission security.',
    'critical'
  ),
  req(
    'HIPAA',
    3,
    'BAA',
    'Execute Business Associate Agreements with all AI tool vendors and cloud providers that access, process, or store PHI on behalf of the covered entity, ensuring contractual compliance obligations.',
    'critical'
  ),
  req(
    'HIPAA',
    4,
    'Minimum Necessary',
    'Limit PHI exposure to AI systems to the minimum necessary for the intended purpose, implementing role-based access controls, data masking, and de-identification where feasible.',
    'high'
  ),
  req(
    'HIPAA',
    5,
    'Breach Notification',
    'Establish breach notification procedures for AI-related incidents involving unsecured PHI, including individual notification within 60 days, HHS reporting, and media notification for breaches affecting 500+ individuals.',
    'high'
  ),
];

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * Retrieve the pre-defined requirement set for a given compliance framework.
 *
 * Supported framework identifiers (case-insensitive):
 * - `"EU AI Act"` / `"eu_ai_act"` / `"euaiact"`
 * - `"GDPR"` / `"gdpr"`
 * - `"HIPAA"` / `"hipaa"`
 *
 * Returns an empty array for unrecognised frameworks.
 *
 * @param framework - The framework identifier string.
 * @returns An array of ComplianceRequirement objects.
 */
export function getFrameworkRequirements(framework: string): ComplianceRequirement[] {
  const normalised = framework.toLowerCase().replace(/[\s_-]/g, '');

  if (normalised === 'euaiact') return EU_AI_ACT_REQUIREMENTS;
  if (normalised === 'gdpr') return GDPR_REQUIREMENTS;
  if (normalised === 'hipaa') return HIPAA_REQUIREMENTS;

  return [];
}
