'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HelpCircle,
  X,
  ArrowRight,
  Lightbulb,
  Target,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface HelpEntry {
  title: string;
  description: string;
  whyItMatters: string;
  relatedPages: { label: string; href: string }[];
}

interface ContextualHelpProps {
  phase?: string;
  pageKey: string;
}

/* -------------------------------------------------------------------------- */
/*  Help Content                                                               */
/* -------------------------------------------------------------------------- */

const HELP_CONTENT: Record<string, HelpEntry> = {
  intake: {
    title: 'Pilot Intake Scorecard',
    description:
      'The intake scorecard captures quick screening information about your organization to determine the appropriate governance path. Answer a few key questions about your AI readiness, data classification maturity, and executive sponsorship to receive a risk-path classification (Fast Track, Standard, or High Risk).',
    whyItMatters:
      'Getting the governance path right from the start prevents over-engineering simple deployments or under-governing high-risk ones. The intake score directly influences the number of governance tasks generated and the recommended timeline.',
    relatedPages: [
      { label: 'Assessment Questionnaire', href: 'discovery/questionnaire' },
      { label: 'Readiness Dashboard', href: 'discovery/readiness' },
      { label: 'Risk Classification', href: 'governance/risk' },
    ],
  },
  questionnaire: {
    title: 'Assessment Questionnaire',
    description:
      'The full 25-question assessment evaluates your organization across five domains: Infrastructure, Security, Governance, Engineering, and Business readiness. Each question is weighted and scored to produce a comprehensive feasibility analysis.',
    whyItMatters:
      'This assessment forms the foundation of your governance strategy. Domain scores identify specific strengths and gaps that inform the remediation roadmap. Without an accurate assessment, governance efforts may focus on the wrong areas.',
    relatedPages: [
      { label: 'Readiness Dashboard', href: 'discovery/readiness' },
      { label: 'Prerequisites Checklist', href: 'discovery/prerequisites' },
      { label: 'Risk Classification', href: 'governance/risk' },
    ],
  },
  readiness: {
    title: 'Readiness Assessment Dashboard',
    description:
      'The readiness dashboard visualizes your organization\'s scores across all five assessment domains using a radar chart. It provides an overall feasibility score, a rating (High, Moderate, Conditional, Not Ready), and actionable recommendations per domain.',
    whyItMatters:
      'Readiness scores are used to determine whether you can proceed to the sandbox phase or whether remediation steps are required first. The radar chart makes it easy for executives to understand organizational gaps at a glance.',
    relatedPages: [
      { label: 'Assessment Questionnaire', href: 'discovery/questionnaire' },
      { label: 'Compliance Mapping', href: 'governance/compliance' },
      { label: 'Gate Reviews', href: 'governance/gates' },
    ],
  },
  policies: {
    title: 'Policy Editor',
    description:
      'The policy editor allows you to create and manage governance documents including Acceptable Use Policies (AUP), Incident Response Plan (IRP) addendums, data classification documents, and risk frameworks. Each policy goes through a draft-review-approval lifecycle.',
    whyItMatters:
      'Policies are the backbone of AI governance. They define what is and is not acceptable when using AI tools, establish data handling rules, and create accountability. Well-crafted policies reduce organizational risk and provide legal protection.',
    relatedPages: [
      { label: 'Compliance Mapping', href: 'governance/compliance' },
      { label: 'Gate Reviews', href: 'governance/gates' },
      { label: 'Risk Classification', href: 'governance/risk' },
    ],
  },
  compliance: {
    title: 'Compliance Framework Mapping',
    description:
      'The compliance mapper links your AI governance controls to established regulatory frameworks (SOC 2, HIPAA, NIST, GDPR). Each control is mapped to specific framework requirements with status tracking for implementation and verification.',
    whyItMatters:
      'Regulatory compliance is non-negotiable for many organizations. Mapping your AI controls to frameworks demonstrates due diligence, simplifies audits, and ensures you meet industry-specific requirements before deploying AI tools.',
    relatedPages: [
      { label: 'Policy Editor', href: 'governance/policies' },
      { label: 'Risk Classification', href: 'governance/risk' },
      { label: 'Gate Reviews', href: 'governance/gates' },
    ],
  },
  risk: {
    title: 'Risk Classification Manager',
    description:
      'The risk classification manager catalogs, scores, and tracks AI-related risks. Each risk is categorized, assigned a likelihood and impact score, and linked to mitigation strategies. Risks are tiered as Critical, High, Medium, or Low.',
    whyItMatters:
      'Proactive risk identification prevents costly surprises during pilot execution and production deployment. The risk register becomes a living document that stakeholders reference throughout the project lifecycle and present to governance boards.',
    relatedPages: [
      { label: 'Gate Reviews', href: 'governance/gates' },
      { label: 'Compliance Mapping', href: 'governance/compliance' },
      { label: 'Policy Editor', href: 'governance/policies' },
    ],
  },
  gates: {
    title: 'Gate Reviews',
    description:
      'The three-gate review system provides formal approval checkpoints: Gate 1 (Sandbox Access), Gate 2 (Pilot Launch), and Gate 3 (Production Decision). Each gate has a required evidence checklist and designated approvers who must sign off before proceeding.',
    whyItMatters:
      'Gates prevent premature advancement through the governance process. They ensure that all necessary controls, policies, and assessments are in place before escalating to the next phase. Gate failures are learning opportunities, not roadblocks.',
    relatedPages: [
      { label: 'Risk Classification', href: 'governance/risk' },
      { label: 'Compliance Mapping', href: 'governance/compliance' },
      { label: 'Sandbox Configuration', href: 'sandbox/configure' },
    ],
  },
  sandbox: {
    title: 'Sandbox Configuration',
    description:
      'The sandbox setup wizard helps you configure a controlled environment for AI tool evaluation. It generates infrastructure-as-code templates, managed settings files, and network configuration based on your cloud provider, security requirements, and AI tool selection.',
    whyItMatters:
      'A properly configured sandbox is essential for a safe and meaningful pilot. It enforces data boundaries, enables monitoring, and ensures that the AI tool operates within your organization\'s security constraints from day one.',
    relatedPages: [
      { label: 'Sandbox Files', href: 'sandbox/files' },
      { label: 'Sandbox Validation', href: 'sandbox/validate' },
      { label: 'Gate Reviews', href: 'governance/gates' },
    ],
  },
  sprints: {
    title: 'Sprint Evaluation Tracker',
    description:
      'The sprint tracker captures and compares metrics across pilot evaluation sprints. Track velocity changes, defect rates, cycle times, developer satisfaction, and code quality with baseline vs. AI-assisted comparisons for each sprint.',
    whyItMatters:
      'Sprint-level data provides the quantitative evidence needed for go/no-go decisions. Without rigorous measurement, it is impossible to determine whether the AI tool is delivering genuine value or introducing hidden risks.',
    relatedPages: [
      { label: 'Tool Comparison', href: 'poc/compare' },
      { label: 'Pilot Metrics', href: 'poc/metrics' },
      { label: 'Decision Hub', href: 'reports/generate' },
    ],
  },
  'decision-hub': {
    title: 'Decision Hub',
    description:
      'The decision hub aggregates all governance artifacts, pilot metrics, risk assessments, and compliance mappings into persona-specific reports. Generate executive briefs, legal reviews, IT/security assessments, engineering summaries, or marketing communications.',
    whyItMatters:
      'The final decision to proceed, pivot, or stop requires comprehensive evidence presented in the right format for each stakeholder. The decision hub automates report generation so that every stakeholder gets exactly the information they need.',
    relatedPages: [
      { label: 'Report History', href: 'reports/history' },
      { label: 'Sprint Tracker', href: 'poc/sprints' },
      { label: 'Gate Reviews', href: 'governance/gates' },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  Phase Expectations                                                         */
/* -------------------------------------------------------------------------- */

const PHASE_EXPECTATIONS: Record<string, string> = {
  discovery: 'Complete the assessment questionnaire, review readiness scores, and check off prerequisites. The goal is to understand your organization\'s current AI readiness.',
  governance: 'Draft and approve key policies (AUP, IRP), map compliance frameworks, classify risks, and pass Gate 1 review. This phase establishes your governance foundation.',
  sandbox: 'Configure the sandbox environment, generate infrastructure files, and validate that all security controls are in place. Get ready for a safe pilot.',
  pilot: 'Run evaluation sprints, capture metrics, compare tools, and gather evidence for the go/no-go decision. Focus on measurable outcomes.',
  evaluation: 'Review pilot results, generate stakeholder reports, and prepare the executive decision brief. This is where data becomes a recommendation.',
};

/* -------------------------------------------------------------------------- */
/*  Help panel inner content (shared between desktop panel and mobile sheet)    */
/* -------------------------------------------------------------------------- */

function HelpPanelContent({
  helpEntry,
  phaseExpectation,
  onClose,
}: {
  helpEntry: HelpEntry | undefined;
  phaseExpectation: string | null;
  onClose: () => void;
}): React.ReactElement {
  return (
    <>
      {/* Panel Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
        <h3 className="text-sm font-semibold text-slate-900">Page Guide</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        {helpEntry ? (
          <>
            {/* Title & Description */}
            <div className="space-y-2">
              <h4 className="text-base font-semibold text-slate-900">{helpEntry.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{helpEntry.description}</p>
            </div>

            {/* Phase expectations */}
            {phaseExpectation && (
              <>
                <Separator className="bg-slate-200" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-500" />
                    <h5 className="text-sm font-semibold text-slate-900">What&apos;s Expected</h5>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{phaseExpectation}</p>
                </div>
              </>
            )}

            {/* Why it matters */}
            <Separator className="bg-slate-200" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h5 className="text-sm font-semibold text-slate-900">Why This Matters</h5>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{helpEntry.whyItMatters}</p>
            </div>

            {/* Related Pages */}
            {helpEntry.relatedPages.length > 0 && (
              <>
                <Separator className="bg-slate-200" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                    <h5 className="text-sm font-semibold text-slate-900">Related Pages</h5>
                  </div>
                  <div className="space-y-1">
                    {helpEntry.relatedPages.map((rp) => (
                      <Button
                        key={rp.href}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-sm text-slate-600 hover:text-slate-900 h-8 px-2"
                        onClick={() => {
                          console.log('Navigate to:', rp.href);
                        }}
                      >
                        {rp.label}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No guide content available for this page.</p>
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ContextualHelp({ phase, pageKey }: ContextualHelpProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery(768);

  const helpEntry = HELP_CONTENT[pageKey];
  const phaseExpectation = phase ? PHASE_EXPECTATIONS[phase] : null;

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on click outside (desktop only — Sheet handles its own overlay)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose, isMobile]);

  // Close on Escape key (desktop only)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, isMobile]);

  return (
    <>
      {/* Floating Guide Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg transition-all hover:shadow-xl',
          isOpen
            ? 'bg-slate-900 text-white'
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        )}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Guide</span>
      </button>

      {/* Mobile: bottom Sheet */}
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-xl p-0 bg-white">
            <HelpPanelContent
              helpEntry={helpEntry}
              phaseExpectation={phaseExpectation}
              onClose={handleClose}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <>
          {/* Desktop: Slide-out side panel */}
          <div
            ref={panelRef}
            className={cn(
              'fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl border-l border-slate-200 transition-transform duration-300 ease-in-out overflow-y-auto',
              isOpen ? 'translate-x-0' : 'translate-x-full',
            )}
          >
            <HelpPanelContent
              helpEntry={helpEntry}
              phaseExpectation={phaseExpectation}
              onClose={handleClose}
            />
          </div>

          {/* Backdrop overlay when panel is open */}
          {isOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/10"
              onClick={handleClose}
            />
          )}
        </>
      )}
    </>
  );
}
