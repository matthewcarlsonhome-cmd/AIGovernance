# GovAI Studio — Skill Integration Workplan

## Executive Summary

This workplan maps 16 AI Governance skill definitions against the current GovAI
Studio codebase, identifies gaps, and provides a prioritized development plan.

**Current State:** ~80+ source files, 25 feature pages, 38 API routes, 5-domain
scoring engine, ROI calculator, config generator, PDF/DOCX export, AI prompt
templates (5 types). All pages use inline demo data with API route fallbacks.

**Gap Summary:** The app has solid infrastructure and covers the Discovery,
Governance, Sandbox, PoC, Timeline, and Reporting phases. The 16 skill
definitions reveal **8 major feature gaps** and **~40 enhancement opportunities**
that would transform GovAI Studio from a project-tracking tool into a
comprehensive AI governance assessment and advisory platform.

---

## Part 1: Current Feature ↔ Skill Mapping

| # | Skill Definition | Closest Existing Feature | Coverage |
|---|-----------------|-------------------------|----------|
| 1 | AI Governance Readiness Assessment | Discovery > Questionnaire + Readiness | 40% |
| 2 | Secure AI Usage Playbook Builder | Governance > Policies | 25% |
| 3 | AI Data Flow Risk Mapper | Governance > Risk + Sandbox > Configure | 15% |
| 4 | AI Governance Client Brief Generator | Reports > Generate | 30% |
| 5 | AI Ethics Review | Governance > Risk (partial) | 10% |
| 6 | AI Vendor Evaluation Matrix | PoC > Compare | 20% |
| 7 | AI Use Case Prioritization Framework | PoC > Projects (partial) | 15% |
| 8 | AI Data Readiness Audit | Discovery > Readiness (partial) | 20% |
| 9 | AI Risk Assessment & Mitigation Plan | Governance > Risk | 25% |
| 10 | AI Integration Architecture Blueprint | Sandbox > Configure (partial) | 15% |
| 11 | AI Cost-Benefit Analysis Calculator | ROI page | 35% |
| 12 | AI Change Management Playbook | **No mapping** | 0% |
| 13 | AI Pilot Program Designer | PoC phase (partial) | 20% |
| 14 | AI Performance Monitoring Dashboard | Sandbox > Validate (partial) | 10% |
| 15 | AI Security & Privacy Compliance Checker | Governance > Compliance | 25% |
| 16 | AI Stakeholder Communication Package | Reports > Generate (partial) | 20% |

---

## Part 2: Gap Analysis by Skill

### Skill 1: AI Governance Readiness Assessment
**Existing:** 5-domain scoring (infra, security, governance, engineering, business), 30+ questions, radar chart
**Gaps:**
- [ ] 6-dimension maturity model (Policy & Standards, Risk Mgmt, Data Gov, Access Controls, Vendor Mgmt, Training)
- [ ] Maturity level scoring (1-5 scale with descriptions per level)
- [ ] Industry-specific question branching (Financial, Healthcare, Gov, Tech, Manufacturing, Retail)
- [ ] Gap analysis tables (Critical / Significant / Improvement Opportunities)
- [ ] Stakeholder roles & responsibilities matrix output
- [ ] Resource estimate calculator for remediation
- [ ] Recommendations roadmap (Immediate / Short / Medium / Long term)
**Integration approach:** Extend existing scoring engine with maturity dimensions; add industry selector to assessment flow

### Skill 2: Secure AI Usage Playbook Builder
**Existing:** Policy editor with AI-assisted drafting, policy versioning
**Gaps:**
- [ ] Data classification traffic light (GREEN/YELLOW/RED) interactive table
- [ ] Tool-specific rules generator (per approved AI tool)
- [ ] "Should I use AI?" decision tree wizard
- [ ] Employee acknowledgment form + tracking
- [ ] Training requirements matrix builder
- [ ] Disclosure/attribution template library
- [ ] Playbook export as branded PDF/DOCX
**Integration approach:** New sub-page under Governance > Policies; extends existing policy_draft prompt template

### Skill 3: AI Data Flow Risk Mapper
**Existing:** Risk classification page, sandbox config generator
**Gaps:**
- [ ] Visual data flow diagramming (SVG-based system → AI → output)
- [ ] System & data inventory CRUD (catalog systems, data stores, AI touchpoints)
- [ ] Third-party AI vendor assessment checklist (DPA, training opt-out, deletion rights)
- [ ] Control gap analysis matrix (control vs. risk mapping)
- [ ] Data minimization opportunity tracker
- [ ] Monitoring recommendations generator
- [ ] Contractual protection status tracker
**Integration approach:** New page under Governance or as a dedicated top-level section; reuses risk scoring

### Skill 4: AI Governance Client Brief Generator
**Existing:** Report builder with persona selection (Executive, Legal, IT, Engineering, Marketing), PDF/DOCX export
**Gaps:**
- [ ] Client-facing brief template (external vs. internal framing)
- [ ] Objection handling script generator (A.C.E. method)
- [ ] Stakeholder-specific talking points by role (C-Suite, Legal, IT, Security)
- [ ] Customer FAQ auto-generation
- [ ] AI transparency statement template
- [ ] Risk posture calibration (Conservative → Progressive)
**Integration approach:** Extend Reports > Generate with "Client Brief" persona; new AI prompt template

### Skill 5: AI Ethics Review
**Existing:** Risk classification with categories
**Gaps:**
- [ ] Dedicated ethics review workflow page
- [ ] Bias analysis framework (5 bias types: Historical, Representation, Measurement, Aggregation, Evaluation)
- [ ] Fairness metrics tracker (Demographic Parity, Equalized Odds, Predictive Parity)
- [ ] Privacy assessment checklist (data minimization, consent, protection)
- [ ] Human oversight evaluation matrix
- [ ] Ethics risk register with mitigation tracking
- [ ] Regulatory compliance mapping for ethics (EU AI Act risk classification)
**Integration approach:** New page under Governance; integrates with risk scoring and compliance mapping

### Skill 6: AI Vendor Evaluation Matrix
**Existing:** Tool comparison dashboard (Claude Code vs Codex)
**Gaps:**
- [ ] Multi-vendor comparison (configurable vendor list, not just 2)
- [ ] 7-dimension scoring (Capabilities 25%, Security 25%, Compliance 20%, Integration 15%, Economics 10%, Viability 3%, Support 2%)
- [ ] Security requirements assessment per vendor
- [ ] TCO calculator with vendor comparison columns
- [ ] Red flags / deal breaker checklist
- [ ] Vendor risk matrix
- [ ] SDK/API feature comparison grid
**Integration approach:** Major enhancement to PoC > Compare; extends tool_evaluations table

### Skill 7: AI Use Case Prioritization Framework
**Existing:** PoC project definitions with basic selection scoring
**Gaps:**
- [ ] 4-dimension scoring (Strategic Value 40%, Technical Feasibility 25%, Implementation Risk 20%, Time to Value 15%)
- [ ] Portfolio quadrant visualization (Strategic Imperatives / High-Value / Foundation Builders / Watch List)
- [ ] Dependency mapping between use cases
- [ ] Industry-specific weight adjustments
- [ ] Per-use-case ROI projection
- [ ] Implementation wave planning (Wave 1/2/3)
**Integration approach:** Enhance PoC > Projects with prioritization framework; new scoring UI component

### Skill 8: AI Data Readiness Audit
**Existing:** Readiness assessment with radar chart (infra/security/governance/engineering/business)
**Gaps:**
- [ ] 6-dimension data assessment (Availability 25%, Quality 25%, Accessibility 20%, Governance 15%, Security 10%, Operations 5%)
- [ ] Data quality metrics tracking (Accuracy, Completeness, Consistency, Timeliness, Validity, Uniqueness)
- [ ] Data asset inventory CRUD
- [ ] Feature store readiness evaluation
- [ ] DataOps maturity scoring
- [ ] Privacy compliance checklist (GDPR, CCPA, HIPAA)
- [ ] Remediation roadmap output
**Integration approach:** New assessment type or extend Discovery > Readiness with "Data Readiness" tab

### Skill 9: AI Risk Assessment & Mitigation Plan
**Existing:** Risk classification manager with categories
**Gaps:**
- [ ] 7-category risk framework (Model/Algorithm, Operational, Ethical/Fairness, Regulatory/Compliance, Security/Privacy, Strategic/Business, Third-Party)
- [ ] Risk heat map visualization (Likelihood × Impact matrix)
- [ ] Risk scoring with control effectiveness factor
- [ ] Kill switch criteria definition
- [ ] Threat modeling for AI systems (attack surface, threat actors)
- [ ] Risk monitoring KRI dashboard
- [ ] Governance structure recommendations
- [ ] Mitigation plan generator with owner assignment and timelines
**Integration approach:** Major enhancement to Governance > Risk; new risk_assessment AI prompt template already exists

### Skill 10: AI Integration Architecture Blueprint
**Existing:** Infrastructure questionnaire, sandbox config generator (JSON, TOML, YAML, HCL)
**Gaps:**
- [ ] 6-layer architecture designer (Data Foundation, ML Platform, API/Integration, Infrastructure, MLOps, Security)
- [ ] Architecture diagram generator (text-based component diagrams)
- [ ] API contract specification builder
- [ ] Cloud resource requirements calculator
- [ ] Scaling strategy configurator
- [ ] CI/CD pipeline template generator
- [ ] Monitoring stack recommendation
**Integration approach:** New page under Sandbox or as a dedicated Architecture section; extends config-gen

### Skill 11: AI Cost-Benefit Analysis Calculator
**Existing:** ROI calculator with NPV, payback period, sensitivity analysis
**Gaps:**
- [ ] Full TCO calculator (Initial + Ongoing + Hidden costs breakdowns)
- [ ] Benefit quantification by type (Revenue, Cost Reduction, Strategic)
- [ ] Benefit realization timeline (Pilot → Limited → Full → Optimization)
- [ ] Scenario analysis (Optimistic / Base / Conservative / Pessimistic)
- [ ] 5-year cash flow projection table
- [ ] IRR calculation
- [ ] Investment recommendation output (Go / No-Go / Conditional)
**Integration approach:** Enhance existing ROI page with expanded calculator; extend RoiInputs/RoiResults types

### Skill 12: AI Change Management Playbook — **NEW FEATURE**
**Existing:** Nothing
**Gaps (all new):**
- [ ] Change readiness assessment (7 factors scored)
- [ ] Change impact assessment matrix
- [ ] Stakeholder mapping & engagement planner
- [ ] Communication strategy builder with message architecture
- [ ] Communication calendar generator
- [ ] Training & capability building program designer
- [ ] Resistance management plan with intervention matrix
- [ ] Adoption measurement framework (Awareness → Adoption → Sustainability)
**Integration approach:** New top-level section or new phase page; needs new DB table + API route

### Skill 13: AI Pilot Program Designer
**Existing:** PoC project/sprint tracking, sprint evaluation metrics
**Gaps:**
- [ ] Pilot type selection wizard (PoC / PoV / Limited / Full)
- [ ] Participant selection criteria matrix
- [ ] Success criteria framework (Must-Have / Should-Have / Could-Have)
- [ ] Go/No-Go decision matrix with evidence tracking
- [ ] Pre-pilot checklist (Technical / People / Process categories)
- [ ] Weekly operations rhythm template
- [ ] Kill switch criteria definition
- [ ] Scale-up decision framework (Full Scale / Phased / Extended / Pivot / Discontinue)
**Integration approach:** Enhance PoC phase with pilot design wizard; extend poc_projects table

### Skill 14: AI Performance Monitoring Dashboard Spec
**Existing:** Sandbox health check validation
**Gaps:**
- [ ] AI health score composite dashboard
- [ ] Model performance metrics (Accuracy, Precision, Recall, F1, AUC-ROC)
- [ ] Drift detection monitoring (Data drift, Concept drift, Feature drift)
- [ ] SLI/SLO tracking (Availability, Latency p50/p95/p99, Error Rate, Throughput)
- [ ] Data quality dashboard (Completeness, Accuracy, Consistency, Timeliness)
- [ ] Business impact KPIs (Revenue impact, Cost savings, Adoption, Satisfaction)
- [ ] Alert configuration builder (severity matrix, escalation paths)
- [ ] ROI tracking dashboard
**Integration approach:** New page under Sandbox or dedicated Monitoring section; mostly visualization

### Skill 15: AI Security & Privacy Compliance Checker
**Existing:** Compliance framework mapping (SOC2, HIPAA, NIST, GDPR)
**Gaps:**
- [ ] AI-specific threat modeling (7 threat categories)
- [ ] ML-specific vulnerability assessment
- [ ] Privacy Impact Assessment (PIA) workflow
- [ ] Data subject rights tracking (Access, Rectification, Erasure, Portability, etc.)
- [ ] EU AI Act compliance mapping (risk classification, QMS, transparency, human oversight)
- [ ] Supply chain risk assessment
- [ ] Security controls assessment matrix (Data, Model, Infrastructure)
- [ ] Remediation roadmap with P1-P4 priority timelines
**Integration approach:** Major enhancement to Governance > Compliance; add threat modeling to Risk

### Skill 16: AI Stakeholder Communication Package
**Existing:** Multi-stakeholder report builder (5 personas), PDF/DOCX export
**Gaps:**
- [ ] Board presentation outline generator (5-slide structure)
- [ ] Employee announcement communication builder
- [ ] Employee FAQ generator
- [ ] Manager talking points generator
- [ ] Customer communication templates (announcement, FAQ, transparency statement)
- [ ] Crisis communication framework
- [ ] Communication calendar generator
- [ ] Regulatory briefing template builder
**Integration approach:** Extend Reports > Generate with communication package types; new prompt templates

---

## Part 3: Prioritized Development Plan

### Priority 0 — Critical Path (Weeks 1-3)
*Foundation work that unblocks everything else.*

#### P0.1: Governance Maturity Model Engine
**Skills addressed:** 1 (Readiness Assessment), 8 (Data Readiness)
**Files to create/modify:**
- `src/lib/scoring/maturity-engine.ts` — New maturity scoring engine (6 dimensions, 1-5 levels)
- `src/lib/scoring/maturity-questions.ts` — Maturity assessment question bank
- `src/types/index.ts` — Add `MaturityDimension`, `MaturityScore`, `MaturityLevel` types
- `src/app/api/assessments/maturity/route.ts` — New API route for maturity assessments
- `src/hooks/use-maturity.ts` — Client hook for maturity data

**Implementation details:**
```typescript
// New types
type MaturityDimension = 'policy_standards' | 'risk_management' | 'data_governance'
  | 'access_controls' | 'vendor_management' | 'training_awareness';
type MaturityLevel = 1 | 2 | 3 | 4 | 5;
interface MaturityScore {
  dimension: MaturityDimension;
  level: MaturityLevel;
  subscores: { documentation: number; implementation: number;
    enforcement: number; measurement: number; improvement: number };
  key_gap: string;
}
```
**Effort:** 3-4 days
**Security:** All inputs Zod-validated; maturity data scoped to project/org

#### P0.2: Risk Heat Map & Enhanced Risk Framework
**Skills addressed:** 9 (Risk Assessment), 3 (Data Flow Risk), 5 (Ethics Review)
**Files to create/modify:**
- `src/lib/scoring/risk-engine.ts` — New risk scoring engine (Likelihood × Impact × Control Effectiveness)
- `src/types/index.ts` — Add `RiskCategory` (7 types), `RiskScore`, `RiskHeatMapCell` types
- `src/app/(dashboard)/projects/[id]/governance/risk/page.tsx` — Enhance with heat map visualization
- `src/components/features/governance/risk-heat-map.tsx` — New SVG heat map component
- `src/app/api/governance/risk/route.ts` — Extend with scoring endpoints

**Implementation details:**
- 7 risk categories: model_algorithm, operational, ethical_fairness, regulatory_compliance, security_privacy, strategic_business, third_party
- Risk score = Likelihood (1-5) × Impact (1-5) × (1 - Control_Effectiveness)
- Heat map renders 5×5 grid with color-coded cells (Green/Yellow/Orange/Red)
- Exportable as part of reports
**Effort:** 4-5 days
**Security:** Risk data encrypted at rest; audit trail on risk changes

#### P0.3: Industry Selector & Context Engine
**Skills addressed:** 1, 3, 7, 8, 9, 15 (all need industry-specific logic)
**Files to create/modify:**
- `src/lib/scoring/industry-config.ts` — Industry-specific weight adjustments and considerations
- `src/types/index.ts` — Add `Industry` type enum
- `src/app/(dashboard)/projects/new/page.tsx` — Add industry selector to project creation
- `src/app/api/projects/route.ts` — Accept industry field

**Implementation details:**
```typescript
type Industry = 'financial_services' | 'healthcare' | 'government' | 'technology'
  | 'manufacturing' | 'retail' | 'education' | 'other';
interface IndustryConfig {
  industry: Industry;
  regulatory_frameworks: string[];
  weight_adjustments: Partial<Record<ScoreDomain, number>>;
  key_risks: string[];
  special_considerations: string[];
}
```
**Effort:** 2 days
**Security:** No additional concerns; read-only config data

---

### Priority 1 — Core Enhancements (Weeks 4-8)
*Major feature upgrades to existing pages.*

#### P1.1: Enhanced Compliance Checker (EU AI Act + PIA)
**Skills addressed:** 15 (Security & Privacy), 5 (Ethics Review)
**Files to create/modify:**
- `src/lib/scoring/compliance-engine.ts` — Compliance status engine with gap analysis
- `src/app/(dashboard)/projects/[id]/governance/compliance/page.tsx` — Major UI enhancement
- `src/app/api/governance/compliance/route.ts` — Extend with EU AI Act mapping
- New demo data for EU AI Act articles, GDPR articles, industry-specific regs

**Implementation details:**
- Compliance matrix: Requirement × Status (Compliant / Partial / Non-Compliant / Needs Review)
- EU AI Act mapping: risk classification, QMS, data governance, documentation, transparency, human oversight
- Privacy Impact Assessment wizard (7-step flow)
- Data subject rights tracking (8 rights with implementation status)
- Remediation roadmap output (P1-P4 with timelines)
**Effort:** 5-6 days
**Error handling:** Graceful degradation when compliance data incomplete; validation on all assessment inputs

#### P1.2: Enhanced Vendor Evaluation Matrix
**Skills addressed:** 6 (Vendor Evaluation)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/poc/compare/page.tsx` — Major rewrite for N-vendor comparison
- `src/lib/scoring/vendor-scoring.ts` — 7-dimension vendor scoring engine
- `src/types/index.ts` — Add `VendorEvaluation`, `VendorDimension` types
- `src/app/api/poc/tool-evaluations/route.ts` — Extend schema

**Implementation details:**
- Configurable vendor list (add/remove vendors)
- 7 weighted dimensions with sub-criteria
- Side-by-side comparison table (responsive)
- Red flags / deal breaker checklist
- Security assessment per vendor
- TCO comparison with 3-year projection
- Exportable evaluation report
**Effort:** 5-6 days
**Security:** Vendor data org-scoped; no external API calls for vendor info

#### P1.3: Enhanced ROI / Cost-Benefit Calculator
**Skills addressed:** 11 (Cost-Benefit Analysis)
**Files to create/modify:**
- `src/lib/scoring/roi-calculator.ts` — Extend with TCO, IRR, scenario analysis
- `src/app/(dashboard)/projects/[id]/roi/page.tsx` — Major UI enhancement
- `src/types/index.ts` — Extend `RoiInputs`, `RoiResults` with new fields
- `src/hooks/use-roi.ts` — Extend hook

**Implementation details:**
- TCO breakdown: Initial (Infrastructure, Development, Organizational) + Ongoing (Infrastructure, Personnel, Maintenance)
- Hidden costs section (Technical debt, Opportunity cost, Learning curve)
- Benefit types: Revenue increase, Cost reduction, Strategic value
- Benefit realization timeline (4 phases with % curves)
- Scenario analysis: 4 scenarios with probability weighting → Expected Value
- Sensitivity analysis: ±20% on 5 key variables
- 5-year cash flow projection table
- IRR calculation
- Go/No-Go recommendation based on thresholds
**Effort:** 4-5 days
**Error handling:** Division-by-zero guards; NaN/Infinity guards on all calculations; input range validation

#### P1.4: AI Prompt Template Expansion
**Skills addressed:** 1, 2, 4, 5, 9, 12, 16 (all AI-assisted generation)
**Files to create/modify:**
- `src/lib/ai/prompts.ts` — Add 6 new prompt templates
- `src/app/api/ai/route.ts` — Extend type validation

**New prompt templates:**
1. `governance_maturity_assessment` — Generate maturity analysis from assessment data
2. `usage_playbook` — Generate AI usage playbook from org context
3. `client_brief` — Generate client-facing governance brief
4. `ethics_review` — Generate ethics assessment report
5. `change_management_plan` — Generate change management playbook
6. `stakeholder_communication` — Generate stakeholder communication package

**Effort:** 3 days
**Security:** All prompts server-side only; no API keys in client code; input sanitization on context

---

### Priority 2 — New Features (Weeks 9-16)
*Net-new pages and capabilities.*

#### P2.1: AI Usage Playbook Builder Page
**Skills addressed:** 2 (Secure AI Usage Playbook)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/governance/playbook/page.tsx` — New page
- `src/app/(dashboard)/projects/[id]/governance/playbook/` — layout, loading, error
- Update sidebar nav in `src/app/(dashboard)/layout.tsx`

**Implementation details:**
- Step 1: Organization context form (industry, size, risk tolerance)
- Step 2: Approved tools inventory (add tools with status, data handling, access method)
- Step 3: Data classification builder (GREEN/YELLOW/RED traffic light)
- Step 4: Decision tree configurator ("Should I use AI?")
- Step 5: AI-generated playbook preview
- Step 6: Export as branded PDF/DOCX
- Employee acknowledgment tracking (signed/unsigned per user)
**Effort:** 6-7 days

#### P2.2: Ethics Review Page
**Skills addressed:** 5 (AI Ethics Review)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/governance/ethics/page.tsx` — New page
- Update sidebar nav

**Implementation details:**
- System overview form (purpose, function, decision impact, deployment context)
- Fairness assessment: protected characteristics checklist, potential disparate impact analysis
- Bias analysis: 5 bias types with risk level and evidence needed
- Privacy assessment: data minimization, consent, protection checklist
- Transparency evaluation: model interpretability level, user communication, documentation
- Human oversight controls: current vs. recommended
- Regulatory compliance mapping
- Ethics risk register with mitigation tracking
- AI-generated ethics review summary
**Effort:** 5-6 days

#### P2.3: Change Management Planner Page
**Skills addressed:** 12 (Change Management Playbook)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/change-management/page.tsx` — New page
- `src/app/api/change-management/route.ts` — New API route (or reuse existing patterns)
- Update sidebar nav, types

**Implementation details:**
- Tab 1: Change Readiness Assessment (7 factors scored 1-5)
- Tab 2: Stakeholder Mapping (influence × impact matrix, engagement strategy per group)
- Tab 3: Communication Plan (message architecture, channel strategy, calendar)
- Tab 4: Training Program (learning needs → modules → paths by role)
- Tab 5: Resistance Management (patterns, interventions, psychological safety)
- Tab 6: Adoption Metrics (KPIs, targets, measurement methods)
- AI-generated change management playbook export
**Effort:** 7-8 days

#### P2.4: Pilot Program Designer Enhancement
**Skills addressed:** 13 (Pilot Program Designer)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/poc/pilot-design/page.tsx` — New page
- Extend PoC types and API routes

**Implementation details:**
- Pilot type selector (PoC / PoV / Limited Pilot / Full Pilot)
- Scope definition form (users, transactions, locations, use cases, duration)
- Participant selection wizard (criteria matrix with weights)
- Success criteria framework (Must-Have / Should-Have / Could-Have / Won't-Have)
- Quantitative + qualitative metrics definition
- Go/No-Go decision matrix (checkboxes with evidence fields)
- Pre-pilot checklist (Technical / People / Process categories)
- Weekly operations rhythm template
- Risk register with kill switch criteria
- Scale decision framework
**Effort:** 5-6 days

#### P2.5: Use Case Prioritization Framework Enhancement
**Skills addressed:** 7 (Use Case Prioritization)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/poc/prioritize/page.tsx` — New page
- `src/lib/scoring/prioritization-engine.ts` — New scoring engine

**Implementation details:**
- Use case inventory form (name, description, sponsor, department)
- 4-dimension scoring per use case (Strategic Value 40%, Technical Feasibility 25%, Implementation Risk 20%, Time to Value 15%)
- Sub-criteria scoring with configurable weights
- Portfolio quadrant visualization (2×2 matrix chart)
- Dependency graph (which use cases enable others)
- Implementation wave planning (Wave 1: 0-6mo, Wave 2: 6-12mo, Wave 3: 12-24mo)
- AI-generated executive summary of prioritization
**Effort:** 5-6 days

#### P2.6: Data Flow Risk Mapper Page
**Skills addressed:** 3 (Data Flow Risk Mapper)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/governance/data-flows/page.tsx` — New page
- API route for system/data inventory

**Implementation details:**
- System inventory CRUD (name, type, data types, AI integration status)
- Data classification summary table
- AI integration points inventory (system × AI service × data exposed × pattern)
- Visual data flow diagram (SVG: Source → Processing → AI → Output → Destination)
- Risk point inventory with scoring
- Third-party vendor assessment checklist (DPA, training opt-out, deletion rights, audit rights)
- Control gap analysis matrix
- Data minimization opportunities tracker
- Compliance checkpoint matrix
- Monitoring recommendations
**Effort:** 6-7 days

---

### Priority 3 — Advanced Features (Weeks 17-24)
*Differentiation features, dashboards, and advanced tooling.*

#### P3.1: AI Performance Monitoring Dashboard
**Skills addressed:** 14 (Performance Monitoring)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/monitoring/page.tsx` — New page
- New monitoring-specific components

**Implementation details:**
- Tier 1: Executive summary (AI Health Score composite, Business Impact, Active Alerts)
- Tier 2: Model performance (Accuracy trends, Drift detection, Performance by segment)
- Tier 3: Operational health (Infrastructure metrics, SLIs, Pipeline health)
- Tier 4: Data quality (Quality dimensions, Feature store metrics, Training data quality)
- Tier 5: Business impact (KPIs, ROI tracking, User adoption)
- Alert configuration builder (severity matrix, notification channels, escalation)
- All charts using Recharts (already installed)
**Effort:** 7-8 days

#### P3.2: Architecture Blueprint Builder
**Skills addressed:** 10 (Integration Architecture)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/sandbox/architecture/page.tsx` — New page
- `src/lib/config-gen/architecture-generator.ts` — Architecture spec generator

**Implementation details:**
- 6-layer architecture questionnaire
- Technology selection advisor (per cloud provider)
- API contract specification builder (YAML/JSON output)
- Infrastructure requirements calculator
- Kubernetes deployment template generator
- Scaling strategy configurator
- Monitoring stack recommendation
- Architecture diagram export (text-based, formatted for docs)
**Effort:** 5-6 days

#### P3.3: Stakeholder Communication Package Builder
**Skills addressed:** 16 (Stakeholder Communication)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/reports/communications/page.tsx` — New page
- New AI prompt templates for each communication type

**Implementation details:**
- Board presentation outline generator (5-slide structure with speaker notes)
- Executive briefing document builder
- Employee announcement composer
- Employee FAQ auto-generator
- Manager talking points generator
- Customer announcement + FAQ + transparency statement
- Crisis communication framework
- Communication calendar with milestone mapping
- All outputs exportable as DOCX/PDF
**Effort:** 5-6 days

#### P3.4: Client Brief Generator Enhancement
**Skills addressed:** 4 (Client Brief Generator)
**Files to create/modify:**
- Extend `src/app/(dashboard)/projects/[id]/reports/generate/page.tsx`
- New prompt template for client_brief

**Implementation details:**
- Client industry selector with risk posture calibration
- Objection handling script generator (A.C.E. method)
- Stakeholder-specific talking points (C-Suite / Legal / IT / Security)
- Customer FAQ generator
- AI transparency statement builder
- Risk mitigation summary table
- "Available Upon Request" checklist
- Export as branded client-ready PDF
**Effort:** 4-5 days

#### P3.5: Data Readiness Audit Page
**Skills addressed:** 8 (Data Readiness Audit)
**Files to create/modify:**
- `src/app/(dashboard)/projects/[id]/discovery/data-readiness/page.tsx` — New page
- `src/lib/scoring/data-readiness-engine.ts` — New assessment engine

**Implementation details:**
- 6-dimension data assessment with weighted scoring
- Data source mapping inventory
- Data quality metrics tracker (per domain: Customer, Product, Transaction, Behavioral)
- Technical accessibility assessment
- Governance framework evaluation
- Security & privacy controls checklist
- DataOps maturity scoring
- Readiness level classification (Optimized → Initial)
- Remediation roadmap with quick wins / foundation / advanced
**Effort:** 5-6 days

---

## Part 4: Shared Infrastructure Needed

### New Types (add to `src/types/index.ts`)
```
MaturityDimension, MaturityLevel, MaturityScore, MaturityAssessment
RiskCategory (7 types), RiskScore, RiskHeatMapCell, ThreatModel
Industry, IndustryConfig
VendorEvaluation, VendorDimension, VendorScore
ComplianceFramework, ComplianceStatus, ComplianceGap
UseCasePriority, PriorityDimension, PortfolioQuadrant
ChangeReadiness, StakeholderMap, CommunicationPlan
PilotDesign, PilotType, SuccessCriteria, GoNoGoGate
EthicsReview, BiasType, FairnessMetric
DataReadiness, DataQualityDimension, DataOpsMaturity
MonitoringDashboard, AlertConfig, SLI, DriftMetric
ArchitectureBlueprint, ArchitectureLayer
ClientBrief, ObjectionScript, TalkingPoints
```

### New API Routes
```
POST/GET  /api/assessments/maturity      (P0.1)
POST/GET  /api/governance/ethics          (P2.2)
POST/GET  /api/governance/data-flows      (P2.6)
POST/GET  /api/change-management          (P2.3)
POST/GET  /api/poc/pilot-design           (P2.4)
POST/GET  /api/poc/prioritization         (P2.5)
POST/GET  /api/monitoring/config          (P3.1)
```

### New AI Prompt Templates
```
governance_maturity_assessment   (P1.4)
usage_playbook                   (P1.4)
client_brief                     (P1.4)
ethics_review                    (P1.4)
change_management_plan           (P1.4)
stakeholder_communication        (P1.4)
architecture_blueprint           (P3.2)
data_readiness_report            (P3.5)
```

### Sidebar Navigation Updates
```
Governance section additions:
  + AI Usage Playbook        (P2.1)
  + Ethics Review            (P2.2)
  + Data Flow Mapping        (P2.6)

PoC section additions:
  + Pilot Design             (P2.4)
  + Use Case Prioritization  (P2.5)

New sections:
  + Change Management        (P2.3)
  + Monitoring               (P3.1)

Sandbox section addition:
  + Architecture Blueprint   (P3.2)

Reports section additions:
  + Communications Package   (P3.3)
  + Client Briefs            (P3.4)

Discovery section addition:
  + Data Readiness Audit     (P3.5)
```

---

## Part 5: Effort Summary

| Priority | Items | Total Effort | Calendar Weeks |
|----------|-------|-------------|----------------|
| P0 | 3 items | 9-11 days | Weeks 1-3 |
| P1 | 4 items | 17-20 days | Weeks 4-8 |
| P2 | 6 items | 34-40 days | Weeks 9-16 |
| P3 | 5 items | 26-31 days | Weeks 17-24 |
| **Total** | **18 items** | **86-102 days** | **~24 weeks** |

---

## Part 6: Development Standards (Apply to ALL items)

### Security Requirements
- All API inputs validated with Zod schemas
- All data org-scoped via `organization_id` (service role client bypasses RLS)
- AI API calls server-side only (never expose API keys to client)
- Input sanitization on all user-provided text (DOMPurify for rich text)
- Rate limiting on AI generation endpoints
- Audit trail on all governance document changes

### Error Handling Pattern
```typescript
// Every API route follows this pattern:
export async function POST(request: NextRequest) {
  try {
    // 1. Zod validation
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: ... }, { status: 400 });

    // 2. Demo mode fallback
    if (!isServerSupabaseConfigured()) return NextResponse.json({ data: DEMO_DATA });

    // 3. Auth check (cookie client)
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 4. Data operations (service role client)
    const db = await createServiceRoleClient();
    // ... operations with .maybeSingle() for lookups

    // 5. Consistent error shape
  } catch (error) {
    console.error('[ROUTE] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error', message: ... }, { status: 500 });
  }
}
```

### UI Component Pattern
```typescript
// Every feature page follows this pattern:
'use client';
// 1. Inline demo data for standalone demo capability
// 2. TanStack Query hook for real data (falls back to demo)
// 3. Loading skeleton
// 4. Error state → friendly guidance
// 5. Empty state → "Create your first X" prompt
// 6. Data state → full interactive UI
// 7. All Tailwind classes explicit (no CSS variable classes)
```

### Testing Requirements
- Pure scoring functions: unit tests in `__tests__/unit/`
- New engines: `maturity-engine.test.ts`, `risk-engine.test.ts`, `prioritization-engine.test.ts`
- Test data must match types exactly (all required fields)
- Build must pass (`next build`) with zero TS errors

---

## Part 7: Quick Wins (Can Start Immediately)

These require minimal infrastructure and deliver immediate value:

1. **Add industry selector to project creation** (P0.3) — 2 days
2. **Risk heat map visualization component** (P0.2 partial) — 2 days
3. **New AI prompt templates** (P1.4) — 3 days
4. **Enhance ROI calculator with scenario analysis** (P1.3 partial) — 2 days
5. **Add EU AI Act to compliance mapping** (P1.1 partial) — 2 days

---

## Part 8: Dependencies & Sequencing

```
P0.3 (Industry Config) ──────────────┐
P0.1 (Maturity Engine) ──────────────┤
P0.2 (Risk Heat Map) ────────────────┼──→ P1.1 (Compliance) ──→ P2.2 (Ethics)
                                      │                      ──→ P2.6 (Data Flows)
                                      │
P1.4 (Prompt Templates) ─────────────┼──→ P2.1 (Playbook)
                                      │──→ P2.3 (Change Mgmt)
                                      │──→ P3.3 (Comms Package)
                                      │──→ P3.4 (Client Brief)
                                      │
P1.2 (Vendor Eval) ──────────────────┼──→ P2.5 (Use Case Prioritization)
P1.3 (ROI Enhancement) ──────────────┘──→ P2.4 (Pilot Design)
                                          P3.1 (Monitoring Dashboard)
                                          P3.2 (Architecture Blueprint)
                                          P3.5 (Data Readiness)
```

Key insight: P0 items unblock everything. P1.4 (prompt templates) unblocks all
AI-generated content features. P1.2 and P1.3 can run in parallel with P1.1.
