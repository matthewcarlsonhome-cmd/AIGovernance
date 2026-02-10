import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Header,
  Footer,
  PageNumber,
  ShadingType,
  PageBreak,
  convertInchesToTwip,
  LevelFormat,
  Tab,
  TabStopType,
  type INumberingOptions,
  type ISectionOptions,
  type IParagraphOptions,
  type ITableCellOptions,
} from 'docx';

// ────────────────────────────────────────────────────────────
// Shared style constants
// ────────────────────────────────────────────────────────────

const FONT_BODY = 'Calibri';
const FONT_HEADING = 'Calibri';
const FONT_SIZE_BODY = 22; // half-points → 11pt
const FONT_SIZE_SMALL = 18; // 9pt
const FONT_SIZE_H1 = 32; // 16pt
const FONT_SIZE_H2 = 28; // 14pt
const FONT_SIZE_H3 = 24; // 12pt
const FONT_SIZE_TITLE = 52; // 26pt
const FONT_SIZE_SUBTITLE = 28; // 14pt

const COLOR_PRIMARY = '1B3A5C'; // dark navy
const COLOR_ACCENT = '2E7D32'; // green accent
const COLOR_HEADER_BG = '1B3A5C';
const COLOR_HEADER_TEXT = 'FFFFFF';
const COLOR_ROW_ALT = 'F5F7FA';
const COLOR_MUTED = '666666';

const BULLET_REFERENCE = 'govai-bullets';

// ────────────────────────────────────────────────────────────
// Numbering definition for bullet lists
// ────────────────────────────────────────────────────────────

export const bulletNumbering: INumberingOptions = {
  config: [
    {
      reference: BULLET_REFERENCE,
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
            },
          },
        },
        {
          level: 1,
          format: LevelFormat.BULLET,
          text: '\u25E6',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
            },
          },
        },
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────
// Paragraph helpers
// ────────────────────────────────────────────────────────────

/**
 * Create a heading paragraph.
 */
export function createHeading(
  text: string,
  level: 'HEADING_1' | 'HEADING_2' | 'HEADING_3' = 'HEADING_1',
): Paragraph {
  const headingMap: Record<string, { heading: typeof HeadingLevel[keyof typeof HeadingLevel]; size: number }> = {
    HEADING_1: { heading: HeadingLevel.HEADING_1, size: FONT_SIZE_H1 },
    HEADING_2: { heading: HeadingLevel.HEADING_2, size: FONT_SIZE_H2 },
    HEADING_3: { heading: HeadingLevel.HEADING_3, size: FONT_SIZE_H3 },
  };

  const cfg = headingMap[level];
  return new Paragraph({
    heading: cfg.heading,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT_HEADING,
        size: cfg.size,
        bold: true,
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

/**
 * Create a body paragraph with optional bold or italic formatting.
 */
export function createParagraph(
  text: string,
  options: {
    bold?: boolean;
    italic?: boolean;
    alignment?: typeof AlignmentType[keyof typeof AlignmentType];
    spacing?: { before?: number; after?: number };
    color?: string;
    size?: number;
  } = {},
): Paragraph {
  return new Paragraph({
    alignment: options.alignment ?? AlignmentType.LEFT,
    spacing: options.spacing ?? { after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT_BODY,
        size: options.size ?? FONT_SIZE_BODY,
        bold: options.bold,
        italics: options.italic,
        color: options.color,
      }),
    ],
  });
}

/**
 * Create a bullet list from an array of strings.
 */
export function createBulletList(items: string[]): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        numbering: { reference: BULLET_REFERENCE, level: 0 },
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: item,
            font: FONT_BODY,
            size: FONT_SIZE_BODY,
          }),
        ],
      }),
  );
}

/**
 * Create a table with headers and data rows.
 * Supports alternating row colours and header styling.
 */
export function createTable(
  headers: string[],
  rows: string[][],
  options: { widths?: number[] } = {},
): Table {
  const columnCount = headers.length;
  const defaultWidth = Math.floor(100 / columnCount);
  const widths = options.widths ?? headers.map(() => defaultWidth);

  const headerCells = headers.map(
    (h, i) =>
      new TableCell({
        width: { size: widths[i], type: WidthType.PERCENTAGE },
        shading: { fill: COLOR_HEADER_BG, type: ShadingType.CLEAR, color: 'auto' },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: h,
                font: FONT_BODY,
                size: FONT_SIZE_BODY,
                bold: true,
                color: COLOR_HEADER_TEXT,
              }),
            ],
          }),
        ],
      }),
  );

  const dataRows = rows.map((row, rowIdx) => {
    const isAlt = rowIdx % 2 === 1;
    const cells = row.map(
      (cell, colIdx) =>
        new TableCell({
          width: { size: widths[colIdx], type: WidthType.PERCENTAGE },
          shading: isAlt
            ? { fill: COLOR_ROW_ALT, type: ShadingType.CLEAR, color: 'auto' }
            : undefined,
          children: [
            new Paragraph({
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: cell,
                  font: FONT_BODY,
                  size: FONT_SIZE_BODY,
                }),
              ],
            }),
          ],
        } satisfies ITableCellOptions),
    );

    // Pad if row has fewer cells than headers
    while (cells.length < columnCount) {
      cells.push(
        new TableCell({
          width: { size: widths[cells.length] ?? defaultWidth, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [] })],
        }),
      );
    }

    return new TableRow({ children: cells });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...dataRows],
  });
}

// ────────────────────────────────────────────────────────────
// Cover page helpers
// ────────────────────────────────────────────────────────────

/**
 * Create a branded cover page section.
 * Returns an array of Paragraph children for the cover section.
 */
export function createCoverPage(
  title: string,
  metadata: Record<string, string>,
): Paragraph[] {
  const children: Paragraph[] = [];

  // Spacer
  children.push(new Paragraph({ spacing: { before: 2400 }, children: [] }));

  // Brand label
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'GovAI Studio',
          font: FONT_HEADING,
          size: FONT_SIZE_H2,
          color: COLOR_ACCENT,
          bold: true,
        }),
      ],
    }),
  );

  // Horizontal rule (thin line using border)
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_PRIMARY, space: 1 },
      },
      spacing: { after: 200 },
      children: [],
    }),
  );

  // Document title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: title,
          font: FONT_HEADING,
          size: FONT_SIZE_TITLE,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
  );

  // Horizontal rule
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_PRIMARY, space: 1 },
      },
      spacing: { after: 600 },
      children: [],
    }),
  );

  // Metadata table
  Object.entries(metadata).forEach(([key, value]) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `${formatLabel(key)}: `,
            font: FONT_BODY,
            size: FONT_SIZE_BODY,
            bold: true,
            color: COLOR_MUTED,
          }),
          new TextRun({
            text: value,
            font: FONT_BODY,
            size: FONT_SIZE_BODY,
            color: COLOR_MUTED,
          }),
        ],
      }),
    );
  });

  // Page break after cover
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    }),
  );

  return children;
}

// ────────────────────────────────────────────────────────────
// Section content renderer
// ────────────────────────────────────────────────────────────

/**
 * Generic section renderer: takes a heading, body text, optional bullet items,
 * and optional table, and produces an array of Paragraphs / Tables.
 */
export function renderSection(section: {
  heading: string;
  body: string;
  items?: string[];
  table?: { headers: string[]; rows: string[][] };
}): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];

  children.push(createHeading(section.heading, 'HEADING_1'));

  // Body may contain embedded newlines; split on double-newline for paragraph breaks
  const bodyParagraphs = section.body.split('\n\n').filter(Boolean);
  bodyParagraphs.forEach((p) => {
    children.push(createParagraph(p.replace(/\n/g, ' ')));
  });

  if (section.items && section.items.length > 0) {
    children.push(...createBulletList(section.items));
  }

  if (section.table && section.table.rows.length > 0) {
    children.push(createTable(section.table.headers, section.table.rows));
    // Small spacer after table
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  }

  return children;
}

// ────────────────────────────────────────────────────────────
// Document factory
// ────────────────────────────────────────────────────────────

/**
 * Wrap section children into a full Document with header, footer, and numbering.
 */
export function createDocument(sectionChildren: (Paragraph | Table)[]): Document {
  const sections: ISectionOptions[] = [
    {
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'GovAI Studio',
                  font: FONT_HEADING,
                  size: FONT_SIZE_SMALL,
                  color: COLOR_MUTED,
                  italics: true,
                }),
                new TextRun({
                  text: '  |  CONFIDENTIAL',
                  font: FONT_BODY,
                  size: FONT_SIZE_SMALL,
                  color: COLOR_MUTED,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Page ',
                  font: FONT_BODY,
                  size: FONT_SIZE_SMALL,
                  color: COLOR_MUTED,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_BODY,
                  size: FONT_SIZE_SMALL,
                  color: COLOR_MUTED,
                }),
                new TextRun({
                  text: ' of ',
                  font: FONT_BODY,
                  size: FONT_SIZE_SMALL,
                  color: COLOR_MUTED,
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: FONT_BODY,
                  size: FONT_SIZE_SMALL,
                  color: COLOR_MUTED,
                }),
              ],
            }),
          ],
        }),
      },
      children: sectionChildren,
    },
  ];

  return new Document({
    numbering: bulletNumbering,
    sections,
  });
}

// ────────────────────────────────────────────────────────────
// Utility helpers
// ────────────────────────────────────────────────────────────

/**
 * Format a camelCase or snake_case key into a human-readable label.
 */
function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
