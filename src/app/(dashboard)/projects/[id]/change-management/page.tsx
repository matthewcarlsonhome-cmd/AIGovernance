'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  Repeat,
  Users,
  Megaphone,
  GraduationCap,
  ShieldAlert,
  BarChart3,
  Edit2,
  FileDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  ChangeManagementPlan,
  ChangeReadinessFactor,
  StakeholderGroup,
  CommunicationChannel,
  TrainingModule,
  ResistanceRisk,
  AdoptionMetric,
} from '@/types';

// ---------- Demo Data ----------

const DEMO_CHANGE_PLAN: ChangeManagementPlan = {
  id: 'cmp-001',
  project_id: 'proj-001',
  readiness_score: 72,
  readiness_factors: [
    {
      factor: 'Leadership Sponsorship',
      score: 85,
      weight: 20,
      notes:
        'CTO and VP Engineering are active champions. Need stronger visible sponsorship from CEO for org-wide messaging.',
    },
    {
      factor: 'Cultural Openness',
      score: 68,
      weight: 15,
      notes:
        'Engineering culture is innovation-friendly, but pockets of resistance in senior staff who view AI as a threat to craftsmanship.',
    },
    {
      factor: 'Technical Skills Readiness',
      score: 60,
      weight: 20,
      notes:
        'Most developers have basic AI tool familiarity. Structured training needed for prompt engineering and AI-assisted workflows.',
    },
    {
      factor: 'Resource Availability',
      score: 78,
      weight: 15,
      notes:
        'Budget approved for licenses and training. Dedicated change lead assigned. Need additional training facilitators.',
    },
    {
      factor: 'Infrastructure Readiness',
      score: 82,
      weight: 15,
      notes:
        'Cloud infrastructure supports AI tool deployment. SSO integration complete. Network policies need minor updates.',
    },
    {
      factor: 'Change Experience',
      score: 55,
      weight: 15,
      notes:
        'Organization has limited recent experience with large-scale tooling changes. Last major shift (CI/CD adoption) took 18 months.',
    },
  ] satisfies ChangeReadinessFactor[],
  stakeholder_groups: [
    {
      group: 'Engineering Team',
      influence: 'high',
      impact: 'high',
      current_position: 'neutral',
      target_position: 'advocate',
      strategy:
        'Hands-on workshops, early access to sandbox, peer champion network, showcase quick wins from pilot teams.',
    },
    {
      group: 'Security & Compliance',
      influence: 'high',
      impact: 'medium',
      current_position: 'skeptic',
      target_position: 'supporter',
      strategy:
        'Involve in sandbox design, present DLP controls and audit capabilities, address data leakage concerns with evidence.',
    },
    {
      group: 'Legal & Privacy',
      influence: 'medium',
      impact: 'medium',
      current_position: 'skeptic',
      target_position: 'supporter',
      strategy:
        'Share vendor DPA and IP assignment clauses, co-develop AUP, provide regulatory compliance mapping.',
    },
    {
      group: 'Executive Leadership',
      influence: 'high',
      impact: 'low',
      current_position: 'advocate',
      target_position: 'champion',
      strategy:
        'Regular ROI updates, competitive landscape briefings, board-ready metrics dashboard, success stories.',
    },
    {
      group: 'HR & People Ops',
      influence: 'medium',
      impact: 'low',
      current_position: 'neutral',
      target_position: 'supporter',
      strategy:
        'Frame AI as augmentation not replacement, co-design role evolution framework, include in communications planning.',
    },
  ] satisfies StakeholderGroup[],
  communication_channels: [
    {
      audience: 'All Employees',
      message_theme: 'AI as Augmentation',
      channel: 'Company All-Hands + Email',
      frequency: 'Monthly',
      owner: 'VP Engineering',
    },
    {
      audience: 'Engineering Team',
      message_theme: 'Tools & Productivity Gains',
      channel: 'Slack #ai-tools + Sprint Demos',
      frequency: 'Weekly',
      owner: 'Engineering Manager',
    },
    {
      audience: 'Leadership Team',
      message_theme: 'ROI & Strategic Positioning',
      channel: 'Executive Dashboard + Briefings',
      frequency: 'Bi-weekly',
      owner: 'CTO',
    },
    {
      audience: 'Security & Legal',
      message_theme: 'Compliance & Risk Mitigation',
      channel: 'Governance Committee Meetings',
      frequency: 'Bi-weekly',
      owner: 'CISO',
    },
  ] satisfies CommunicationChannel[],
  training_modules: [
    {
      module: 'AI-Assisted Development Fundamentals',
      audience: 'All Developers',
      format: 'Instructor-led workshop + self-paced lab',
      duration: '8 hours (2 half-days)',
      prerequisites: 'Active IDE setup, basic command-line proficiency',
    },
    {
      module: 'AI Security & Compliance Awareness',
      audience: 'Security Team, Senior Engineers, Tech Leads',
      format: 'Seminar + tabletop exercise',
      duration: '4 hours (1 half-day)',
      prerequisites: 'Familiarity with organization AUP, basic DLP concepts',
    },
    {
      module: 'AI Tool Administration & Operations',
      audience: 'Platform Engineers, DevOps, IT Admin',
      format: 'Hands-on lab + documentation review',
      duration: '6 hours (1 full day)',
      prerequisites: 'Cloud infrastructure access, SSO admin experience',
    },
  ] satisfies TrainingModule[],
  resistance_risks: [
    {
      type: 'Skill Obsolescence Anxiety',
      indicators:
        'Reduced participation in training sign-ups, dismissive comments about AI quality, avoidance of AI-assisted features.',
      root_cause:
        'Senior developers feel their hard-earned expertise is being devalued. Concern that junior devs with AI will outperform them.',
      response_strategy:
        'Position AI as amplifying expertise: senior devs guide AI with better prompts. Create "AI Mentor" role for experienced staff. Celebrate human judgment in code review.',
      intensity: 'active',
    },
    {
      type: 'Job Displacement Fear',
      indicators:
        'Questions about headcount plans in town halls, increased attrition inquiries to HR, social media discussions about AI replacing developers.',
      root_cause:
        'Industry narratives about AI replacing knowledge workers. Lack of clear organizational messaging about workforce strategy.',
      response_strategy:
        'Executive communication: explicit no-layoffs-due-to-AI commitment for 24 months. Publish role evolution framework showing how roles grow, not shrink. Invest in upskilling budget.',
      intensity: 'skeptical',
    },
    {
      type: 'Code Quality Concerns',
      indicators:
        'Overly strict code review rejections of AI-assisted PRs, requests for AI-free branches, micro-benchmarking AI vs. human code.',
      root_cause:
        'Legitimate concern about introducing AI-generated bugs or security vulnerabilities. Perfectionism culture conflicting with AI probabilistic outputs.',
      response_strategy:
        'Publish AI code quality metrics from pilot (defect rates, test coverage). Strengthen CI/CD gates. Frame AI output as "first draft" requiring human refinement. Recognize valid quality catches.',
      intensity: 'passive',
    },
  ] satisfies ResistanceRisk[],
  adoption_metrics: [
    {
      category: 'awareness',
      metric: 'AI Policy Awareness',
      target: '95% of engineering staff acknowledge AUP within 30 days',
      measurement_method: 'AUP acceptance tracking in onboarding system',
    },
    {
      category: 'awareness',
      metric: 'Training Completion Rate',
      target: '90% complete fundamentals training within 60 days',
      measurement_method: 'LMS completion records and post-training assessment scores',
    },
    {
      category: 'adoption',
      metric: 'Active Daily Users',
      target: '70% of developers using AI tools daily by month 3',
      measurement_method: 'Telemetry from AI tool license management dashboard',
    },
    {
      category: 'adoption',
      metric: 'AI-Assisted PR Ratio',
      target: '50% of PRs include AI-assisted commits by month 4',
      measurement_method: 'Git metadata tagging and PR label analysis',
    },
    {
      category: 'sustainability',
      metric: 'Developer Satisfaction (NPS)',
      target: 'NPS > 40 for AI tooling at 6-month mark',
      measurement_method: 'Quarterly pulse survey with AI-specific questions',
    },
    {
      category: 'sustainability',
      metric: 'Productivity Improvement',
      target: '20% improvement in cycle time by month 6',
      measurement_method: 'Sprint velocity tracking and DORA metrics comparison to baseline',
    },
  ] satisfies AdoptionMetric[],
  created_at: '2025-01-20T09:00:00Z',
  updated_at: '2025-02-05T16:45:00Z',
};

// ---------- Helpers ----------

const influenceImpactColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const positionColors: Record<StakeholderGroup['current_position'], string> = {
  champion: 'bg-emerald-100 text-emerald-800',
  advocate: 'bg-green-100 text-green-800',
  supporter: 'bg-blue-100 text-blue-800',
  neutral: 'bg-slate-100 text-slate-700',
  skeptic: 'bg-orange-100 text-orange-800',
  resistant: 'bg-red-100 text-red-800',
};

const intensityColors: Record<ResistanceRisk['intensity'], string> = {
  passive: 'bg-blue-100 text-blue-800 border-blue-200',
  skeptical: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-orange-100 text-orange-800 border-orange-200',
  aggressive: 'bg-red-100 text-red-800 border-red-200',
};

const categoryColors: Record<
  AdoptionMetric['category'],
  { bg: string; border: string; icon: string; text: string }
> = {
  awareness: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
  },
  adoption: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
  },
  sustainability: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    text: 'text-purple-800',
  },
};

const categoryLabels: Record<AdoptionMetric['category'], string> = {
  awareness: 'Awareness',
  adoption: 'Adoption',
  sustainability: 'Sustainability',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

// ---------- Page Component ----------

export default function ChangeManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  void resolvedParams; // used for routing context

  const [activeTab, setActiveTab] = useState<string>('readiness');
  const plan = DEMO_CHANGE_PLAN;

  const tabs = [
    { id: 'readiness', label: 'Readiness', icon: BarChart3 },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'communications', label: 'Communications', icon: Megaphone },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'resistance', label: 'Resistance', icon: ShieldAlert },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp },
  ];

  const weightedScore = Math.round(
    plan.readiness_factors.reduce(
      (acc, f) => acc + (f.score * f.weight) / 100,
      0
    )
  );

  // SVG gauge calculations
  const gaugeRadius = 70;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset =
    gaugeCircumference - (plan.readiness_score / 100) * gaugeCircumference;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Repeat className="h-6 w-6 text-teal-600" />
            Change Management Planner
          </h1>
          <p className="text-slate-500 mt-1">
            Plan, track, and execute organizational change for AI coding tool
            adoption
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Plan
          </Button>
          <Button className="bg-teal-600 text-white hover:bg-teal-700 gap-2">
            <FileDown className="h-4 w-4" />
            Export Plan
          </Button>
        </div>
      </div>

      {/* Summary Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-teal-600">
              {plan.readiness_score}
            </p>
            <p className="text-xs text-slate-500 mt-1">Readiness Score</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-teal-500 h-1.5 rounded-full transition-all"
                style={{ width: `${plan.readiness_score}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {plan.stakeholder_groups.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Stakeholder Groups</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              {
                plan.stakeholder_groups.filter(
                  (s) =>
                    s.current_position === 'champion' ||
                    s.current_position === 'advocate'
                ).length
              }{' '}
              aligned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {plan.training_modules.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Training Modules</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              {plan.training_modules.reduce((acc, m) => {
                const hours = parseInt(m.duration, 10);
                return acc + (isNaN(hours) ? 0 : hours);
              }, 0)}
              h total duration
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {plan.resistance_risks.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Resistance Risks</p>
            <p className="text-xs text-orange-600 mt-1 font-medium">
              {
                plan.resistance_risks.filter(
                  (r) =>
                    r.intensity === 'active' || r.intensity === 'aggressive'
                ).length
              }{' '}
              active
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

      {/* ==================== Readiness Assessment ==================== */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Gauge */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                  Overall Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pb-6">
                <div className="relative w-48 h-48">
                  <svg
                    className="w-48 h-48 -rotate-90"
                    viewBox="0 0 160 160"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r={gaugeRadius}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={gaugeRadius}
                      fill="none"
                      className={getScoreRingColor(plan.readiness_score)}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(plan.readiness_score)}`}
                    >
                      {plan.readiness_score}
                    </span>
                    <span className="text-sm text-slate-500">out of 100</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Badge
                    className={`${
                      plan.readiness_score >= 80
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : plan.readiness_score >= 60
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {plan.readiness_score >= 80
                      ? 'Ready to Proceed'
                      : plan.readiness_score >= 60
                        ? 'Conditionally Ready'
                        : 'Not Ready'}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-2">
                    Weighted score: {weightedScore}/100
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Factor Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Readiness Factor Breakdown
                  </CardTitle>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="py-3 px-3 font-medium text-slate-700">
                          Factor
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700 w-20 text-center">
                          Score
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700 w-20 text-center">
                          Weight
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700 w-48">
                          Progress
                        </th>
                        <th className="py-3 px-3 font-medium text-slate-700">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.readiness_factors.map(
                        (factor: ChangeReadinessFactor, idx: number) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-3 px-3 font-medium text-slate-900">
                              {factor.factor}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`font-bold ${getScoreColor(factor.score)}`}
                              >
                                {factor.score}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-500">
                              {factor.weight}%
                            </td>
                            <td className="py-3 px-3">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${getScoreBarColor(factor.score)}`}
                                  style={{ width: `${factor.score}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-600 text-xs max-w-[300px]">
                              {factor.notes}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== Stakeholder Map ==================== */}
      {activeTab === 'stakeholders' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Stakeholder Map
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Group
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700 text-center">
                      Influence
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700 text-center">
                      Impact
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700 text-center">
                      Current Position
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700 text-center">
                      Target Position
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Engagement Strategy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.stakeholder_groups.map(
                    (group: StakeholderGroup, idx: number) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {group.group}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            className={influenceImpactColors[group.influence]}
                          >
                            {group.influence}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            className={influenceImpactColors[group.impact]}
                          >
                            {group.impact}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            className={
                              positionColors[group.current_position]
                            }
                          >
                            {group.current_position.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                            <Badge
                              className={
                                positionColors[group.target_position]
                              }
                            >
                              {group.target_position.replace('_', ' ')}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs max-w-[350px]">
                          {group.strategy}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==================== Communication Plan ==================== */}
      {activeTab === 'communications' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-600" />
                Communication Plan
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Audience
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Message Theme
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Channel
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Frequency
                    </th>
                    <th className="py-3 px-3 font-medium text-slate-700">
                      Owner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.communication_channels.map(
                    (channel: CommunicationChannel, idx: number) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {channel.audience}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {channel.message_theme}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {channel.channel}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                            {channel.frequency}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {channel.owner}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Communication Tips */}
            <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Communication Best Practice
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Begin change communication at least 2 weeks before any
                    tooling rollout. Frame messages around &quot;why&quot; before
                    &quot;what&quot; and &quot;how.&quot; Ensure two-way feedback
                    channels are open for each audience segment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==================== Training Program ==================== */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Training Program
            </h2>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.training_modules.map(
              (mod: TrainingModule, idx: number) => (
                <Card key={idx} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{mod.module}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Target Audience
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {mod.audience}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Format
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {mod.format}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-blue-700 mt-1">
                        {mod.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Prerequisites
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {mod.prerequisites}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* ==================== Resistance Risk Management ==================== */}
      {activeTab === 'resistance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-orange-600" />
              Resistance Risk Management
            </h2>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
          </div>
          <div className="space-y-4">
            {plan.resistance_risks.map(
              (risk: ResistanceRisk, idx: number) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        {risk.type}
                      </CardTitle>
                      <Badge className={intensityColors[risk.intensity]}>
                        {risk.intensity.charAt(0).toUpperCase() +
                          risk.intensity.slice(1)}{' '}
                        Resistance
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-slate-50">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                          Indicators
                        </p>
                        <p className="text-sm text-slate-700">
                          {risk.indicators}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-50">
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                          Root Cause
                        </p>
                        <p className="text-sm text-slate-700">
                          {risk.root_cause}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50">
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">
                          Response Strategy
                        </p>
                        <p className="text-sm text-slate-700">
                          {risk.response_strategy}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* ==================== Adoption Metrics Dashboard ==================== */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Adoption Metrics Dashboard
            </h2>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
          </div>

          {(['awareness', 'adoption', 'sustainability'] as const).map(
            (category) => {
              const metrics = plan.adoption_metrics.filter(
                (m: AdoptionMetric) => m.category === category
              );
              const colors = categoryColors[category];
              return (
                <div key={category}>
                  <h3
                    className={`text-sm font-semibold uppercase tracking-wide mb-3 ${colors.text}`}
                  >
                    {categoryLabels[category]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metrics.map((metric: AdoptionMetric, idx: number) => (
                      <Card
                        key={idx}
                        className={`${colors.bg} border ${colors.border}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg bg-white shadow-sm ${colors.icon}`}
                            >
                              {category === 'awareness' && (
                                <CheckCircle2 className="h-5 w-5" />
                              )}
                              {category === 'adoption' && (
                                <TrendingUp className="h-5 w-5" />
                              )}
                              {category === 'sustainability' && (
                                <Target className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {metric.metric}
                              </p>
                              <div className="mt-2 p-2 rounded bg-white/70">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Target
                                </p>
                                <p className="text-sm text-slate-800 mt-0.5">
                                  {metric.target}
                                </p>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Measurement
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {metric.measurement_method}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
