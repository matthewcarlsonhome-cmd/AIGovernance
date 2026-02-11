'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  MessageSquare,
  FileText,
  Calendar,
  ShieldAlert,
  Edit2,
  Eye,
  FileDown,
  Plus,
  Send,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Presentation,
  Briefcase,
  Megaphone,
  HelpCircle,
  MessageCircle,
  UserCheck,
  AlertOctagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  StakeholderCommunicationPackage,
  CommunicationItem,
  CommunicationCalendarEntry,
  CommunicationType,
} from '@/types';

// ---------- Demo Data ----------

const DEMO_COMMUNICATIONS: CommunicationItem[] = [
  {
    id: 'comm-001',
    type: 'board_presentation',
    title: 'AI Governance Initiative Board Update',
    audience: 'Board of Directors, C-Suite',
    key_messages: [
      'AI governance framework is on track with 85% milestone completion',
      'Risk mitigation controls exceed industry benchmarks for our sector',
      'Projected ROI of 340% over three years with conservative estimates',
      'Regulatory compliance posture strengthened across SOC2 and GDPR',
    ],
    content:
      'Comprehensive board presentation covering the strategic rationale for AI coding tool adoption, governance framework implementation progress, risk management posture, financial projections, and recommended next steps for scaling beyond the pilot phase.',
    tone: 'formal',
    status: 'review',
    scheduled_date: '2025-03-15',
  },
  {
    id: 'comm-002',
    type: 'executive_briefing',
    title: 'Q2 AI Implementation Progress',
    audience: 'VP Engineering, CTO, CFO, CISO',
    key_messages: [
      'Pilot teams achieved 32% productivity improvement measured by cycle time',
      'Zero security incidents during sandbox phase with full DLP enforcement',
      'License costs tracking 15% under budget due to phased rollout strategy',
    ],
    content:
      'Executive briefing summarizing Q2 progress across all workstreams including sandbox deployment, pilot team metrics, security audit results, and budget utilization. Includes go/no-go recommendation for Phase 2 expansion.',
    tone: 'professional',
    status: 'approved',
    scheduled_date: '2025-04-01',
  },
  {
    id: 'comm-003',
    type: 'employee_announcement',
    title: 'New AI Tools Available',
    audience: 'All Engineering Staff',
    key_messages: [
      'AI coding assistants are now available to all engineering teams',
      'Mandatory AUP training must be completed before access is provisioned',
      'Dedicated support channel and office hours available for onboarding',
      'Your feedback shapes how we evolve our AI tooling strategy',
    ],
    content:
      'Organization-wide announcement introducing the availability of AI coding assistants to the broader engineering team following successful pilot completion. Covers access procedures, required training, support resources, and feedback mechanisms.',
    tone: 'professional',
    status: 'draft',
    scheduled_date: '2025-04-15',
  },
  {
    id: 'comm-004',
    type: 'employee_faq',
    title: 'AI Coding Assistant FAQ',
    audience: 'All Employees',
    key_messages: [
      'AI tools augment your expertise -- they do not replace your judgment',
      'All AI interactions are governed by our Acceptable Use Policy',
      'No proprietary code or customer data is used for model training',
      'Performance evaluations will not penalize choosing not to use AI tools',
    ],
    content:
      'Comprehensive FAQ addressing common employee questions about AI coding assistant adoption, data privacy, job security, acceptable use boundaries, and how the tools integrate into existing development workflows.',
    tone: 'casual',
    status: 'review',
    scheduled_date: null,
  },
  {
    id: 'comm-005',
    type: 'manager_talking_points',
    title: 'Team AI Adoption Guide',
    audience: 'Engineering Managers, Tech Leads',
    key_messages: [
      'Frame AI as a productivity multiplier, not a replacement for skills',
      'Encourage experimentation while respecting individual comfort levels',
      'Monitor team sentiment and escalate concerns through defined channels',
    ],
    content:
      'Talking points guide for managers to address team questions, handle resistance, celebrate early wins, and ensure consistent messaging across all engineering teams during the AI tool rollout.',
    tone: 'professional',
    status: 'approved',
    scheduled_date: '2025-03-20',
  },
  {
    id: 'comm-006',
    type: 'customer_announcement',
    title: 'AI-Enhanced Services Update',
    audience: 'Enterprise Customers, Partners',
    key_messages: [
      'AI tools improve our development velocity, delivering features faster',
      'Rigorous governance ensures no customer data exposure to AI models',
      'Our security and compliance posture has been independently verified',
      'Detailed transparency report available upon request',
    ],
    content:
      'Customer-facing communication explaining how AI-enhanced development practices improve service delivery while maintaining the highest standards of data protection, security, and compliance.',
    tone: 'formal',
    status: 'draft',
    scheduled_date: '2025-05-01',
  },
];

const DEMO_CALENDAR: CommunicationCalendarEntry[] = [
  {
    id: 'cal-001',
    milestone: 'Gate 1: Governance Framework Approval',
    date: '2025-03-10',
    communications: ['Board Presentation', 'Executive Briefing'],
    owner: 'Chief Technology Officer',
    status: 'completed',
  },
  {
    id: 'cal-002',
    milestone: 'Gate 2: Sandbox Deployment Complete',
    date: '2025-03-20',
    communications: ['Manager Talking Points', 'Security Team Briefing'],
    owner: 'VP Engineering',
    status: 'completed',
  },
  {
    id: 'cal-003',
    milestone: 'Pilot Phase Kickoff',
    date: '2025-04-01',
    communications: ['Executive Briefing', 'Employee Announcement'],
    owner: 'Engineering Manager',
    status: 'in_progress',
  },
  {
    id: 'cal-004',
    milestone: 'Gate 3: Production Readiness Review',
    date: '2025-04-15',
    communications: ['Employee Announcement', 'Employee FAQ', 'Customer Announcement'],
    owner: 'Chief Technology Officer',
    status: 'planned',
  },
  {
    id: 'cal-005',
    milestone: 'Organization-Wide Rollout',
    date: '2025-05-01',
    communications: ['Customer Announcement', 'Board Update', 'All-Hands Presentation'],
    owner: 'VP Engineering',
    status: 'planned',
  },
];

const DEMO_CRISIS_FRAMEWORK = `## Crisis Communication Framework for AI Governance

### Severity Level 1 -- Critical (Immediate Response Required)
**Triggers:** Data breach involving AI systems, unauthorized model access, customer data exposure through AI tools, regulatory enforcement action.
**Response Time:** Within 1 hour of detection.
**Notification Chain:** CISO > CTO > CEO > Legal > Board Chair > Affected Customers.
**Key Actions:**
- Immediately isolate affected AI systems and revoke access tokens
- Activate incident response team with pre-assigned roles
- Draft initial holding statement within 2 hours
- Engage external legal counsel and PR firm within 4 hours
- Notify affected parties within regulatory timeframes (72 hours for GDPR)

### Severity Level 2 -- High (Same-Day Response)
**Triggers:** AI tool generating inappropriate or biased content, significant model performance degradation, vendor security incident, compliance audit finding.
**Response Time:** Within 4 hours of detection.
**Notification Chain:** Engineering Lead > CISO > CTO > VP Engineering > HR (if employee-facing).
**Key Actions:**
- Document the incident with evidence and impact assessment
- Restrict AI tool access for affected use cases if necessary
- Prepare internal communication for affected teams within 8 hours
- Conduct root cause analysis within 48 hours
- Update risk register and controls as needed

### Severity Level 3 -- Medium (Next Business Day)
**Triggers:** Employee misuse of AI tools, minor policy violation, negative media coverage about AI in the industry, competitor incident with lessons learned.
**Response Time:** Within 24 hours.
**Notification Chain:** Team Lead > Engineering Manager > VP Engineering.
**Key Actions:**
- Log incident in governance tracking system
- Review and reinforce relevant AUP sections with involved parties
- Assess whether policy or training updates are needed
- Prepare talking points for managers if employee questions are expected
- Schedule retrospective within 1 week

### Escalation Matrix

| Role | Level 1 | Level 2 | Level 3 |
|------|---------|---------|---------|
| CISO | Decision Maker | Decision Maker | Informed |
| CTO | Decision Maker | Consulted | Informed |
| CEO | Informed | Informed (if public) | Not Required |
| Legal | Active | Consulted | As Needed |
| HR | Active (if employee data) | Consulted | As Needed |
| Communications | Active | On Standby | Not Required |
| Board | Notified within 24h | Briefed if material | Not Required |

### Pre-Approved Response Templates
1. **Data Incident Initial Statement:** "We have identified a [scope] incident involving our AI development tools. Our incident response team has been activated and affected systems have been isolated. We are conducting a thorough investigation and will provide updates as more information becomes available."
2. **Employee Misuse Communication:** "We are aware of an incident involving AI tool usage that did not align with our Acceptable Use Policy. We are working with the individuals involved to understand the circumstances and reinforce our guidelines. This is a reminder that all AI tool usage must comply with our published AUP."
3. **Vendor Incident Statement:** "We have been notified of a security matter involving one of our AI tool vendors. We have assessed the potential impact to our systems and data. [Specific actions taken]. We continue to monitor the situation and maintain direct communication with the vendor's security team."

### Communication Principles During Crisis
- **Transparency:** Acknowledge what happened without speculation
- **Accountability:** Take ownership of the response, even for vendor issues
- **Timeliness:** Communicate early and often, even if details are incomplete
- **Consistency:** All spokespersons use approved messaging
- **Empathy:** Acknowledge impact on affected parties`;

const DEMO_PACKAGE: StakeholderCommunicationPackage = {
  id: 'pkg-001',
  project_id: 'proj-001',
  communications: DEMO_COMMUNICATIONS,
  calendar: DEMO_CALENDAR,
  crisis_framework: DEMO_CRISIS_FRAMEWORK,
  created_at: '2025-01-20T09:00:00Z',
  updated_at: '2025-02-10T14:30:00Z',
};

// ---------- Helpers ----------

const typeConfig: Record<CommunicationType, { label: string; color: string; icon: React.ElementType }> = {
  board_presentation: { label: 'Board Presentation', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Presentation },
  executive_briefing: { label: 'Executive Briefing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Briefcase },
  employee_announcement: { label: 'Employee Announcement', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Megaphone },
  employee_faq: { label: 'Employee FAQ', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: HelpCircle },
  manager_talking_points: { label: 'Manager Talking Points', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: UserCheck },
  customer_announcement: { label: 'Customer Announcement', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Send },
  customer_faq: { label: 'Customer FAQ', color: 'bg-sky-100 text-sky-800 border-sky-200', icon: MessageCircle },
  crisis_communication: { label: 'Crisis Communication', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertOctagon },
};

const toneColors: Record<CommunicationItem['tone'], string> = {
  formal: 'bg-slate-100 text-slate-700 border-slate-200',
  professional: 'bg-blue-50 text-blue-700 border-blue-200',
  casual: 'bg-green-50 text-green-700 border-green-200',
};

const statusConfig: Record<CommunicationItem['status'], { color: string; icon: React.ElementType }> = {
  draft: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText },
  review: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  approved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  sent: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send },
};

const calendarStatusConfig: Record<CommunicationCalendarEntry['status'], { color: string; label: string }> = {
  planned: { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Planned' },
  in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'In Progress' },
  completed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Completed' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------- Page Component ----------

export default function CommunicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  void resolvedParams;

  const [activeTab, setActiveTab] = useState<string>('templates');
  const [expandedCrisis, setExpandedCrisis] = useState<string | null>(null);
  const pkg = DEMO_PACKAGE;

  const tabs = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'crisis', label: 'Crisis Framework', icon: ShieldAlert },
  ];

  const statusCounts = {
    draft: pkg.communications.filter((c) => c.status === 'draft').length,
    review: pkg.communications.filter((c) => c.status === 'review').length,
    approved: pkg.communications.filter((c) => c.status === 'approved').length,
    sent: pkg.communications.filter((c) => c.status === 'sent').length,
  };

  const calendarCounts = {
    planned: pkg.calendar.filter((c) => c.status === 'planned').length,
    in_progress: pkg.calendar.filter((c) => c.status === 'in_progress').length,
    completed: pkg.calendar.filter((c) => c.status === 'completed').length,
  };

  // Parse crisis framework into sections for structured display
  const crisisSections = [
    {
      id: 'level-1',
      title: 'Severity Level 1 -- Critical',
      subtitle: 'Immediate Response Required',
      color: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      responseTime: 'Within 1 hour',
      triggers: [
        'Data breach involving AI systems',
        'Unauthorized model access',
        'Customer data exposure through AI tools',
        'Regulatory enforcement action',
      ],
      actions: [
        'Immediately isolate affected AI systems and revoke access tokens',
        'Activate incident response team with pre-assigned roles',
        'Draft initial holding statement within 2 hours',
        'Engage external legal counsel and PR firm within 4 hours',
        'Notify affected parties within regulatory timeframes (72 hours for GDPR)',
      ],
      chain: 'CISO > CTO > CEO > Legal > Board Chair > Affected Customers',
    },
    {
      id: 'level-2',
      title: 'Severity Level 2 -- High',
      subtitle: 'Same-Day Response',
      color: 'border-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      responseTime: 'Within 4 hours',
      triggers: [
        'AI tool generating inappropriate or biased content',
        'Significant model performance degradation',
        'Vendor security incident',
        'Compliance audit finding',
      ],
      actions: [
        'Document the incident with evidence and impact assessment',
        'Restrict AI tool access for affected use cases if necessary',
        'Prepare internal communication for affected teams within 8 hours',
        'Conduct root cause analysis within 48 hours',
        'Update risk register and controls as needed',
      ],
      chain: 'Engineering Lead > CISO > CTO > VP Engineering > HR (if employee-facing)',
    },
    {
      id: 'level-3',
      title: 'Severity Level 3 -- Medium',
      subtitle: 'Next Business Day',
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      responseTime: 'Within 24 hours',
      triggers: [
        'Employee misuse of AI tools',
        'Minor policy violation',
        'Negative media coverage about AI in the industry',
        'Competitor incident with lessons learned',
      ],
      actions: [
        'Log incident in governance tracking system',
        'Review and reinforce relevant AUP sections with involved parties',
        'Assess whether policy or training updates are needed',
        'Prepare talking points for managers if employee questions are expected',
        'Schedule retrospective within 1 week',
      ],
      chain: 'Team Lead > Engineering Manager > VP Engineering',
    },
  ];

  const responseTemplates = [
    {
      title: 'Data Incident Initial Statement',
      template:
        'We have identified a [scope] incident involving our AI development tools. Our incident response team has been activated and affected systems have been isolated. We are conducting a thorough investigation and will provide updates as more information becomes available.',
    },
    {
      title: 'Employee Misuse Communication',
      template:
        'We are aware of an incident involving AI tool usage that did not align with our Acceptable Use Policy. We are working with the individuals involved to understand the circumstances and reinforce our guidelines. This is a reminder that all AI tool usage must comply with our published AUP.',
    },
    {
      title: 'Vendor Incident Statement',
      template:
        'We have been notified of a security matter involving one of our AI tool vendors. We have assessed the potential impact to our systems and data. [Specific actions taken]. We continue to monitor the situation and maintain direct communication with the vendor\'s security team.',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            Stakeholder Communication Package
          </h1>
          <p className="text-slate-500 mt-1">
            Build, schedule, and manage stakeholder communications for your AI governance initiative
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Communication
          </Button>
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2">
            <FileDown className="h-4 w-4" />
            Export Package
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {pkg.communications.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total Communications</p>
            <div className="flex justify-center gap-1 mt-2">
              <span className="inline-flex items-center text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300 mr-1" />
                {statusCounts.draft} draft
              </span>
              <span className="inline-flex items-center text-xs text-yellow-600">
                <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />
                {statusCounts.review} review
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {statusCounts.approved}
            </p>
            <p className="text-xs text-slate-500 mt-1">Approved</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">
              Ready to send
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {pkg.calendar.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Calendar Entries</p>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              {calendarCounts.completed} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center">
              <ShieldAlert className="h-7 w-7 text-red-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Crisis Framework</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">
              {pkg.crisis_framework ? 'Active' : 'Not configured'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================== Templates Tab ==================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Communication Templates
            </h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                {statusCounts.draft} Draft
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                {statusCounts.review} In Review
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {statusCounts.approved} Approved
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pkg.communications.map((comm: CommunicationItem) => {
              const typeInfo = typeConfig[comm.type];
              const statusInfo = statusConfig[comm.status];
              const TypeIcon = typeInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={comm.id} className="border-l-4" style={{ borderLeftColor: getBorderColor(comm.type) }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                          <Badge className={toneColors[comm.tone]}>
                            {comm.tone.charAt(0).toUpperCase() + comm.tone.slice(1)}
                          </Badge>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{comm.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {comm.audience}
                      </span>
                      {comm.scheduled_date && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(comm.scheduled_date)}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600 line-clamp-2">{comm.content}</p>

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                        Key Messages
                      </p>
                      <ul className="space-y-1">
                        {comm.key_messages.map((msg, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <ArrowUpRight className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{msg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      {comm.status === 'approved' && (
                        <Button size="sm" className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 ml-auto">
                          <Send className="h-3 w-3" />
                          Send
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== Calendar Tab ==================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Communication Calendar
            </h2>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Add Entry
            </Button>
          </div>

          {/* Timeline */}
          <div className="relative">
            {pkg.calendar.map((entry: CommunicationCalendarEntry, idx: number) => {
              const calStatus = calendarStatusConfig[entry.status];
              const isLast = idx === pkg.calendar.length - 1;

              return (
                <div key={entry.id} className="relative flex gap-4 pb-6">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        entry.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : entry.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {entry.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : entry.status === 'in_progress' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <Calendar className="h-5 w-5" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 mt-1 ${
                          entry.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content card */}
                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {entry.milestone}
                            </h3>
                            <Badge className={calStatus.color}>
                              {calStatus.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(entry.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {entry.owner}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                          Associated Communications
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.communications.map((commName, cIdx) => (
                            <Badge
                              key={cIdx}
                              className="bg-indigo-50 text-indigo-700 border-indigo-200"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {commName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Calendar Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Communication Timeline Summary
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {calendarCounts.completed} of {pkg.calendar.length} milestone communications completed.{' '}
                    {calendarCounts.in_progress > 0 && (
                      <>{calendarCounts.in_progress} currently in progress. </>
                    )}
                    {calendarCounts.planned > 0 && (
                      <>{calendarCounts.planned} upcoming milestones require attention.</>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================== Crisis Framework Tab ==================== */}
      {activeTab === 'crisis' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              Crisis Communication Framework
            </h2>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit2 className="h-3 w-3" />
              Edit Framework
            </Button>
          </div>

          {/* Severity Level Cards */}
          <div className="space-y-4">
            {crisisSections.map((section) => (
              <Card key={section.id} className={`border-l-4 ${section.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${section.textColor}`} />
                        {section.title}
                      </CardTitle>
                      <p className={`text-xs mt-1 ${section.textColor}`}>{section.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={section.badgeColor}>
                        <Clock className="h-3 w-3 mr-1" />
                        {section.responseTime}
                      </Badge>
                      <button
                        onClick={() =>
                          setExpandedCrisis(expandedCrisis === section.id ? null : section.id)
                        }
                        className="text-xs text-slate-500 hover:text-slate-700 underline"
                      >
                        {expandedCrisis === section.id ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${section.bgColor}`}>
                      <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${section.textColor}`}>
                        Triggers
                      </p>
                      <ul className="space-y-1">
                        {section.triggers.map((trigger, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <AlertOctagon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${section.textColor}`} />
                            <span>{trigger}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                        Notification Chain
                      </p>
                      <p className="text-sm text-slate-700 font-medium">{section.chain}</p>
                    </div>
                  </div>

                  {expandedCrisis === section.id && (
                    <div className="mt-4 p-3 rounded-lg bg-white border border-slate-200">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                        Key Actions
                      </p>
                      <ol className="space-y-2">
                        {section.actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold shrink-0">
                              {idx + 1}
                            </span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Escalation Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-slate-600" />
                Escalation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-3 px-3 font-medium text-slate-700">Role</th>
                      <th className="py-3 px-3 font-medium text-red-700 text-center">Level 1 (Critical)</th>
                      <th className="py-3 px-3 font-medium text-orange-700 text-center">Level 2 (High)</th>
                      <th className="py-3 px-3 font-medium text-yellow-700 text-center">Level 3 (Medium)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: 'CISO', l1: 'Decision Maker', l2: 'Decision Maker', l3: 'Informed' },
                      { role: 'CTO', l1: 'Decision Maker', l2: 'Consulted', l3: 'Informed' },
                      { role: 'CEO', l1: 'Informed', l2: 'Informed (if public)', l3: 'Not Required' },
                      { role: 'Legal', l1: 'Active', l2: 'Consulted', l3: 'As Needed' },
                      { role: 'HR', l1: 'Active (if employee data)', l2: 'Consulted', l3: 'As Needed' },
                      { role: 'Communications', l1: 'Active', l2: 'On Standby', l3: 'Not Required' },
                      { role: 'Board', l1: 'Notified within 24h', l2: 'Briefed if material', l3: 'Not Required' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-900">{row.role}</td>
                        <td className="py-3 px-3 text-center">
                          <Badge className={getEscalationBadge(row.l1)}>{row.l1}</Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge className={getEscalationBadge(row.l2)}>{row.l2}</Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge className={getEscalationBadge(row.l3)}>{row.l3}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Response Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-600" />
                Pre-Approved Response Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {responseTemplates.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-900">{tmpl.title}</p>
                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                      <Edit2 className="h-3 w-3" />
                      Customize
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    &ldquo;{tmpl.template}&rdquo;
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Communication Principles */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Communication Principles During Crisis
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
                    {[
                      { label: 'Transparency', desc: 'Acknowledge what happened without speculation' },
                      { label: 'Accountability', desc: 'Take ownership of the response, even for vendor issues' },
                      { label: 'Timeliness', desc: 'Communicate early and often, even if details are incomplete' },
                      { label: 'Consistency', desc: 'All spokespersons use approved messaging' },
                      { label: 'Empathy', desc: 'Acknowledge impact on affected parties' },
                    ].map((principle, idx) => (
                      <div key={idx} className="p-2 rounded bg-white/80 border border-red-100">
                        <p className="text-xs font-semibold text-red-800">{principle.label}</p>
                        <p className="text-xs text-red-700 mt-0.5">{principle.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ---------- Utility Functions ----------

function getBorderColor(type: CommunicationType): string {
  const colors: Record<CommunicationType, string> = {
    board_presentation: '#9333ea',
    executive_briefing: '#2563eb',
    employee_announcement: '#059669',
    employee_faq: '#0d9488',
    manager_talking_points: '#d97706',
    customer_announcement: '#4f46e5',
    customer_faq: '#0284c7',
    crisis_communication: '#dc2626',
  };
  return colors[type];
}

function getEscalationBadge(level: string): string {
  if (level.includes('Decision Maker') || level === 'Active' || level.startsWith('Active'))
    return 'bg-red-100 text-red-700 border-red-200';
  if (level === 'Consulted' || level.startsWith('Notified') || level.startsWith('Briefed') || level.startsWith('Informed'))
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (level === 'On Standby' || level === 'As Needed')
    return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-slate-50 text-slate-400 border-slate-200';
}
