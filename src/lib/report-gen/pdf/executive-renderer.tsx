import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ReportContent } from './readiness-report';
import {
  colors,
  getRatingColor,
  getTierColor,
  getTierBg,
  TalkingPoints,
  DomainBars,
  RiskHeatMap,
} from './renderer';

// ---------------------------------------------------------------------------
// Executive slide-specific styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  // Page base
  slide: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.slate700,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    backgroundColor: colors.white,
    position: 'relative',
  },

  // Slide chrome
  slideHeader: {
    position: 'absolute',
    top: 16,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandMark: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
    letterSpacing: 1,
  },
  slideNumberBox: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: colors.slate900,
    borderRadius: 2,
  },
  slideNumberText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  slideFooter: {
    position: 'absolute',
    bottom: 16,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slideFooterText: {
    fontSize: 7,
    color: colors.slate500,
  },
  confidentialTag: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: colors.red600,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Title slide
  titleSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleAccent: {
    width: 80,
    height: 4,
    backgroundColor: colors.blue600,
    marginBottom: 20,
  },
  titleMain: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate900,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleSub: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
    marginBottom: 30,
  },
  titleMeta: {
    flexDirection: 'row',
    gap: 30,
    marginTop: 16,
  },
  titleMetaItem: {
    alignItems: 'center',
  },
  titleMetaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  titleMetaValue: {
    fontSize: 10,
    color: colors.slate900,
  },

  // Content slide layout
  slideTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate900,
    marginBottom: 4,
  },
  slideDivider: {
    width: 40,
    height: 3,
    backgroundColor: colors.blue600,
    marginBottom: 16,
  },
  slideBody: {
    flex: 1,
  },

  // Big score
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 20,
    backgroundColor: colors.blue50,
    borderRadius: 8,
  },
  bigScore: {
    fontSize: 72,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
  },
  bigScorePercent: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
    marginTop: 12,
  },
  ratingBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  statBox: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.slate50,
    borderRadius: 4,
    minWidth: 100,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate900,
  },
  statLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Timeline
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelinePhase: {
    width: 120,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate700,
  },
  timelineBarTrack: {
    flex: 1,
    height: 20,
    backgroundColor: colors.slate100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timelineBarFill: {
    height: 20,
    borderRadius: 3,
    justifyContent: 'center',
    paddingLeft: 6,
  },
  timelineBarLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  timelineWeeks: {
    width: 60,
    textAlign: 'right',
    fontSize: 8,
    color: colors.slate500,
    marginLeft: 8,
  },

  // ROI card grid
  roiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  roiCard: {
    width: '48%',
    padding: 12,
    backgroundColor: colors.slate50,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.slate300,
  },
  roiLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  roiValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate900,
  },
  roiUnit: {
    fontSize: 8,
    color: colors.slate500,
    marginTop: 2,
  },

  // Go/No-Go
  decisionBanner: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 6,
    marginVertical: 16,
  },
  decisionText: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  decisionSubtext: {
    fontSize: 10,
    marginTop: 4,
  },
  conditionsList: {
    marginVertical: 12,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 8,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  conditionText: {
    fontSize: 9,
    color: colors.slate700,
  },
  nextStepsList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.blue50,
    borderRadius: 4,
  },
  nextStepsTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nextStepItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  nextStepNumber: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.blue600,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  nextStepNumberText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  nextStepText: {
    flex: 1,
    fontSize: 9,
    color: colors.slate700,
    paddingTop: 1,
  },

  // Two column
  twoCol: {
    flexDirection: 'row',
    gap: 16,
  },
  col: {
    flex: 1,
  },

  // Sub-labels
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
});

// ---------------------------------------------------------------------------
// Slide chrome wrapper
// ---------------------------------------------------------------------------
function SlideChrome({
  slideNumber,
  totalSlides,
  confidentiality,
  children,
}: {
  slideNumber: number;
  totalSlides: number;
  confidentiality: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Page size="A4" style={s.slide}>
      <View style={s.slideHeader} fixed>
        <Text style={s.brandMark}>GOVAI STUDIO</Text>
        <View style={s.slideNumberBox}>
          <Text style={s.slideNumberText}>
            {slideNumber} / {totalSlides}
          </Text>
        </View>
      </View>

      {children}

      <View style={s.slideFooter} fixed>
        <Text style={s.confidentialTag}>{confidentiality}</Text>
        <Text style={s.slideFooterText}>Executive Briefing</Text>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide content parsers
// ---------------------------------------------------------------------------

interface SlideData {
  type: string;
  layout: string;
  [key: string]: unknown;
}

function parseSlide(section: { content?: string }): SlideData | null {
  if (!section.content) return null;
  try {
    return JSON.parse(section.content) as SlideData;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Individual slide renderers
// ---------------------------------------------------------------------------

/** Slide 1: Feasibility Score Hero */
function Slide1ScoreHero({
  data,
  confidentiality,
}: {
  data: SlideData;
  confidentiality: string;
}): React.JSX.Element {
  const score = data.score as number;
  const rating = data.rating as string;
  const passedDomains = data.passedDomains as number;
  const totalDomains = data.totalDomains as number;
  const talkingPoints = (data.talkingPoints as string[]) ?? [];

  return (
    <SlideChrome
      slideNumber={1}
      totalSlides={5}
      confidentiality={confidentiality}
    >
      <View style={s.slideBody}>
        <Text style={s.slideTitle}>Feasibility Score</Text>
        <View style={s.slideDivider} />

        <View style={s.scoreContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={s.bigScore}>{score.toFixed(1)}</Text>
            <Text style={s.bigScorePercent}>%</Text>
          </View>
          <View
            style={[
              s.ratingBadge,
              { backgroundColor: getRatingColor(rating) + '20' },
            ]}
          >
            <Text style={[s.ratingText, { color: getRatingColor(rating) }]}>
              {rating}
            </Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>
              {passedDomains}/{totalDomains}
            </Text>
            <Text style={s.statLabel}>Domains Passing</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{score.toFixed(0)}%</Text>
            <Text style={s.statLabel}>Overall Score</Text>
          </View>
          <View style={s.statBox}>
            <Text
              style={[s.statValue, { color: getRatingColor(rating) }]}
            >
              {rating.includes(' ')
                ? rating.split(' ')[0]
                : rating.toUpperCase()}
            </Text>
            <Text style={s.statLabel}>Rating</Text>
          </View>
        </View>

        {talkingPoints.length > 0 && (
          <TalkingPoints points={talkingPoints} />
        )}
      </View>
    </SlideChrome>
  );
}

/** Slide 2: Domain Gap Analysis */
function Slide2DomainBars({
  data,
  confidentiality,
}: {
  data: SlideData;
  confidentiality: string;
}): React.JSX.Element {
  const domains = (data.domains as {
    name: string;
    score: number;
    threshold: number;
    passed: boolean;
    topGap: string;
  }[]) ?? [];
  const talkingPoints = (data.talkingPoints as string[]) ?? [];

  return (
    <SlideChrome
      slideNumber={2}
      totalSlides={5}
      confidentiality={confidentiality}
    >
      <View style={s.slideBody}>
        <Text style={s.slideTitle}>Domain Gap Analysis</Text>
        <View style={s.slideDivider} />

        <DomainBars domains={domains} />

        {/* Gap callouts */}
        <Text style={s.sectionLabel}>Top Gaps by Domain</Text>
        {domains
          .filter((d) => !d.passed)
          .map((d, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.red600,
                  marginTop: 3,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 9, color: colors.slate700, flex: 1 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{d.name}: </Text>
                {d.topGap}
              </Text>
            </View>
          ))}

        {talkingPoints.length > 0 && (
          <TalkingPoints points={talkingPoints} />
        )}
      </View>
    </SlideChrome>
  );
}

/** Slide 3: Risk Heat Map */
function Slide3RiskHeatMap({
  data,
  confidentiality,
}: {
  data: SlideData;
  confidentiality: string;
}): React.JSX.Element {
  const risks = (data.risks as {
    category: string;
    tier: string;
    likelihood: number;
    impact: number;
    mitigation: string;
  }[]) ?? [];
  const summary = data.summary as {
    critical: number;
    high: number;
    total: number;
  };
  const talkingPoints = (data.talkingPoints as string[]) ?? [];

  return (
    <SlideChrome
      slideNumber={3}
      totalSlides={5}
      confidentiality={confidentiality}
    >
      <View style={s.slideBody}>
        <Text style={s.slideTitle}>Risk Heat Map</Text>
        <View style={s.slideDivider} />

        {/* Summary stats */}
        <View style={s.statsRow}>
          <View
            style={[s.statBox, { backgroundColor: colors.red100 }]}
          >
            <Text style={[s.statValue, { color: colors.red600 }]}>
              {summary?.critical ?? 0}
            </Text>
            <Text style={s.statLabel}>Critical</Text>
          </View>
          <View
            style={[s.statBox, { backgroundColor: '#fff7ed' }]}
          >
            <Text style={[s.statValue, { color: '#ea580c' }]}>
              {summary?.high ?? 0}
            </Text>
            <Text style={s.statLabel}>High</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{summary?.total ?? 0}</Text>
            <Text style={s.statLabel}>Total Risks</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />
        <RiskHeatMap risks={risks} />

        {talkingPoints.length > 0 && (
          <TalkingPoints points={talkingPoints} />
        )}
      </View>
    </SlideChrome>
  );
}

/** Slide 4: Timeline & ROI */
function Slide4TimelineRoi({
  data,
  confidentiality,
}: {
  data: SlideData;
  confidentiality: string;
}): React.JSX.Element {
  const timeline = (data.timeline as {
    phase: string;
    weeks: number;
    status: string;
  }[]) ?? [];
  const roi = data.roi as {
    annualSavings: number;
    totalCost: number;
    netBenefit: number;
    paybackMonths: number;
    threeYearNpv: number;
    roiPercent: number;
  } | null;
  const talkingPoints = (data.talkingPoints as string[]) ?? [];

  const totalWeeks = timeline.reduce((sum, t) => sum + t.weeks, 0);

  const statusColors: Record<string, string> = {
    completed: colors.green600,
    active: colors.blue600,
    in_progress: colors.blue600,
    planned: colors.slate500,
    pending: colors.slate500,
    not_started: colors.slate300,
  };

  const formatCurrency = (val: number): string => {
    if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <SlideChrome
      slideNumber={4}
      totalSlides={5}
      confidentiality={confidentiality}
    >
      <View style={s.slideBody}>
        <Text style={s.slideTitle}>Timeline & ROI</Text>
        <View style={s.slideDivider} />

        <View style={s.twoCol}>
          {/* Left: Timeline */}
          <View style={s.col}>
            <Text style={s.sectionLabel}>Implementation Timeline</Text>
            {timeline.map((phase, i) => {
              const barPercent =
                totalWeeks > 0 ? (phase.weeks / totalWeeks) * 100 : 0;
              const barColor =
                statusColors[phase.status] ?? colors.slate500;

              return (
                <View key={i} style={s.timelineRow}>
                  <Text style={s.timelinePhase}>{phase.phase}</Text>
                  <View style={s.timelineBarTrack}>
                    <View
                      style={[
                        s.timelineBarFill,
                        {
                          width: `${Math.max(barPercent, 15)}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    >
                      <Text style={s.timelineBarLabel}>
                        {phase.weeks}w
                      </Text>
                    </View>
                  </View>
                  <Text style={s.timelineWeeks}>
                    {phase.weeks} weeks
                  </Text>
                </View>
              );
            })}
            <View
              style={{
                marginTop: 8,
                padding: 8,
                backgroundColor: colors.slate50,
                borderRadius: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: 'Helvetica-Bold',
                  color: colors.slate900,
                }}
              >
                Total: {totalWeeks} weeks
              </Text>
            </View>
          </View>

          {/* Right: ROI */}
          <View style={s.col}>
            <Text style={s.sectionLabel}>Return on Investment</Text>
            {roi ? (
              <View style={s.roiGrid}>
                <View style={s.roiCard}>
                  <Text style={s.roiLabel}>Annual Savings</Text>
                  <Text style={[s.roiValue, { color: colors.green600 }]}>
                    {formatCurrency(roi.annualSavings)}
                  </Text>
                </View>
                <View style={s.roiCard}>
                  <Text style={s.roiLabel}>Total Cost</Text>
                  <Text style={s.roiValue}>
                    {formatCurrency(roi.totalCost)}
                  </Text>
                </View>
                <View style={s.roiCard}>
                  <Text style={s.roiLabel}>Net Benefit</Text>
                  <Text style={[s.roiValue, { color: colors.green600 }]}>
                    {formatCurrency(roi.netBenefit)}
                  </Text>
                </View>
                <View style={s.roiCard}>
                  <Text style={s.roiLabel}>Payback Period</Text>
                  <Text style={s.roiValue}>{roi.paybackMonths}mo</Text>
                </View>
                <View style={s.roiCard}>
                  <Text style={s.roiLabel}>3-Year NPV</Text>
                  <Text style={[s.roiValue, { color: colors.blue600 }]}>
                    {formatCurrency(roi.threeYearNpv)}
                  </Text>
                </View>
                <View style={s.roiCard}>
                  <Text style={s.roiLabel}>ROI</Text>
                  <Text style={[s.roiValue, { color: colors.green600 }]}>
                    {roi.roiPercent.toFixed(0)}%
                  </Text>
                </View>
              </View>
            ) : (
              <View
                style={{
                  padding: 16,
                  backgroundColor: colors.slate50,
                  borderRadius: 4,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.slate500,
                    fontFamily: 'Helvetica-Bold',
                  }}
                >
                  ROI Analysis Pending
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    color: colors.slate500,
                    marginTop: 4,
                  }}
                >
                  Complete the ROI calculator to populate this section
                </Text>
              </View>
            )}
          </View>
        </View>

        {talkingPoints.length > 0 && (
          <TalkingPoints points={talkingPoints} />
        )}
      </View>
    </SlideChrome>
  );
}

/** Slide 5: Go/No-Go Recommendation */
function Slide5Recommendation({
  data,
  confidentiality,
}: {
  data: SlideData;
  confidentiality: string;
}): React.JSX.Element {
  const recommendation = data.recommendation as string;
  const conditions = (data.conditions as string[]) ?? [];
  const nextSteps = (data.nextSteps as string[]) ?? [];
  const talkingPoints = (data.talkingPoints as string[]) ?? [];

  const isGo = recommendation === 'GO';
  const bannerBg = isGo ? colors.green100 : '#fff7ed';
  const bannerColor = isGo ? colors.green600 : '#ea580c';

  return (
    <SlideChrome
      slideNumber={5}
      totalSlides={5}
      confidentiality={confidentiality}
    >
      <View style={s.slideBody}>
        <Text style={s.slideTitle}>Go / No-Go Recommendation</Text>
        <View style={s.slideDivider} />

        <View style={[s.decisionBanner, { backgroundColor: bannerBg }]}>
          <Text style={[s.decisionText, { color: bannerColor }]}>
            {recommendation}
          </Text>
          <Text style={[s.decisionSubtext, { color: bannerColor }]}>
            {isGo
              ? 'Proceed with controlled pilot'
              : `Conditional approval \u2014 ${conditions.length} condition${conditions.length !== 1 ? 's' : ''} must be met`}
          </Text>
        </View>

        {conditions.length > 0 && (
          <View style={s.conditionsList}>
            <Text style={s.sectionLabel}>Conditions</Text>
            {conditions.map((condition, i) => (
              <View key={i} style={s.conditionItem}>
                <View
                  style={[
                    s.conditionDot,
                    { backgroundColor: '#ea580c' },
                  ]}
                />
                <Text style={s.conditionText}>{condition}</Text>
              </View>
            ))}
          </View>
        )}

        {nextSteps.length > 0 && (
          <View style={s.nextStepsList}>
            <Text style={s.nextStepsTitle}>Recommended Next Steps</Text>
            {nextSteps.map((step, i) => (
              <View key={i} style={s.nextStepItem}>
                <View style={s.nextStepNumber}>
                  <Text style={s.nextStepNumberText}>{i + 1}</Text>
                </View>
                <Text style={s.nextStepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {talkingPoints.length > 0 && (
          <TalkingPoints points={talkingPoints} />
        )}
      </View>
    </SlideChrome>
  );
}

// ---------------------------------------------------------------------------
// Main: ExecutiveBriefingDocument
// ---------------------------------------------------------------------------

/**
 * ExecutiveBriefingDocument renders a 5-slide executive briefing PDF.
 * Each "slide" is a full A4 page with large visuals and talking points.
 */
export function ExecutiveBriefingDocument({
  content,
}: {
  content: ReportContent;
}): React.JSX.Element {
  const confidentiality = content.metadata.confidentiality;
  const sections = content.sections;

  // Parse all slide data upfront
  const slideData: (SlideData | null)[] = sections.map((sec) => {
    if (!sec.content) return null;
    try {
      return JSON.parse(sec.content) as SlideData;
    } catch {
      return null;
    }
  });

  // Build slide components based on layout type
  const slideRenderers: React.JSX.Element[] = [];

  // Title page
  slideRenderers.push(
    <Page key="title" size="A4" style={s.slide}>
      <View style={s.slideHeader} fixed>
        <Text style={s.brandMark}>GOVAI STUDIO</Text>
      </View>
      <View style={s.titleSlide}>
        <View style={s.titleAccent} />
        <Text style={s.titleMain}>{content.title}</Text>
        <Text style={s.titleSub}>{content.subtitle}</Text>
        <View style={s.titleMeta}>
          <View style={s.titleMetaItem}>
            <Text style={s.titleMetaLabel}>Prepared For</Text>
            <Text style={s.titleMetaValue}>
              {content.metadata.preparedFor}
            </Text>
          </View>
          <View style={s.titleMetaItem}>
            <Text style={s.titleMetaLabel}>Prepared By</Text>
            <Text style={s.titleMetaValue}>
              {content.metadata.preparedBy}
            </Text>
          </View>
          <View style={s.titleMetaItem}>
            <Text style={s.titleMetaLabel}>Date</Text>
            <Text style={s.titleMetaValue}>{content.metadata.date}</Text>
          </View>
        </View>
      </View>
      <View style={s.slideFooter} fixed>
        <Text style={s.confidentialTag}>{confidentiality}</Text>
        <Text style={s.slideFooterText}>Executive Briefing</Text>
      </View>
    </Page>,
  );

  // Slide 1: score_hero
  slideData.forEach((sd, i) => {
    if (!sd) return;

    switch (sd.layout) {
      case 'score_hero':
        slideRenderers.push(
          <Slide1ScoreHero
            key={`slide-${i}`}
            data={sd}
            confidentiality={confidentiality}
          />,
        );
        break;
      case 'domain_bars':
        slideRenderers.push(
          <Slide2DomainBars
            key={`slide-${i}`}
            data={sd}
            confidentiality={confidentiality}
          />,
        );
        break;
      case 'risk_heatmap':
        slideRenderers.push(
          <Slide3RiskHeatMap
            key={`slide-${i}`}
            data={sd}
            confidentiality={confidentiality}
          />,
        );
        break;
      case 'timeline_roi':
        slideRenderers.push(
          <Slide4TimelineRoi
            key={`slide-${i}`}
            data={sd}
            confidentiality={confidentiality}
          />,
        );
        break;
      case 'recommendation':
        slideRenderers.push(
          <Slide5Recommendation
            key={`slide-${i}`}
            data={sd}
            confidentiality={confidentiality}
          />,
        );
        break;
      default:
        break;
    }
  });

  return (
    <Document
      title={content.title}
      author="GovAI Studio"
      subject={content.subtitle}
      creator="GovAI Studio Executive Briefing Engine"
    >
      {slideRenderers}
    </Document>
  );
}
