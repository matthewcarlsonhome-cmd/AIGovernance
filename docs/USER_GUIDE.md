# GovAI Studio User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Six-Phase Workflow](#the-six-phase-workflow)
3. [Discovery Phase](#discovery-phase)
4. [Governance Phase](#governance-phase)
5. [Sandbox Phase](#sandbox-phase)
6. [PoC (Proof of Concept) Phase](#poc-proof-of-concept-phase)
7. [Timeline Phase](#timeline-phase)
8. [Reports Phase](#reports-phase)
9. [ROI Calculator](#roi-calculator)
10. [Meeting Tracker](#meeting-tracker)
11. [Team Management](#team-management)
12. [Settings](#settings)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [FAQ](#faq)

---

## Getting Started

### First Login

1. Navigate to the GovAI Studio login page at your organization's URL.
2. Enter the email address and password provided by your administrator.
3. If this is your first login, you will be prompted to set a new password.
4. After successful authentication, you will be redirected to the main dashboard.

### Creating Your Organization

If you are the first user from your company, you will need to create an organization:

1. After logging in for the first time, click **Create Organization** on the welcome screen.
2. Enter your organization name, industry, and company size.
3. Configure your default settings (timezone, date format, notification preferences).
4. Click **Create** to finalize. You are now the organization administrator.

### Creating Your First Project

A project in GovAI Studio represents a single AI governance engagement -- typically one initiative to evaluate, plan, and deploy AI coding agents within your organization.

1. From the dashboard, click the **New Project** button or navigate to **Projects > New**.
2. Fill in the project details:
   - **Project Name**: A descriptive name (e.g., "Enterprise Claude Code Pilot Q2 2026").
   - **Description**: Brief summary of the initiative's goals.
   - **Target Start Date**: When you plan to begin the engagement.
   - **Estimated Duration**: Expected timeline in weeks.
3. Click **Create Project** to proceed.
4. You will be taken to the project overview page where you can begin working through the six phases.

---

## The Six-Phase Workflow

GovAI Studio guides you through a structured six-phase process for responsible AI adoption:

| Phase | Purpose | Key Deliverables |
|-------|---------|------------------|
| **Discovery** | Assess organizational readiness | Questionnaire responses, readiness scores, prerequisite checklist |
| **Governance** | Establish policies and controls | AUP, IRP addendum, compliance mappings, risk classifications, gate reviews |
| **Sandbox** | Configure secure test environment | Infrastructure config files, validation results |
| **PoC** | Run controlled evaluations | Sprint metrics, tool comparisons, baseline vs. AI-assisted data |
| **Timeline** | Plan rollout schedule | Gantt chart, milestones, dependency mappings |
| **Reports** | Communicate findings to stakeholders | Persona-specific reports (Executive, Legal, IT, Engineering, Marketing) |

Each phase builds on the previous one. While you can navigate between phases freely, completing them in order ensures the most thorough governance process.

---

## Discovery Phase

The Discovery phase helps you understand your organization's current readiness for AI coding agent adoption.

### Questionnaire

The guided assessment questionnaire covers five key domains:

1. **Infrastructure** (25% weight): Cloud readiness, network configuration, compute resources, CI/CD maturity.
2. **Security** (25% weight): Data classification, access controls, DLP policies, secrets management.
3. **Governance** (20% weight): Existing policies, change management processes, audit capabilities.
4. **Engineering** (15% weight): Team skill levels, development workflows, code review practices.
5. **Business** (15% weight): Budget approval, executive sponsorship, success metrics defined.

**How to complete the questionnaire:**

1. Navigate to **Discovery > Questionnaire**.
2. Each question has a specific response type (multiple choice, scale, yes/no, or free text).
3. Answer questions honestly based on your current state -- the scoring engine produces the most useful results with accurate inputs.
4. Some questions have branching logic: your answer may unlock additional follow-up questions.
5. You can save progress at any time and return later. Partial responses are preserved.
6. Click **Submit Assessment** when all required questions are answered.

### Understanding Readiness Scores

After submitting the questionnaire, the scoring engine calculates your readiness:

- **Domain Scores** (0-100 each): Displayed on a radar chart showing strengths and gaps across the five domains.
- **Overall Score**: A weighted aggregate of all domain scores.
- **Rating**: One of four tiers:
  - **Ready** (80-100): Organization is well-positioned to proceed.
  - **Conditionally Ready** (60-79): Some gaps exist but can be addressed in parallel.
  - **Needs Improvement** (40-59): Significant preparation required before proceeding.
  - **Not Ready** (0-39): Fundamental prerequisites must be met first.
- **Recommendations**: Specific, actionable suggestions generated based on your weakest areas.
- **Remediation Tasks**: Auto-generated tasks that can be tracked in the Prerequisites checklist.

### Prerequisites Checklist

The prerequisites page shows all tasks that should be completed before moving forward:

- Tasks are automatically generated from the assessment but can also be added manually.
- Each task can be assigned to a team member.
- Track completion status: Not Started, In Progress, Completed, Blocked.
- Filter by domain, assignee, or status.
- Export the checklist as a CSV or PDF for offline tracking.

---

## Governance Phase

The Governance phase is where you establish the policies, controls, and approval frameworks needed for responsible AI adoption.

### Creating Policies

Navigate to **Governance > Policies** to create and manage governance documents:

- **Acceptable Use Policy (AUP)**: Defines what AI coding agents can and cannot do in your environment. Covers allowed repositories, approved models, data handling rules, and prohibited use cases.
- **Incident Response Plan (IRP) Addendum**: Extends your existing IRP to cover AI-specific incidents (model hallucinations in production code, data leakage via prompts, unauthorized model access).
- **Data Classification**: Maps your data sensitivity levels to AI agent permissions. Determines which repositories and codebases each agent tier can access.

**To create a policy:**

1. Click **New Policy** and select the policy type.
2. Use the rich text editor to draft your policy content. Templates are provided as starting points.
3. Use the version control system to track changes over time.
4. Policies can be exported to DOCX format for external review.
5. Mark policies as Draft, In Review, or Approved.

### Gate Reviews

GovAI Studio implements a three-gate approval process:

- **Gate 1 - Discovery Complete**: Confirms that the assessment is finished, scores are acceptable, and prerequisites are on track. Required before sandbox setup.
- **Gate 2 - Sandbox Validated**: Confirms that the test environment is properly configured, security controls are in place, and the team is trained. Required before PoC begins.
- **Gate 3 - PoC Complete**: Reviews PoC results, confirms metrics meet success criteria, and validates that production readiness requirements are satisfied. Required before production rollout.

Each gate review includes:
- An evidence checklist of required artifacts.
- Approval fields for designated reviewers.
- Comments and discussion threads.
- Pass/Fail/Conditional Pass outcomes.
- Date stamps and audit trail.

### Compliance Mapping

The compliance mapper helps you demonstrate how your AI governance controls align with existing frameworks:

- **SOC 2**: Map AI controls to Trust Services Criteria.
- **HIPAA**: Ensure AI agents do not process PHI inappropriately.
- **NIST AI RMF**: Align with the AI Risk Management Framework.
- **GDPR**: Address data processing and automated decision-making requirements.

For each framework, you can:
1. View the list of relevant controls.
2. Map your policies and procedures to each control.
3. Note the compliance status (Compliant, Partially Compliant, Non-Compliant, Not Applicable).
4. Attach evidence documents.

### RACI Matrix

The RACI (Responsible, Accountable, Consulted, Informed) matrix defines role assignments for each governance activity:

1. Navigate to **Governance > RACI Matrix**.
2. Rows represent governance activities (policy creation, incident response, gate reviews, etc.).
3. Columns represent team roles (Admin, Consultant, Executive, IT, Legal, Engineering, Marketing).
4. Click a cell to assign a RACI designation.
5. The matrix can be exported for inclusion in governance documentation.

### Risk Classification

The risk manager allows you to define and categorize AI-related risks:

- Create risk tiers (Critical, High, Medium, Low).
- Define risk categories (Data Leakage, Code Quality, Compliance, Availability, etc.).
- Assign likelihood and impact ratings.
- Map risks to mitigation controls.
- Track risk status over time.

---

## Sandbox Phase

The Sandbox phase guides you through setting up a secure, isolated environment for AI coding agent testing.

### Configuring Infrastructure

Navigate to **Sandbox > Configure** to define your test environment:

1. **Cloud Provider**: Select your provider (AWS, Azure, GCP, or on-premises).
2. **AI Model Selection**: Choose which models to enable (Claude Code, OpenAI Codex, or both for comparison).
3. **Network Configuration**: Define network isolation rules, proxy settings, and allowed endpoints.
4. **Resource Limits**: Set compute, memory, and API rate limits for the sandbox.
5. **Security Controls**: Configure DLP rules, secrets scanning, and audit logging.
6. **Repository Access**: Specify which repositories the agents can access during testing.

### Understanding Generated Config Files

After completing the infrastructure questionnaire, GovAI Studio generates configuration files:

- **managed-settings.json**: Claude Code configuration with model permissions, allowed tools, and behavioral constraints.
- **requirements.toml**: Dependency and environment requirements.
- **.claude/settings.json**: Project-level Claude Code settings.
- **Terraform/HCL files**: Infrastructure-as-code for cloud resource provisioning (if applicable).
- **YAML configs**: CI/CD pipeline configurations for secure agent integration.

You can view, edit, and download all generated files from the **Sandbox > Config Files** page. Each file includes inline comments explaining the configuration options.

### Validation

The validation page runs automated health checks on your sandbox configuration:

- Network connectivity tests.
- Authentication and authorization verification.
- DLP rule effectiveness checks.
- Model API accessibility confirmation.
- Resource limit enforcement validation.
- Logging pipeline verification.

Results are displayed as a checklist with Pass/Fail/Warning status for each check. Failed checks include remediation guidance.

---

## PoC (Proof of Concept) Phase

The PoC phase is where you run controlled evaluations of AI coding agents in your sandbox environment.

### Setting Up PoC Projects

Navigate to **PoC > Projects** to define your evaluation:

1. Click **New PoC Project**.
2. Define the project scope: which codebase, what types of tasks, expected outcomes.
3. Set selection criteria and scoring weights.
4. Assign team members to the evaluation.

### Sprint Evaluations

PoC projects are evaluated through time-boxed sprints:

1. Navigate to **PoC > Sprints**.
2. Create sprint windows (typically 1-2 weeks each).
3. During each sprint, teams complete defined coding tasks both with and without AI assistance.
4. After each sprint, record metrics including:
   - Lines of code produced.
   - Time to complete tasks.
   - Defect rates.
   - Code review feedback.
   - Developer satisfaction scores.

### Comparing Tools

If you are evaluating multiple AI coding agents (e.g., Claude Code vs. OpenAI Codex), the comparison dashboard provides:

- Side-by-side metric charts.
- Radar chart comparing tool strengths across dimensions.
- Statistical significance indicators for metric differences.
- Qualitative feedback aggregation.
- Overall recommendation based on your weighted criteria.

### Tracking Metrics

The metrics page shows baseline vs. AI-assisted performance:

- **Velocity**: Story points or tasks completed per sprint.
- **Quality**: Defect density, code review pass rate, test coverage changes.
- **Efficiency**: Time savings per task category.
- **Satisfaction**: Developer experience survey results.
- **Cost**: API usage costs, infrastructure costs, ROI projections.

All metrics support export to CSV for further analysis.

---

## Timeline Phase

The Timeline phase helps you plan and track your AI deployment rollout.

### Using the Gantt Chart

The interactive Gantt chart is the primary tool for schedule management:

1. Navigate to **Timeline > Gantt Chart**.
2. Tasks appear as horizontal bars on a time axis.
3. **Drag and drop** task bars to adjust start and end dates.
4. **Resize** bars by dragging the left or right edge to change duration.
5. **Dependency arrows** (SVG lines) connect related tasks. Supported types:
   - FS (Finish-to-Start): Task B starts after Task A finishes.
   - SS (Start-to-Start): Task B starts when Task A starts.
   - FF (Finish-to-Finish): Task B finishes when Task A finishes.
   - SF (Start-to-Finish): Task B finishes when Task A starts.
6. The **critical path** is highlighted in a distinct color, showing the longest chain of dependent tasks.
7. **Zoom levels**: Switch between Day, Week, Month, and Quarter views using the toolbar.
8. **Real-time collaboration**: Changes made by team members appear live via Supabase real-time subscriptions.
9. **Export**: Download the chart as PDF, PNG, or CSV.

### Milestones

Milestones mark key decision points and deliverable deadlines:

1. Navigate to **Timeline > Milestones**.
2. Create milestones with a name, target date, and description.
3. Link milestones to gate reviews for automatic status tracking.
4. View milestone status: Upcoming, On Track, At Risk, Missed, Completed.
5. Milestones appear as diamond markers on the Gantt chart.

### Schedule Snapshots

Snapshots let you capture point-in-time baselines of your schedule:

1. Navigate to **Timeline > Snapshots**.
2. Click **Take Snapshot** to save the current state of all tasks and milestones.
3. Compare any two snapshots side-by-side to see schedule drift.
4. Useful for reporting schedule adherence to stakeholders.

---

## Reports Phase

The Reports phase generates stakeholder-specific documents that communicate your findings and recommendations.

### Generating Reports

1. Navigate to **Reports > Generate**.
2. Select the target persona:
   - **Executive**: High-level feasibility score, ROI projections, risk heat map, go/no-go recommendation. Output: PDF, 3-5 pages.
   - **Legal**: Contract analysis, compliance mapping details, AUP review notes. Output: DOCX (editable), 10-15 pages.
   - **IT / Security**: Sandbox architecture diagrams, network configuration details, DLP rule documentation. Output: PDF plus config file attachments.
   - **Engineering**: Tool comparison data, setup guides, metric deep-dives, best practices. Output: Markdown plus PDF.
   - **Marketing**: Messaging guide, internal FAQ, change management narrative for organizational rollout. Output: DOCX (editable).
3. Select which sections to include (all are selected by default).
4. Optionally customize the report title and add a cover letter.
5. Click **Generate Report** and wait for processing.
6. Download the report from the generation results page or find it later in **Reports > History**.

### Report History

All previously generated reports are stored and accessible:

- View generation date, persona type, and file format.
- Download any past report.
- Regenerate a report with updated data.
- Delete reports that are no longer needed.

---

## ROI Calculator

The ROI Calculator helps you build a financial case for AI coding agent adoption.

### How to Use

1. Navigate to your project and select **ROI Calculator** from the sidebar.
2. Enter your input parameters:
   - **Number of developers** who will use AI coding agents.
   - **Average developer salary** (used to calculate cost of time).
   - **Estimated productivity gain** (percentage, typically 15-40% based on industry data).
   - **License/API costs** for the AI tools being evaluated.
   - **Implementation costs** (training, infrastructure, consulting).
   - **Time horizon** for the ROI calculation (months).
3. The calculator computes:
   - **Monthly savings**: Developer time saved multiplied by cost per hour.
   - **Total investment**: License fees plus implementation costs.
   - **Net ROI**: Total savings minus total investment.
   - **Break-even point**: When cumulative savings exceed cumulative costs.
   - **Annual ROI percentage**: Return on investment as a percentage.

### Interpreting Results

- A positive ROI with a break-even under 6 months is generally considered a strong case.
- The calculator provides both conservative and optimistic scenarios.
- Export the ROI analysis for inclusion in executive reports.

---

## Meeting Tracker

The Meeting Tracker helps you log governance meetings and track action items.

### Logging Meetings

1. Navigate to your project and select **Meetings** from the sidebar.
2. Click **New Meeting** to create a record.
3. Fill in:
   - **Meeting Title**: Descriptive name (e.g., "Gate 1 Review Board").
   - **Date and Time**: When the meeting occurred.
   - **Attendees**: Select from team members.
   - **Agenda**: What was planned for discussion.
   - **Notes**: Key discussion points and decisions.
   - **Action Items**: Tasks that came out of the meeting.
4. Save the meeting record.

### Tracking Action Items

- Each action item has an owner, due date, and status.
- Action items appear in the assignee's task list.
- Overdue items are highlighted.
- Filter meetings by date range, attendees, or status of their action items.

---

## Team Management

### Inviting Team Members

1. Navigate to **Team** from the project sidebar.
2. Click **Invite Member**.
3. Enter the team member's email address.
4. Select their role (see below).
5. Click **Send Invitation**.
6. The invited user will receive an email with login instructions.

### Role Descriptions

| Role | Description | Typical Access |
|------|-------------|----------------|
| **Admin** | Full access to all features and settings. Can manage team members, configure integrations, and access billing. | Everything |
| **Consultant** | Can run assessments, create policies, configure sandboxes, and generate reports. Cannot manage billing or org settings. | All project features |
| **Executive** | Read access to dashboards, reports, and scores. Can approve gate reviews. Limited edit access. | Reports, gate approvals, overview |
| **IT** | Full access to sandbox configuration, validation, and security-related governance features. | Sandbox, security policies, compliance |
| **Legal** | Full access to policies, compliance mappings, and legal-focused reports. Can review and approve AUPs. | Policies, compliance, legal reports |
| **Engineering** | Access to PoC features, metrics, tool comparisons, and engineering reports. Can manage sprint evaluations. | PoC, metrics, engineering reports |
| **Marketing** | Access to marketing reports and change management documentation. Read access to project overview. | Marketing reports, overview |

---

## Settings

### Organization Configuration

Navigate to **Settings** from the sidebar to manage:

- **Organization Profile**: Name, logo, industry, company size.
- **Billing**: Subscription plan, payment method, invoice history.
- **Integrations**: Connect external services (Jira, Slack, GitHub, etc.).
- **Security**: SSO configuration, session timeout settings, IP allowlists.
- **Notifications**: Email and in-app notification preferences.
- **Data Management**: Export all organization data, request data deletion.

---

## Keyboard Shortcuts

GovAI Studio supports keyboard shortcuts for efficient navigation:

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open command palette |
| `Escape` | Close current dialog or palette |
| `G` then `D` | Go to Dashboard |
| `G` then `S` | Go to Settings |
| `G` then `N` | Go to New Project |

Use the command palette (Cmd+K) to quickly navigate to any page, run actions, or access recent projects without using the mouse.

---

## FAQ

### General

**Q: What browsers are supported?**
A: GovAI Studio supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend Chrome or Firefox.

**Q: Can I use GovAI Studio on mobile devices?**
A: The application is designed for desktop use. While the interface is responsive, features like the Gantt chart and policy editor are best used on a screen 1024px or wider.

**Q: How is my data protected?**
A: All data is stored in Supabase (PostgreSQL) with Row Level Security (RLS) policies ensuring that users can only access data belonging to their organization. All API communications use HTTPS. AI API calls (to Claude) are processed server-side only and never expose your API keys to the browser.

**Q: Can multiple team members work on the same project simultaneously?**
A: Yes. GovAI Studio uses Supabase real-time subscriptions for live collaboration. Changes made by one team member appear in real time for others viewing the same page (particularly in the Gantt chart and task management views).

### Assessment and Scoring

**Q: Can I retake the assessment questionnaire?**
A: Yes. Navigate to Discovery > Questionnaire and click "Start New Assessment." Your previous responses are preserved in the history for comparison.

**Q: How are the readiness scores calculated?**
A: Each question has a maximum point value and a weight within its domain. Your response is scored against the maximum, and domain scores are the weighted average of all questions in that domain. The overall score is a weighted aggregate: Infrastructure 25%, Security 25%, Governance 20%, Engineering 15%, Business 15%.

**Q: What if our score is low in one domain but high in others?**
A: The radar chart makes domain-specific gaps easy to identify. Focus on the remediation tasks generated for your weakest domains. A "Conditionally Ready" rating means you can proceed with PoC while addressing gaps in parallel.

### Governance

**Q: Can I customize the policy templates?**
A: Yes. While GovAI Studio provides starting templates for AUP, IRP addendum, and data classification policies, you can edit all content to match your organization's specific requirements and language.

**Q: What happens if a gate review fails?**
A: A failed gate review generates a list of remediation items that must be addressed before the review can be re-attempted. The project cannot officially advance to the next phase until the gate passes, though you can continue preparatory work.

**Q: Can we add custom compliance frameworks beyond SOC 2, HIPAA, NIST, and GDPR?**
A: The current version supports these four frameworks. Custom framework support is planned for a future release. In the meantime, you can use the Notes field in compliance mappings to reference additional frameworks.

### Sandbox and PoC

**Q: Do I need my own cloud account for the sandbox?**
A: Yes. GovAI Studio generates the configuration files, but you deploy them to your own cloud infrastructure (AWS, Azure, GCP, or on-premises). This ensures your code and data never leave your controlled environment.

**Q: How many sprints should a PoC include?**
A: We recommend a minimum of 3 sprints (typically 1-2 weeks each) to gather statistically meaningful data. The first sprint often serves as a learning period, so metrics from sprints 2 and 3 tend to be more representative.

**Q: Can we evaluate more than two tools at once?**
A: The comparison dashboard is optimized for head-to-head comparisons (e.g., Claude Code vs. Codex), but you can create multiple PoC projects within the same governance project to evaluate additional tools. Cross-project comparison is available in the reports.

### Reports and Export

**Q: Can I customize which sections appear in a report?**
A: Yes. During report generation, you can select or deselect individual sections. You can also reorder sections and add custom introductory text.

**Q: What file formats are available for export?**
A: Reports are available in PDF and DOCX format depending on the persona type. The Gantt chart can be exported as PDF, PNG, or CSV. Assessment data and metrics can be exported as CSV.

**Q: Can reports be automatically scheduled?**
A: Automatic report scheduling is not currently available. Reports must be generated manually. This feature is planned for a future release.

### Troubleshooting

**Q: The Gantt chart is not loading or appears blank.**
A: Ensure you have at least one task created in the timeline. If the issue persists, try refreshing the page or clearing your browser cache. The Gantt chart requires JavaScript enabled.

**Q: I cannot see a project that I should have access to.**
A: Check with your administrator that you have been added as a team member on that specific project. Organization membership alone does not grant project access -- you must be explicitly added to each project.

**Q: My assessment responses were not saved.**
A: Ensure you have a stable internet connection. GovAI Studio auto-saves responses, but network interruptions can prevent saves. Check for a "Saving..." indicator in the questionnaire interface. If responses are lost, you can re-enter them -- the system preserves any previously saved partial responses.

---

*This guide covers GovAI Studio v0.1.0. For the latest updates and release notes, check the application's Settings page or contact your administrator.*
