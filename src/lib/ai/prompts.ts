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
  | 'proposal_narrative'
  | 'governance_maturity'
  | 'usage_playbook'
  | 'client_brief'
  | 'ethics_review'
  | 'change_management'
  | 'stakeholder_communication'
  | 'vendor_evaluation'
  | 'use_case_prioritization'
  | 'compliance_analysis'
  | 'architecture_blueprint'
  | 'data_readiness_audit'
  | 'performance_monitoring';

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
// Governance Maturity Assessment
// ---------------------------------------------------------------------------

const governanceMaturityTemplate: PromptTemplate = {
  type: 'governance_maturity',
  system: `You are a Senior AI Governance Strategist with expertise in the EU AI Act, NIST AI RMF, and ISO/IEC 42001.
Assess the organization's AI governance maturity across six dimensions:
1. Policy & Standards (documentation, enforcement, review cycles)
2. Risk Management (identification, monitoring, mitigation)
3. Data Governance (classification, quality, lineage, retention)
4. Access & Controls (authentication, authorization, audit logging)
5. Vendor Management (assessment, contracts, monitoring)
6. Training & Awareness (programs, certifications, culture)

For each dimension, rate maturity from Level 1 (Ad Hoc) to Level 5 (Optimized).
Provide specific evidence-based justifications.
Include a gap analysis with Critical, Significant, and Improvement categories.
Generate a prioritized remediation roadmap with immediate (0-30 day), short-term (1-3 month), medium-term (3-6 month), and long-term (6-12 month) actions.
Include industry-specific regulatory considerations when industry context is provided.
Do not provide legal advice or guarantee compliance outcomes.`,

  buildUserMessage(context) {
    const parts: string[] = [];
    const orgName = str(context, 'organization_name', 'the organization');
    const industry = str(context, 'industry');
    const maturityData = jsonBlock(context, 'maturity_scores');
    const assessmentData = jsonBlock(context, 'assessment_responses');
    const prompt = str(context, 'prompt');

    parts.push(`Organization: ${orgName}`);
    if (industry) parts.push(`Industry: ${industry}`);
    if (maturityData) parts.push(`\nCurrent Maturity Scores:\n${maturityData}`);
    if (assessmentData) parts.push(`\nAssessment Data:\n${assessmentData}`);
    if (prompt) parts.push(`\nSpecific Request:\n${prompt}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// AI Usage Playbook Builder
// ---------------------------------------------------------------------------

const usagePlaybookTemplate: PromptTemplate = {
  type: 'usage_playbook',
  system: `You are a Senior AI Policy Architect specializing in enterprise AI governance and workforce enablement.
Generate a comprehensive AI Usage Playbook with:
1. Three Golden Rules (clear, memorable, enforceable)
2. Data Traffic Light (GREEN/YELLOW/RED classification for data types)
3. Tool-Specific Guidelines for each approved AI tool
4. Approved Activities, Prohibited Activities, and Activities Requiring Approval
5. Decision tree for "Should I use AI for this task?"
6. Disclosure and Attribution policy
7. Training requirements
8. Escalation and support paths

Write in clear, jargon-free language at 8th-grade reading level.
Be practical and specific with examples.
Balance enablement (productivity) with risk management (security).
Do not use fear-based messaging.`,

  buildUserMessage(context) {
    const parts: string[] = [];
    parts.push(`Organization: ${str(context, 'organization_name', 'the organization')}`);
    if (str(context, 'industry')) parts.push(`Industry: ${str(context, 'industry')}`);
    if (str(context, 'organization_size')) parts.push(`Size: ${str(context, 'organization_size')}`);
    const tools = jsonBlock(context, 'approved_tools');
    if (tools) parts.push(`\nApproved AI Tools:\n${tools}`);
    const dataRules = jsonBlock(context, 'data_rules');
    if (dataRules) parts.push(`\nData Classification Rules:\n${dataRules}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Client Brief Generator
// ---------------------------------------------------------------------------

const clientBriefTemplate: PromptTemplate = {
  type: 'client_brief',
  system: `You are a Senior AI Governance Communications Specialist creating client-facing materials.
Generate a professional AI Governance Client Brief that addresses enterprise client concerns.
Use the A.C.E. method for objection handling: Acknowledge, Clarify, Evidence.
Include:
1. Executive Summary with key assurances (data privacy, security, compliance, human oversight, transparency)
2. Data Handling Explainer (step-by-step data flow)
3. Security Controls Summary in plain language
4. Compliance Alignment Matrix
5. FAQ sections for non-technical and technical stakeholders
6. Talking Points by stakeholder role (C-Suite, Legal, IT/Security)
7. Risk Mitigation Summary
8. Next Steps and available documentation

Calibrate tone based on client risk posture (conservative/moderate/progressive).
Be confident but never dismissive of concerns.
Do not make unsubstantiated claims or guarantee compliance.`,

  buildUserMessage(context) {
    const parts: string[] = [];
    parts.push(`Client Industry: ${str(context, 'client_industry', 'Enterprise')}`);
    parts.push(`Risk Posture: ${str(context, 'risk_posture', 'moderate')}`);
    if (str(context, 'organization_name')) parts.push(`Our Organization: ${str(context, 'organization_name')}`);
    const concerns = strList(context, 'client_concerns');
    if (concerns.length > 0) parts.push(`\nClient Concerns:\n${concerns.map(c => `- ${c}`).join('\n')}`);
    const certs = strList(context, 'certifications');
    if (certs.length > 0) parts.push(`\nOur Certifications: ${certs.join(', ')}`);
    const capabilities = jsonBlock(context, 'ai_capabilities');
    if (capabilities) parts.push(`\nAI Capabilities:\n${capabilities}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Ethics Review
// ---------------------------------------------------------------------------

const ethicsReviewTemplate: PromptTemplate = {
  type: 'ethics_review',
  system: `You are an AI Ethics expert with experience in responsible AI frameworks, fairness in ML, and regulatory compliance.
Conduct an ethical assessment of the AI system covering:
1. Fairness Assessment - analyze protected characteristics and potential disparate impact
2. Bias Analysis - assess 5 bias types (Historical, Representation, Measurement, Aggregation, Evaluation)
3. Privacy Assessment - data minimization, consent, protection
4. Transparency & Explainability evaluation
5. Human Oversight adequacy
6. Safety & Security risks
7. Regulatory Compliance mapping (EU AI Act risk classification)
8. Risk Register with likelihood, impact, and mitigation

Classify overall system risk as Low/Medium/High/Critical.
Provide specific, actionable recommendations for each finding.
Be thorough but practical - focus on real risks, not theoretical ones.`,

  buildUserMessage(context) {
    const parts: string[] = [];
    parts.push(`System Name: ${str(context, 'system_name', 'AI System')}`);
    parts.push(`System Purpose: ${str(context, 'system_purpose', 'Not specified')}`);
    if (str(context, 'deployment_context')) parts.push(`Deployment: ${str(context, 'deployment_context')}`);
    if (str(context, 'affected_groups')) parts.push(`Affected Groups: ${str(context, 'affected_groups')}`);
    const existingReview = jsonBlock(context, 'existing_review');
    if (existingReview) parts.push(`\nExisting Review Data:\n${existingReview}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Change Management Plan
// ---------------------------------------------------------------------------

const changeManagementTemplate: PromptTemplate = {
  type: 'change_management',
  system: `You are a Chief Transformation Officer and Organizational Change Management expert.
Generate a comprehensive AI Change Management Playbook including:
1. Change Readiness Assessment (7 factors scored)
2. Stakeholder Mapping & Engagement Plan (influence/impact matrix)
3. Communication Strategy (message architecture, channel strategy, calendar)
4. Training & Capability Building Program (learning needs, modules, paths by role)
5. Resistance Management Plan (patterns, interventions, psychological safety)
6. Adoption Measurement Framework (awareness, adoption, sustainability KPIs)

Tailor recommendations to the organization's size, industry, and AI maturity.
Focus on practical, implementable actions.
Balance urgency with empathy.
Use Prosci ADKAR model principles where appropriate.`,

  buildUserMessage(context) {
    const parts: string[] = [];
    parts.push(`Organization: ${str(context, 'organization_name', 'the organization')}`);
    if (str(context, 'industry')) parts.push(`Industry: ${str(context, 'industry')}`);
    if (str(context, 'organization_size')) parts.push(`Size: ${str(context, 'organization_size')}`);
    if (str(context, 'ai_initiative')) parts.push(`AI Initiative: ${str(context, 'ai_initiative')}`);
    if (str(context, 'affected_employees')) parts.push(`Affected Employees: ${str(context, 'affected_employees')}`);
    const readiness = jsonBlock(context, 'readiness_data');
    if (readiness) parts.push(`\nReadiness Assessment Data:\n${readiness}`);
    const stakeholders = jsonBlock(context, 'stakeholder_data');
    if (stakeholders) parts.push(`\nStakeholder Data:\n${stakeholders}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Stakeholder Communication Package
// ---------------------------------------------------------------------------

const stakeholderCommunicationTemplate: PromptTemplate = {
  type: 'stakeholder_communication',
  system: `You are a Chief Communications Officer specializing in AI initiative communications.
Generate a comprehensive Stakeholder Communication Package including:
1. Board Presentation Outline (5-slide structure with key metrics, risk status, strategic outlook)
2. Executive Briefing Document (situation, progress, metrics, risks, decisions, next steps)
3. Employee Announcement (vision, what's changing, what it means for you, support available)
4. Employee FAQ (job impact, timeline, training, feedback channels)
5. Manager Talking Points (opening, key messages, anticipated questions, escalation)
6. Customer Communication (benefit headline, privacy commitment, getting started)
7. AI Transparency Statement (purpose, data usage, human oversight, limitations, user control)

Calibrate language and depth for each audience.
Be transparent and honest - never minimize legitimate concerns.
Include concrete examples and proof points.`,

  buildUserMessage(context) {
    const parts: string[] = [];
    parts.push(`Organization: ${str(context, 'organization_name', 'the organization')}`);
    parts.push(`AI Initiative: ${str(context, 'ai_initiative', 'AI Adoption Program')}`);
    if (str(context, 'industry')) parts.push(`Industry: ${str(context, 'industry')}`);
    if (str(context, 'communication_type')) parts.push(`Communication Type: ${str(context, 'communication_type')}`);
    if (str(context, 'target_audience')) parts.push(`Target Audience: ${str(context, 'target_audience')}`);
    const milestones = strList(context, 'milestones');
    if (milestones.length > 0) parts.push(`\nKey Milestones:\n${milestones.map(m => `- ${m}`).join('\n')}`);
    const metrics = jsonBlock(context, 'key_metrics');
    if (metrics) parts.push(`\nKey Metrics:\n${metrics}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Vendor Evaluation Analysis
// ---------------------------------------------------------------------------

const vendorEvaluationTemplate: PromptTemplate = {
  type: 'vendor_evaluation',
  system: `You are a Senior AI Procurement and Vendor Assessment Specialist with deep expertise in enterprise software evaluation.
Analyze AI tool vendors across seven standardised dimensions:
1. Technical Capabilities - model quality, feature breadth, performance benchmarks
2. Security Posture - data handling, encryption, certifications, incident history
3. Compliance Coverage - regulatory framework support, audit readiness, certifications
4. Integration Ease - API quality, SDK support, existing tool chain compatibility
5. Cost & Economics - licensing model, total cost of ownership, hidden costs
6. Vendor Viability - financial health, market position, roadmap credibility
7. Support Quality - SLA terms, documentation, community, enterprise support tiers

When vendor scores are provided, interpret the weighted results and explain strengths, weaknesses, and red flags.
Provide a clear recommendation tier (Recommended, Alternative, Not Recommended) with justification.
Include a head-to-head comparison narrative when multiple vendors are evaluated.
Highlight contractual and data-handling risks specific to AI tool procurement.
Do not endorse specific vendors without evidence-based justification from the provided data.`,

  buildUserMessage(context) {
    const parts: string[] = [];

    parts.push(`Organization: ${str(context, 'organization_name', 'the organization')}`);
    if (str(context, 'industry')) parts.push(`Industry: ${str(context, 'industry')}`);
    if (str(context, 'evaluation_purpose')) parts.push(`Evaluation Purpose: ${str(context, 'evaluation_purpose')}`);

    const vendorData = jsonBlock(context, 'vendor_evaluations');
    if (vendorData) parts.push(`\nVendor Evaluation Data:\n${vendorData}`);

    const requirements = strList(context, 'requirements');
    if (requirements.length > 0) {
      parts.push(`\nKey Requirements:\n${requirements.map((r) => `- ${r}`).join('\n')}`);
    }

    const complianceNeeds = strList(context, 'compliance_frameworks');
    if (complianceNeeds.length > 0) {
      parts.push(`Compliance Requirements: ${complianceNeeds.join(', ')}`);
    }

    if (str(context, 'budget_range')) parts.push(`Budget Range: ${str(context, 'budget_range')}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);

    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Use Case Prioritization Analysis
// ---------------------------------------------------------------------------

const useCasePrioritizationTemplate: PromptTemplate = {
  type: 'use_case_prioritization',
  system: `You are a Senior AI Strategy Consultant specializing in enterprise AI portfolio management and use case prioritization.
Analyze and prioritize AI use cases across four weighted dimensions:
1. Strategic Value (40%) - alignment with business objectives, competitive advantage, revenue impact
2. Technical Feasibility (25%) - data readiness, infrastructure maturity, skill availability
3. Implementation Risk (20%) - regulatory exposure, integration complexity, change management burden
4. Time to Value (15%) - development timeline, quick wins potential, dependency chains

Classify each use case into a portfolio quadrant:
- Strategic Imperative (score >= 8.0): Highest priority, allocate resources immediately
- High-Value Opportunity (score >= 6.5): Strong candidates for near-term investment
- Foundation Builder (score >= 5.0): Worth pursuing with measured investment
- Watch List (score < 5.0): Monitor and reassess in future planning cycles

Assign implementation waves (Wave 1: immediate, Wave 2: near-term, Wave 3: future).
Identify dependencies between use cases that affect sequencing.
Provide a narrative rationale for the prioritized portfolio with resource allocation guidance.
When ROI estimates are provided, incorporate financial context into the prioritization narrative.`,

  buildUserMessage(context) {
    const parts: string[] = [];

    parts.push(`Organization: ${str(context, 'organization_name', 'the organization')}`);
    if (str(context, 'industry')) parts.push(`Industry: ${str(context, 'industry')}`);
    if (str(context, 'strategic_goals')) parts.push(`Strategic Goals: ${str(context, 'strategic_goals')}`);

    const useCaseData = jsonBlock(context, 'use_cases');
    if (useCaseData) parts.push(`\nUse Case Portfolio Data:\n${useCaseData}`);

    const constraints = strList(context, 'constraints');
    if (constraints.length > 0) {
      parts.push(`\nConstraints:\n${constraints.map((c) => `- ${c}`).join('\n')}`);
    }

    if (str(context, 'budget')) parts.push(`Available Budget: ${str(context, 'budget')}`);
    if (str(context, 'team_capacity')) parts.push(`Team Capacity: ${str(context, 'team_capacity')}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);

    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Compliance Gap Analysis
// ---------------------------------------------------------------------------

const complianceAnalysisTemplate: PromptTemplate = {
  type: 'compliance_analysis',
  system: `You are a Senior Regulatory Compliance and AI Law Specialist with expertise in the EU AI Act, GDPR, HIPAA, SOC 2, NIST AI RMF, and ISO/IEC 42001.
Conduct a comprehensive compliance gap analysis for AI systems covering:
1. Framework-by-framework requirement assessment with article-level detail
2. Current compliance status classification (Compliant, Partial, Non-Compliant, Needs Review, Not Applicable)
3. Gap identification with severity rating (Critical, High, Medium, Low)
4. Evidence requirements for each compliance item
5. Remediation recommendations prioritised by risk and effort
6. Cross-framework synergies (controls that satisfy multiple frameworks simultaneously)
7. Timeline estimate for achieving compliance by framework

When compliance requirement data is provided, assess each item and identify gaps.
Map controls across frameworks to reduce duplication of effort.
Provide specific, actionable remediation steps rather than generic guidance.
Include estimated effort (hours/days) and responsible roles for each remediation task.
Flag any requirements with upcoming regulatory deadlines or enforcement actions.
Do not provide legal advice or guarantee compliance outcomes.`,

  buildUserMessage(context) {
    const parts: string[] = [];

    parts.push(`Organization: ${str(context, 'organization_name', 'the organization')}`);
    if (str(context, 'industry')) parts.push(`Industry: ${str(context, 'industry')}`);

    const frameworks = strList(context, 'compliance_frameworks');
    if (frameworks.length > 0) {
      parts.push(`Target Frameworks: ${frameworks.join(', ')}`);
    }

    const requirementData = jsonBlock(context, 'requirements');
    if (requirementData) parts.push(`\nCompliance Requirements Data:\n${requirementData}`);

    const existingControls = jsonBlock(context, 'existing_controls');
    if (existingControls) parts.push(`\nExisting Controls:\n${existingControls}`);

    const riskData = jsonBlock(context, 'risk_classifications');
    if (riskData) parts.push(`\nRisk Classifications:\n${riskData}`);

    if (str(context, 'ai_system_description')) {
      parts.push(`\nAI System Description: ${str(context, 'ai_system_description')}`);
    }
    if (str(context, 'data_types')) parts.push(`Data Types Processed: ${str(context, 'data_types')}`);
    if (str(context, 'prompt')) parts.push(`\nSpecific Request:\n${str(context, 'prompt')}`);

    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Architecture Blueprint
// ---------------------------------------------------------------------------

const architectureBlueprintTemplate: PromptTemplate = {
  type: 'architecture_blueprint',
  system: `You are a Solutions Architect specializing in AI/ML infrastructure design.
Generate a comprehensive AI Integration Architecture Blueprint including:
1. 6-Layer Architecture (Data Foundation, ML Platform, API/Integration, Infrastructure, MLOps, Security)
2. Component Inventory per layer with technology recommendations
3. API Contract Specifications (endpoints, request/response schemas, auth, rate limits)
4. Infrastructure Requirements (compute, storage, network, security)
5. Scaling Strategy recommendation (horizontal, vertical, auto, hybrid)
6. Deployment Model recommendation (Kubernetes, serverless, VM, hybrid)
7. Monitoring Stack recommendation
8. Security Architecture (IAM, encryption, DLP, secrets management)

For each component, include: name, technology choice, description, cloud provider mapping, dependencies.
Tailor recommendations to the specified cloud provider (AWS, GCP, Azure).
Provide cost estimation ranges where applicable.
Output structured JSON.`,
  buildUserMessage(context: Record<string, unknown>): string {
    const parts = ['Generate an architecture blueprint with the following context:'];
    if (context.cloud_provider) parts.push(`Cloud Provider: ${context.cloud_provider}`);
    if (context.deployment_model) parts.push(`Preferred Deployment: ${context.deployment_model}`);
    if (context.team_size) parts.push(`Engineering Team Size: ${context.team_size}`);
    if (context.scale) parts.push(`Expected Scale: ${context.scale}`);
    if (context.existing_stack) parts.push(`Existing Technology Stack: ${context.existing_stack}`);
    if (context.compliance_requirements) parts.push(`Compliance Requirements: ${context.compliance_requirements}`);
    if (context.budget_range) parts.push(`Budget Range: ${context.budget_range}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Data Readiness Audit
// ---------------------------------------------------------------------------

const dataReadinessAuditTemplate: PromptTemplate = {
  type: 'data_readiness_audit',
  system: `You are a Chief Data Officer specializing in AI/ML data readiness assessment.
Generate a comprehensive Data Readiness Audit including:
1. 6-Dimension Assessment (Availability 25%, Quality 25%, Accessibility 20%, Governance 15%, Security 10%, Operations 5%)
2. Data Quality Metrics across 6 dimensions (Accuracy, Completeness, Consistency, Timeliness, Validity, Uniqueness)
3. Data Asset Inventory with AI relevance classification
4. DataOps Maturity Scoring (1-5 scale)
5. Readiness Level Classification (Optimized, Managed, Defined, Developing, Initial)
6. Remediation Roadmap with three phases:
   - Quick Wins (0-30 days): Low-effort, high-impact improvements
   - Foundation (1-3 months): Core infrastructure and process improvements
   - Advanced (3-6 months): Optimization and automation

For each dimension, provide: score (0-100), key findings, and specific recommendations.
Include domain-specific quality assessments (Customer, Product, Transaction, Behavioral).
Output structured JSON.`,
  buildUserMessage(context: Record<string, unknown>): string {
    const parts = ['Generate a data readiness audit with the following context:'];
    if (context.industry) parts.push(`Industry: ${context.industry}`);
    if (context.data_sources) parts.push(`Current Data Sources: ${context.data_sources}`);
    if (context.ai_use_cases) parts.push(`Planned AI Use Cases: ${context.ai_use_cases}`);
    if (context.current_infrastructure) parts.push(`Current Data Infrastructure: ${context.current_infrastructure}`);
    if (context.data_volume) parts.push(`Data Volume: ${context.data_volume}`);
    if (context.team_capabilities) parts.push(`Data Team Capabilities: ${context.team_capabilities}`);
    if (context.compliance_requirements) parts.push(`Compliance Requirements: ${context.compliance_requirements}`);
    return parts.join('\n');
  },
};

// ---------------------------------------------------------------------------
// Performance Monitoring
// ---------------------------------------------------------------------------

const performanceMonitoringTemplate: PromptTemplate = {
  type: 'performance_monitoring',
  system: `You are an MLOps Engineer specializing in AI system performance monitoring.
Generate a comprehensive AI Performance Monitoring Dashboard Specification including:
1. 5-Tier Monitoring Framework:
   - Tier 1 Executive: AI Health Score composite, Business Impact summary, Active Alerts
   - Tier 2 Model Performance: Accuracy, Precision, Recall, F1, AUC-ROC trends
   - Tier 3 Operational: Infrastructure metrics, SLIs/SLOs, Pipeline health
   - Tier 4 Data Quality: Quality dimensions, Feature store metrics, Data drift detection
   - Tier 5 Business: KPIs, ROI tracking, User adoption metrics
2. Alert Configuration Matrix (severity levels, thresholds, notification channels, escalation paths)
3. Drift Detection Setup (data drift, concept drift, feature drift with monitoring approaches)
4. KRI (Key Risk Indicator) Dashboard design
5. SLI/SLO definitions for AI services

For each metric, include: name, target value, warning threshold, critical threshold, unit, measurement method.
Provide recommended monitoring tools and integrations.
Output structured JSON.`,
  buildUserMessage(context: Record<string, unknown>): string {
    const parts = ['Generate a performance monitoring spec with the following context:'];
    if (context.ai_models) parts.push(`AI Models in Use: ${context.ai_models}`);
    if (context.infrastructure) parts.push(`Infrastructure: ${context.infrastructure}`);
    if (context.sla_requirements) parts.push(`SLA Requirements: ${context.sla_requirements}`);
    if (context.current_monitoring) parts.push(`Current Monitoring Tools: ${context.current_monitoring}`);
    if (context.team_size) parts.push(`Operations Team Size: ${context.team_size}`);
    if (context.business_kpis) parts.push(`Business KPIs: ${context.business_kpis}`);
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
  governance_maturity: governanceMaturityTemplate,
  usage_playbook: usagePlaybookTemplate,
  client_brief: clientBriefTemplate,
  ethics_review: ethicsReviewTemplate,
  change_management: changeManagementTemplate,
  stakeholder_communication: stakeholderCommunicationTemplate,
  vendor_evaluation: vendorEvaluationTemplate,
  use_case_prioritization: useCasePrioritizationTemplate,
  compliance_analysis: complianceAnalysisTemplate,
  architecture_blueprint: architectureBlueprintTemplate,
  data_readiness_audit: dataReadinessAuditTemplate,
  performance_monitoring: performanceMonitoringTemplate,
};

/**
 * Retrieve a prompt template by type.
 * Returns undefined when the type is not recognised.
 */
export function getPromptTemplate(type: PromptType): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[type];
}
