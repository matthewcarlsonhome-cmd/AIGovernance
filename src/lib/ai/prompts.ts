/**
 * Typed prompt templates for AI-assisted content generation.
 *
 * Each template provides a system prompt that shapes Claude's persona and a
 * `buildUserMessage` helper that interpolates the caller-provided context into
 * a structured user message.  The API route (`/api/ai`) selects the template
 * by `type` and forwards the built messages to the Anthropic Messages API.
 */

export type PromptType =
  | 'policy_draft'
  | 'report_narrative'
  | 'meeting_summary'
  | 'risk_assessment'
  | 'proposal_narrative';

export interface PromptTemplate {
  type: PromptType;
  /** System-level instruction that sets Claude's role and formatting rules. */
  system: string;
  /** Build a structured user message from the caller-provided context object. */
  buildUserMessage: (context: Record<string, unknown>) => string;
}

// ---------------------------------------------------------------------------
// Helper: safely extract string values from context
// ---------------------------------------------------------------------------

function str(context: Record<string, unknown>, key: string, fallback = ''): string {
  const v = context[key];
  if (typeof v === 'string') return v;
  if (v !== undefined && v !== null) return String(v);
  return fallback;
}

function strList(context: Record<string, unknown>, key: string): string[] {
  const v = context[key];
  if (Array.isArray(v)) return v.map((item) => String(item));
  return [];
}

function jsonBlock(context: Record<string, unknown>, key: string): string {
  const v = context[key];
  if (v === undefined || v === null) return '';
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const policyDraftTemplate: PromptTemplate = {
  type: 'policy_draft',
  system: `You are an expert AI governance consultant drafting organizational policies for enterprise AI coding tool adoption.
Write in formal, precise policy language appropriate for corporate governance documents.
Include clear definitions, scope statements, and actionable requirements.
Structure the output with numbered sections and subsections.
Focus on practical, enforceable policy language that aligns with SOC 2, HIPAA, NIST, and GDPR frameworks where applicable.
When compliance frameworks are specified, explicitly map policy clauses to the relevant controls.
Use the organization details and context provided to personalize the policy.`,

  buildUserMessage(context) {
    const orgName = str(context, 'organization_name', 'the organization');
    const policyType = str(context, 'policy_type', 'Acceptable Use Policy');
    const industry = str(context, 'industry');
    const orgSize = str(context, 'organization_size');
    const frameworks = strList(context, 'compliance_frameworks');
    const additionalReqs = str(context, 'additional_requirements');
    const existingContent = str(context, 'existing_content');
    const prompt = str(context, 'prompt');

    const parts: string[] = [];

    parts.push(`Organization: ${orgName}`);
    parts.push(`Policy Type: ${policyType}`);
    if (industry) parts.push(`Industry: ${industry}`);
    if (orgSize) parts.push(`Organization Size: ${orgSize}`);
    if (frameworks.length > 0) parts.push(`Compliance Frameworks: ${frameworks.join(', ')}`);

    if (existingContent) {
      parts.push(`\nExisting Content to Revise:\n---\n${existingContent}\n---`);
    }

    if (additionalReqs) {
      parts.push(`\nAdditional Requirements:\n${additionalReqs}`);
    }

    if (prompt) {
      parts.push(`\nSpecific Request:\n${prompt}`);
    }

    return parts.join('\n');
  },
};

const reportNarrativeTemplate: PromptTemplate = {
  type: 'report_narrative',
  system: `You are an expert AI governance consultant writing report sections for stakeholders evaluating AI coding tool adoption.
Write in clear, professional language appropriate for the specified audience.
Support claims with data points when provided in context.
Include executive-appropriate summaries and actionable recommendations.
Structure content with clear headings and bullet points for readability.
When feasibility scores are provided, interpret them and explain what they mean for the organization.
Tailor language complexity and focus areas to the target persona (executive, legal, IT, engineering, marketing).`,

  buildUserMessage(context) {
    const persona = str(context, 'persona', 'executive');
    const projectName = str(context, 'project_name');
    const orgName = str(context, 'organization_name');
    const scores = jsonBlock(context, 'feasibility_scores');
    const domainData = jsonBlock(context, 'domain_data');
    const recommendations = strList(context, 'recommendations');
    const sectionTitle = str(context, 'section_title');
    const prompt = str(context, 'prompt');

    const parts: string[] = [];

    parts.push(`Target Audience: ${persona}`);
    if (projectName) parts.push(`Project: ${projectName}`);
    if (orgName) parts.push(`Organization: ${orgName}`);
    if (sectionTitle) parts.push(`Report Section: ${sectionTitle}`);

    if (scores) {
      parts.push(`\nFeasibility Scores:\n${scores}`);
    }
    if (domainData) {
      parts.push(`\nDomain Assessment Data:\n${domainData}`);
    }
    if (recommendations.length > 0) {
      parts.push(`\nKey Recommendations:\n${recommendations.map((r) => `- ${r}`).join('\n')}`);
    }

    if (prompt) {
      parts.push(`\nSpecific Request:\n${prompt}`);
    }

    return parts.join('\n');
  },
};

const meetingSummaryTemplate: PromptTemplate = {
  type: 'meeting_summary',
  system: `You are an expert AI governance consultant summarizing meeting notes.
Produce a structured summary with the following sections:
1. Key Decisions - numbered list of decisions made
2. Action Items - who, what, and by when (formatted as a table if possible)
3. Open Questions - unresolved topics requiring follow-up
4. Risk Items - any risks or concerns raised during the meeting
5. Next Steps - planned activities and timeline
Be concise but comprehensive. Attribute actions and decisions to specific participants when mentioned.
Use professional, clear language suitable for distribution to all attendees and stakeholders.`,

  buildUserMessage(context) {
    const meetingTitle = str(context, 'meeting_title');
    const meetingDate = str(context, 'meeting_date');
    const meetingType = str(context, 'meeting_type');
    const attendees = strList(context, 'attendees');
    const rawNotes = str(context, 'notes');
    const projectName = str(context, 'project_name');
    const prompt = str(context, 'prompt');

    const parts: string[] = [];

    if (meetingTitle) parts.push(`Meeting: ${meetingTitle}`);
    if (meetingDate) parts.push(`Date: ${meetingDate}`);
    if (meetingType) parts.push(`Type: ${meetingType}`);
    if (projectName) parts.push(`Project: ${projectName}`);
    if (attendees.length > 0) parts.push(`Attendees: ${attendees.join(', ')}`);

    if (rawNotes) {
      parts.push(`\nRaw Meeting Notes:\n---\n${rawNotes}\n---`);
    }

    if (prompt) {
      parts.push(`\nAdditional Instructions:\n${prompt}`);
    }

    return parts.join('\n');
  },
};

const riskAssessmentTemplate: PromptTemplate = {
  type: 'risk_assessment',
  system: `You are an expert AI governance and risk management consultant analyzing organizational readiness for AI coding tool adoption.
Given assessment responses and organizational context, provide:
1. Risk tier classification (Critical, High, Medium, Low) for each identified risk area
2. Likelihood and impact scores (1-5 scale) with justification
3. Specific mitigation strategies for each risk
4. Overall risk posture summary
5. Priority remediation recommendations

Use industry-standard risk frameworks (NIST RMF, ISO 31000) as your foundation.
Be specific and actionable in your mitigation recommendations.
Structure output clearly with risk categories, scores, and recommendations.`,

  buildUserMessage(context) {
    const orgName = str(context, 'organization_name');
    const industry = str(context, 'industry');
    const assessmentResponses = jsonBlock(context, 'assessment_responses');
    const existingRisks = jsonBlock(context, 'existing_risks');
    const complianceFrameworks = strList(context, 'compliance_frameworks');
    const domainScores = jsonBlock(context, 'domain_scores');
    const prompt = str(context, 'prompt');

    const parts: string[] = [];

    if (orgName) parts.push(`Organization: ${orgName}`);
    if (industry) parts.push(`Industry: ${industry}`);
    if (complianceFrameworks.length > 0) {
      parts.push(`Compliance Requirements: ${complianceFrameworks.join(', ')}`);
    }

    if (domainScores) {
      parts.push(`\nFeasibility Domain Scores:\n${domainScores}`);
    }
    if (assessmentResponses) {
      parts.push(`\nAssessment Responses:\n${assessmentResponses}`);
    }
    if (existingRisks) {
      parts.push(`\nExisting Risk Classifications:\n${existingRisks}`);
    }

    if (prompt) {
      parts.push(`\nSpecific Analysis Request:\n${prompt}`);
    }

    return parts.join('\n');
  },
};

const proposalNarrativeTemplate: PromptTemplate = {
  type: 'proposal_narrative',
  system: `You are an expert AI governance consultant drafting proposals for AI coding tool adoption initiatives.
Write persuasive, data-informed content appropriate for executive and technical decision-makers.
Include a clear problem statement, proposed approach, expected outcomes, and resource requirements.
Structure the proposal with professional formatting including headers, bullet points, and summary tables where appropriate.
When ROI data is provided, incorporate it naturally into the business case narrative.
Tailor the proposal section to the specified section type (executive summary, technical approach, business case, timeline, etc.).`,

  buildUserMessage(context) {
    const orgName = str(context, 'organization_name');
    const projectName = str(context, 'project_name');
    const projectScope = str(context, 'project_scope');
    const sectionType = str(context, 'section_type', 'executive_summary');
    const teamSize = str(context, 'team_size');
    const timeline = str(context, 'timeline');
    const roiData = jsonBlock(context, 'roi_data');
    const feasibilityScores = jsonBlock(context, 'feasibility_scores');
    const toolSelection = str(context, 'tool_selection');
    const prompt = str(context, 'prompt');

    const parts: string[] = [];

    parts.push(`Proposal Section: ${sectionType}`);
    if (orgName) parts.push(`Organization: ${orgName}`);
    if (projectName) parts.push(`Project: ${projectName}`);
    if (projectScope) parts.push(`Scope: ${projectScope}`);
    if (teamSize) parts.push(`Team Size: ${teamSize}`);
    if (timeline) parts.push(`Timeline: ${timeline}`);
    if (toolSelection) parts.push(`Tool Selection: ${toolSelection}`);

    if (feasibilityScores) {
      parts.push(`\nFeasibility Assessment:\n${feasibilityScores}`);
    }
    if (roiData) {
      parts.push(`\nROI Analysis:\n${roiData}`);
    }

    if (prompt) {
      parts.push(`\nSpecific Request:\n${prompt}`);
    }

    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const PROMPT_TEMPLATES: Record<PromptType, PromptTemplate> = {
  policy_draft: policyDraftTemplate,
  report_narrative: reportNarrativeTemplate,
  meeting_summary: meetingSummaryTemplate,
  risk_assessment: riskAssessmentTemplate,
  proposal_narrative: proposalNarrativeTemplate,
};

/**
 * Retrieve a prompt template by type.
 * Returns undefined when the type is not recognised.
 */
export function getPromptTemplate(type: PromptType): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[type];
}
