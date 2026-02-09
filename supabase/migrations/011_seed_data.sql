-- 011: Seed Data - Default templates and framework data

-- Default assessment template
INSERT INTO assessment_templates (id, name, description, version) VALUES
  ('00000000-0000-0000-0000-000000000001', 'AI Coding Agent Readiness Assessment', 'Comprehensive assessment for evaluating organizational readiness to adopt AI coding agents', 1);

-- Report templates per persona
INSERT INTO report_templates (id, persona, title, description, sections, format) VALUES
  ('00000000-0000-0000-0000-000000000010', 'executive', 'Executive Briefing', 'High-level feasibility and ROI summary for executive stakeholders',
   '[{"id":"exec-1","title":"Executive Summary","description":"Overall feasibility assessment and recommendation","required":true,"order":1},{"id":"exec-2","title":"Feasibility Score Overview","description":"Domain scores with radar visualization","required":true,"order":2},{"id":"exec-3","title":"Risk Assessment","description":"Top risks and mitigation strategies","required":true,"order":3},{"id":"exec-4","title":"ROI Analysis","description":"Cost-benefit analysis and projected returns","required":true,"order":4},{"id":"exec-5","title":"Recommended Timeline","description":"Implementation roadmap with key milestones","required":true,"order":5},{"id":"exec-6","title":"Go/No-Go Recommendation","description":"Final recommendation with conditions","required":true,"order":6}]',
   'pdf'),

  ('00000000-0000-0000-0000-000000000011', 'legal', 'Legal & Compliance Review', 'Contract analysis, compliance mapping, and policy review for legal teams',
   '[{"id":"legal-1","title":"Regulatory Landscape","description":"Applicable regulations and compliance requirements","required":true,"order":1},{"id":"legal-2","title":"Acceptable Use Policy","description":"AUP analysis and recommendations","required":true,"order":2},{"id":"legal-3","title":"Data Classification","description":"Data handling requirements and classifications","required":true,"order":3},{"id":"legal-4","title":"Compliance Framework Mapping","description":"Control mappings across SOC2, HIPAA, NIST, GDPR","required":true,"order":4},{"id":"legal-5","title":"Risk Register","description":"Legal and compliance risk items","required":true,"order":5},{"id":"legal-6","title":"Contractual Considerations","description":"Vendor agreements and liability analysis","required":false,"order":6}]',
   'docx'),

  ('00000000-0000-0000-0000-000000000012', 'it_security', 'IT/Security Architecture Review', 'Sandbox architecture, network configuration, and security controls',
   '[{"id":"it-1","title":"Architecture Overview","description":"Sandbox infrastructure design and components","required":true,"order":1},{"id":"it-2","title":"Network Configuration","description":"VPC, subnet, and firewall configurations","required":true,"order":2},{"id":"it-3","title":"Security Controls","description":"DLP, access controls, and monitoring","required":true,"order":3},{"id":"it-4","title":"Identity & Access Management","description":"Authentication, authorization, and RBAC setup","required":true,"order":4},{"id":"it-5","title":"Configuration Files","description":"Generated sandbox configuration files","required":true,"order":5},{"id":"it-6","title":"Validation Results","description":"Environment health check results","required":true,"order":6}]',
   'pdf'),

  ('00000000-0000-0000-0000-000000000013', 'engineering', 'Engineering Implementation Guide', 'Tool comparison, metrics, and setup guides for engineering teams',
   '[{"id":"eng-1","title":"Tool Evaluation Summary","description":"Claude Code vs Codex comparison results","required":true,"order":1},{"id":"eng-2","title":"Performance Metrics","description":"Baseline vs AI-assisted development metrics","required":true,"order":2},{"id":"eng-3","title":"Setup Guide","description":"Step-by-step developer environment setup","required":true,"order":3},{"id":"eng-4","title":"Best Practices","description":"AI-assisted coding guidelines and workflows","required":true,"order":4},{"id":"eng-5","title":"Sprint Results","description":"PoC sprint evaluation data","required":false,"order":5}]',
   'pdf'),

  ('00000000-0000-0000-0000-000000000014', 'marketing', 'Change Management & Communications Guide', 'Messaging guide, FAQ, and change management narrative',
   '[{"id":"mkt-1","title":"Change Narrative","description":"Why AI coding agents and what it means for the organization","required":true,"order":1},{"id":"mkt-2","title":"Stakeholder Messaging","description":"Tailored messages per audience segment","required":true,"order":2},{"id":"mkt-3","title":"FAQ","description":"Common questions and approved answers","required":true,"order":3},{"id":"mkt-4","title":"Communication Timeline","description":"Rollout communication plan","required":true,"order":4},{"id":"mkt-5","title":"Training Plan","description":"Developer onboarding and training approach","required":false,"order":5}]',
   'docx');
