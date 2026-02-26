'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRecommendations } from '@/hooks/use-recommendations';
import type { Recommendation, RecommendationPriority, RecommendationType } from '@/types';

// ---------------------------------------------------------------------------
// Priority Styling
// ---------------------------------------------------------------------------

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  { label: string; dotColor: string; badgeBg: string; badgeText: string }
> = {
  critical: {
    label: 'Critical',
    dotColor: 'bg-red-500',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
  },
  high: {
    label: 'High',
    dotColor: 'bg-orange-500',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
  },
  medium: {
    label: 'Medium',
    dotColor: 'bg-yellow-500',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
  },
  low: {
    label: 'Low',
    dotColor: 'bg-green-500',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
  },
};

const IMPACT_STYLES: Record<string, string> = {
  high: 'text-emerald-700',
  medium: 'text-blue-700',
  low: 'text-slate-500',
};

const EFFORT_LABELS: Record<string, string> = {
  hours: 'Hours',
  days: 'Days',
  weeks: 'Weeks',
  months: 'Months',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PriorityBadge({ priority }: { priority: RecommendationPriority }): React.ReactElement {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.badgeBg,
        config.badgeText,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);
  const effortLabel = EFFORT_LABELS[recommendation.effort_estimate] ?? recommendation.effort_estimate;
  const impactStyle = IMPACT_STYLES[recommendation.impact] ?? 'text-slate-500';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={recommendation.priority} />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {recommendation.category}
            </span>
          </div>
          <h4 className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">
            {recommendation.title}
          </h4>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        {recommendation.description}
      </p>

      {/* Metadata row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span>
          Effort: <strong className="font-medium text-slate-700">{effortLabel}</strong>
        </span>
        <span>
          Impact: <strong className={cn('font-medium', impactStyle)}>{recommendation.impact}</strong>
        </span>
      </div>

      {/* Expandable rationale */}
      {recommendation.rationale && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {expanded ? 'Hide rationale' : 'Show rationale'}
          </button>
          {expanded && (
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3">
              {recommendation.rationale}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
          <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-5/6 rounded bg-slate-100" />
          </div>
          <div className="mt-3 flex gap-4">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-3 w-20 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export interface RecommendationPanelProps {
  /** The type of recommendations to generate. */
  type: RecommendationType;
  /** Context data to send with the recommendation request. */
  context: Record<string, unknown>;
  /** Optional title override for the panel. */
  title?: string;
  /** Optional description override for the panel. */
  description?: string;
  /** Optional additional CSS class names. */
  className?: string;
}

/**
 * RecommendationPanel is a reusable component that provides an AI-powered
 * recommendation generation experience.
 *
 * It renders a card with a "Get AI Recommendations" button. When clicked, it
 * calls the recommendations API and displays the results in a prioritized card
 * list with loading skeletons during generation.
 */
export function RecommendationPanel({
  type,
  context,
  title,
  description,
  className,
}: RecommendationPanelProps): React.ReactElement {
  const {
    recommendations,
    isLoading,
    error,
    generate,
    reset,
  } = useRecommendations();

  const defaultTitles: Record<RecommendationType, string> = {
    remediation: 'Remediation Recommendations',
    policy: 'Policy Recommendations',
    risk: 'Risk Mitigation Recommendations',
  };

  const defaultDescriptions: Record<RecommendationType, string> = {
    remediation:
      'Generate AI-powered recommendations to address assessment gaps and improve readiness scores.',
    policy:
      'Get AI suggestions for policy content, structure, and compliance considerations.',
    risk:
      'Generate targeted mitigation strategies for identified risk items.',
  };

  const panelTitle = title ?? defaultTitles[type];
  const panelDescription = description ?? defaultDescriptions[type];

  const handleGenerate = React.useCallback(() => {
    generate(type, context);
  }, [generate, type, context]);

  return (
    <Card className={cn('border-slate-200 bg-white shadow-sm', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900">{panelTitle}</CardTitle>
            <CardDescription className="mt-1 text-sm text-slate-500">
              {panelDescription}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {recommendations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                disabled={isLoading}
              >
                Clear
              </Button>
            )}
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <span className="mr-1.5 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : recommendations.length > 0 ? (
                'Regenerate'
              ) : (
                'Get AI Recommendations'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error state */}
        {error && !isLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              Failed to generate recommendations
            </p>
            <p className="mt-1 text-xs text-red-600">{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleGenerate}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && <LoadingSkeleton />}

        {/* Results */}
        {!isLoading && !error && recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} generated</span>
              <span className="flex items-center gap-3">
                {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
                  const count = recommendations.filter((r) => r.priority === p).length;
                  if (count === 0) return null;
                  const config = PRIORITY_CONFIG[p];
                  return (
                    <span key={p} className="flex items-center gap-1">
                      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
                      {count} {config.label.toLowerCase()}
                    </span>
                  );
                })}
              </span>
            </div>
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}

        {/* Empty state (before first generation) */}
        {!isLoading && !error && recommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-slate-100 p-3">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">
              No recommendations yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Click the button above to generate AI-powered recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
