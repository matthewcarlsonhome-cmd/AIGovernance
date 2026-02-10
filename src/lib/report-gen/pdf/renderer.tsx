import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { ReportContent, ContentSection } from './readiness-report';

// ---------------------------------------------------------------------------
// Color tokens
// ---------------------------------------------------------------------------
const colors = {
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  blue600: '#2563eb',
  blue500: '#3b82f6',
  blue100: '#dbeafe',
  blue50: '#eff6ff',
  green600: '#16a34a',
  green100: '#dcfce7',
  yellow600: '#ca8a04',
  yellow100: '#fef9c3',
  red600: '#dc2626',
  red100: '#fee2e2',
  white: '#ffffff',
  black: '#000000',
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Page ------------------------------------------------------------------
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.slate700,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: colors.white,
  },

  // Header / Footer -------------------------------------------------------
  header: {
    position: 'absolute',
    top: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate300,
    paddingBottom: 8,
  },
  headerBrand: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
    letterSpacing: 1,
  },
  headerConfidential: {
    fontSize: 7,
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.slate300,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: colors.slate500,
  },
  pageNumber: {
    fontSize: 7,
    color: colors.slate500,
  },

  // Title page ------------------------------------------------------------
  titlePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  titleAccentBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.blue600,
    marginBottom: 24,
  },
  titleMain: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate900,
    textAlign: 'center',
    marginBottom: 10,
  },
  titleSub: {
    fontSize: 16,
    color: colors.slate500,
    textAlign: 'center',
    marginBottom: 40,
  },
  metadataBlock: {
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.slate50,
    borderRadius: 4,
    width: '100%',
    maxWidth: 350,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  metadataLabel: {
    width: 100,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    flex: 1,
    fontSize: 9,
    color: colors.slate900,
  },
  confidentialityBadge: {
    marginTop: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: colors.red100,
    borderRadius: 2,
    alignSelf: 'center',
  },
  confidentialityText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.red600,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Section headers -------------------------------------------------------
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.blue600,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate900,
  },
  subsectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate700,
  },

  // Body text -------------------------------------------------------------
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.slate700,
    marginBottom: 8,
  },

  // Score card ------------------------------------------------------------
  scoreCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 12,
  },
  scoreCard: {
    width: '48%',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.slate300,
    backgroundColor: colors.slate50,
  },
  scoreCardLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreCardValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate900,
  },
  scoreCardSubtext: {
    fontSize: 8,
    color: colors.slate500,
    marginTop: 2,
  },

  // Score hero (big center score) -----------------------------------------
  scoreHero: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 24,
    backgroundColor: colors.blue50,
    borderRadius: 6,
  },
  scoreHeroValue: {
    fontSize: 52,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
  },
  scoreHeroPercent: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
  },
  scoreHeroLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate700,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Domain bar chart (horizontal) -----------------------------------------
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  domainLabel: {
    width: 90,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate700,
  },
  domainBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: colors.slate100,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  domainBarFill: {
    height: 16,
    borderRadius: 3,
  },
  domainThresholdLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 16,
    backgroundColor: colors.red600,
  },
  domainScoreLabel: {
    width: 50,
    textAlign: 'right',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate700,
    marginLeft: 6,
  },
  domainStatusBadge: {
    width: 50,
    marginLeft: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
    alignItems: 'center',
  },
  domainStatusText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },

  // Tables ----------------------------------------------------------------
  table: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.slate900,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.slate300,
  },
  tableRowAlt: {
    backgroundColor: colors.slate50,
  },
  tableCell: {
    fontSize: 9,
    color: colors.slate700,
  },

  // Recommendation list ---------------------------------------------------
  recommendationList: {
    marginVertical: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  recommendationBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.blue600,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recommendationBulletText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  recommendationText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.slate700,
    paddingTop: 2,
  },

  // Risk heat map ---------------------------------------------------------
  riskGrid: {
    marginVertical: 10,
  },
  riskRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  riskCell: {
    flex: 1,
    padding: 6,
    marginRight: 4,
    borderRadius: 3,
    alignItems: 'center',
  },
  riskCellText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textAlign: 'center',
  },
  riskLegend: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  riskLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riskLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskLegendLabel: {
    fontSize: 7,
    color: colors.slate500,
  },

  // Talking points --------------------------------------------------------
  talkingPointsBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.slate50,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue600,
    borderRadius: 2,
  },
  talkingPointsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  talkingPoint: {
    fontSize: 9,
    color: colors.slate700,
    lineHeight: 1.5,
    marginBottom: 3,
    paddingLeft: 8,
  },

  // Utility ---------------------------------------------------------------
  spacerSm: { height: 8 },
  spacerMd: { height: 16 },
  spacerLg: { height: 24 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
});

// ---------------------------------------------------------------------------
// Helper: get rating color
// ---------------------------------------------------------------------------
function getRatingColor(rating: string): string {
  switch (rating) {
    case 'high':
    case 'HIGH READINESS':
      return colors.green600;
    case 'moderate':
    case 'MODERATE READINESS':
      return colors.yellow600;
    case 'conditional':
    case 'CONDITIONAL':
      return '#ea580c'; // orange-600
    case 'not_ready':
    case 'NOT READY':
      return colors.red600;
    default:
      return colors.slate500;
  }
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'critical':
      return colors.red600;
    case 'high':
      return '#ea580c';
    case 'medium':
      return colors.yellow600;
    case 'low':
      return colors.green600;
    default:
      return colors.slate500;
  }
}

function getTierBg(tier: string): string {
  switch (tier) {
    case 'critical':
      return colors.red100;
    case 'high':
      return '#fff7ed'; // orange-50
    case 'medium':
      return colors.yellow100;
    case 'low':
      return colors.green100;
    default:
      return colors.slate100;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Standard page with header + footer chrome */
export function ReportPage({
  children,
  confidentiality,
}: {
  children: React.ReactNode;
  confidentiality?: string;
}): React.JSX.Element {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <Text style={styles.headerBrand}>GOVAI STUDIO</Text>
        {confidentiality && (
          <Text style={styles.headerConfidential}>{confidentiality}</Text>
        )}
      </View>

      {children}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Generated by GovAI Studio</Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}

/** Title page */
export function TitlePage({
  content,
}: {
  content: ReportContent;
}): React.JSX.Element {
  const { title, subtitle, metadata } = content;
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.titlePage}>
        <View style={styles.titleAccentBar} />
        <Text style={styles.titleMain}>{title}</Text>
        <Text style={styles.titleSub}>{subtitle}</Text>

        <View style={styles.metadataBlock}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Prepared for</Text>
            <Text style={styles.metadataValue}>{metadata.preparedFor}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Prepared by</Text>
            <Text style={styles.metadataValue}>{metadata.preparedBy}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Date</Text>
            <Text style={styles.metadataValue}>{metadata.date}</Text>
          </View>

          {metadata.confidentiality && (
            <View style={styles.confidentialityBadge}>
              <Text style={styles.confidentialityText}>
                {metadata.confidentiality}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Generated by GovAI Studio</Text>
        <Text style={styles.footerText} />
      </View>
    </Page>
  );
}

/** Section header */
export function SectionHeader({
  title,
}: {
  title: string;
}): React.JSX.Element {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

/** Subsection header */
export function SubsectionHeader({
  title,
}: {
  title: string;
}): React.JSX.Element {
  return (
    <View style={styles.subsectionHeader}>
      <Text style={styles.subsectionTitle}>{title}</Text>
    </View>
  );
}

/** Body paragraph text */
export function BodyText({
  children,
}: {
  children: string;
}): React.JSX.Element {
  return <Text style={styles.bodyText}>{children}</Text>;
}

/** Large centered score hero display */
export function ScoreHero({
  score,
  rating,
}: {
  score: number;
  rating: string;
}): React.JSX.Element {
  return (
    <View style={styles.scoreHero}>
      <View style={styles.row}>
        <Text style={styles.scoreHeroValue}>{score.toFixed(1)}</Text>
        <Text style={styles.scoreHeroPercent}>%</Text>
      </View>
      <Text
        style={[styles.scoreHeroLabel, { color: getRatingColor(rating) }]}
      >
        {typeof rating === 'string' && rating.includes(' ')
          ? rating
          : rating.toUpperCase().replace('_', ' ')}
      </Text>
    </View>
  );
}

/** Score cards row (key metric boxes) */
export function ScoreCards({
  cards,
}: {
  cards: { label: string; value: string; subtext?: string }[];
}): React.JSX.Element {
  return (
    <View style={styles.scoreCardContainer}>
      {cards.map((card, i) => (
        <View key={i} style={styles.scoreCard}>
          <Text style={styles.scoreCardLabel}>{card.label}</Text>
          <Text style={styles.scoreCardValue}>{card.value}</Text>
          {card.subtext && (
            <Text style={styles.scoreCardSubtext}>{card.subtext}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

/** Horizontal domain bar chart */
export function DomainBars({
  domains,
}: {
  domains: {
    name: string;
    score: number;
    threshold: number;
    passed: boolean;
  }[];
}): React.JSX.Element {
  return (
    <View style={{ marginVertical: 12 }}>
      {domains.map((d, i) => {
        const barColor = d.passed ? colors.green600 : colors.red600;
        const barWidth = `${Math.min(Math.max(d.score, 0), 100)}%`;
        const thresholdLeft = `${d.threshold}%`;

        return (
          <View key={i} style={styles.domainRow}>
            <Text style={styles.domainLabel}>{d.name}</Text>
            <View style={styles.domainBarTrack}>
              <View
                style={[
                  styles.domainBarFill,
                  { width: barWidth, backgroundColor: barColor },
                ]}
              />
              <View
                style={[styles.domainThresholdLine, { left: thresholdLeft }]}
              />
            </View>
            <Text style={styles.domainScoreLabel}>
              {d.score.toFixed(1)}%
            </Text>
            <View
              style={[
                styles.domainStatusBadge,
                {
                  backgroundColor: d.passed
                    ? colors.green100
                    : colors.red100,
                },
              ]}
            >
              <Text
                style={[
                  styles.domainStatusText,
                  { color: d.passed ? colors.green600 : colors.red600 },
                ]}
              >
                {d.passed ? 'PASS' : 'FAIL'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Numbered recommendation list */
export function RecommendationList({
  items,
}: {
  items: string[];
}): React.JSX.Element {
  return (
    <View style={styles.recommendationList}>
      {items.map((item, i) => (
        <View key={i} style={styles.recommendationItem}>
          <View style={styles.recommendationBullet}>
            <Text style={styles.recommendationBulletText}>{i + 1}</Text>
          </View>
          <Text style={styles.recommendationText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** Generic data table */
export function DataTable({
  headers,
  rows,
  columnWidths,
}: {
  headers: string[];
  rows: string[][];
  columnWidths?: string[];
}): React.JSX.Element {
  const widths = columnWidths ?? headers.map(() => `${100 / headers.length}%`);
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {headers.map((h, i) => (
          <Text key={i} style={[styles.tableHeaderCell, { width: widths[i] }]}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={[styles.tableRow, ri % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          {row.map((cell, ci) => (
            <Text key={ci} style={[styles.tableCell, { width: widths[ci] }]}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Risk heat map cells (list-based for PDF) */
export function RiskHeatMap({
  risks,
}: {
  risks: {
    category: string;
    tier: string;
    likelihood: number;
    impact: number;
    mitigation: string;
  }[];
}): React.JSX.Element {
  return (
    <View style={styles.riskGrid}>
      {risks.map((risk, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            marginBottom: 6,
            padding: 8,
            backgroundColor: getTierBg(risk.tier),
            borderRadius: 3,
            borderLeftWidth: 3,
            borderLeftColor: getTierColor(risk.tier),
          }}
        >
          <View style={{ width: '25%' }}>
            <Text
              style={{
                fontSize: 9,
                fontFamily: 'Helvetica-Bold',
                color: colors.slate900,
              }}
            >
              {risk.category}
            </Text>
            <Text
              style={{
                fontSize: 7,
                fontFamily: 'Helvetica-Bold',
                color: getTierColor(risk.tier),
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              {risk.tier}
            </Text>
          </View>
          <View style={{ width: '20%', alignItems: 'center' }}>
            <Text style={{ fontSize: 7, color: colors.slate500 }}>
              L: {risk.likelihood} / I: {risk.impact}
            </Text>
            <Text
              style={{
                fontSize: 8,
                fontFamily: 'Helvetica-Bold',
                color: colors.slate700,
                marginTop: 2,
              }}
            >
              Score: {risk.likelihood * risk.impact}
            </Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text style={{ fontSize: 8, color: colors.slate700, lineHeight: 1.4 }}>
              {risk.mitigation}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.riskLegend}>
        {(['critical', 'high', 'medium', 'low'] as const).map((tier) => (
          <View key={tier} style={styles.riskLegendItem}>
            <View
              style={[
                styles.riskLegendDot,
                { backgroundColor: getTierColor(tier) },
              ]}
            />
            <Text style={styles.riskLegendLabel}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Talking points callout box */
export function TalkingPoints({
  points,
}: {
  points: string[];
}): React.JSX.Element {
  return (
    <View style={styles.talkingPointsBox}>
      <Text style={styles.talkingPointsTitle}>Key Talking Points</Text>
      {points.map((point, i) => (
        <Text key={i} style={styles.talkingPoint}>
          {'\u2022'} {point}
        </Text>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Content rendering helpers
// ---------------------------------------------------------------------------

/** Try parsing a JSON-encoded content block; returns null if not JSON */
function tryParseJson(content: string): Record<string, unknown> | null {
  if (!content.startsWith('{')) return null;
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Render a content string which may be plain text or JSON-encoded structured data */
function renderContent(content: string): React.JSX.Element {
  const parsed = tryParseJson(content);

  // Structured: score_display
  if (parsed && parsed.type === 'score_display') {
    const overall = parsed.overall as number;
    const rating = parsed.rating as string;
    const domains = parsed.domains as {
      name: string;
      score: number;
      passed: boolean;
      threshold: number;
    }[];

    return (
      <View>
        <ScoreHero score={overall} rating={rating} />
        <DomainBars domains={domains} />
      </View>
    );
  }

  // Plain text - split into paragraphs
  const paragraphs = content.split('\n\n');
  return (
    <View>
      {paragraphs.map((para, i) => {
        // Check if this is a numbered list block
        const lines = para.split('\n');
        const isList = lines.every(
          (l) => /^\d+\.\s/.test(l.trim()) || l.trim() === '',
        );

        if (isList) {
          const items = lines
            .map((l) => l.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean);
          return <RecommendationList key={i} items={items} />;
        }

        return <BodyText key={i}>{para}</BodyText>;
      })}
    </View>
  );
}

/** Render a single section (may have subsections) */
function renderSection(section: ContentSection): React.JSX.Element {
  return (
    <View key={section.title} wrap={true}>
      <SectionHeader title={section.title} />
      {section.content && renderContent(section.content)}
      {section.subsections?.map((sub) => (
        <View key={sub.title} wrap={true}>
          <SubsectionHeader title={sub.title} />
          {sub.content && renderContent(sub.content)}
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Document Component
// ---------------------------------------------------------------------------

/**
 * ReportDocument renders a complete multi-page PDF from a ReportContent object.
 * This is the primary component for readiness-style reports.
 */
export function ReportDocument({
  content,
}: {
  content: ReportContent;
}): React.JSX.Element {
  return (
    <Document
      title={content.title}
      author="GovAI Studio"
      subject={content.subtitle}
      creator="GovAI Studio Report Engine"
    >
      {/* Title page */}
      <TitlePage content={content} />

      {/* Content pages */}
      <ReportPage confidentiality={content.metadata.confidentiality}>
        {content.sections.map((section) => renderSection(section))}
      </ReportPage>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Re-export styles and colors for use by specialized renderers
// ---------------------------------------------------------------------------
export { styles, colors, getRatingColor, getTierColor, getTierBg };
