import { Packer, Paragraph, Table } from 'docx';
import type { LegalReportContent } from './legal-report';
import {
  createCoverPage,
  createDocument,
  createHeading,
  createParagraph,
  renderSection,
} from './renderer';

/**
 * Render a LegalReportContent object into a DOCX buffer.
 *
 * The legal report is structured for editability by legal/compliance teams:
 *   Cover page -> Regulatory Landscape -> AUP Analysis -> IRP Addendum ->
 *   Data Classification -> Compliance Mapping Table -> Risk Register ->
 *   Contractual Considerations
 */
export function renderLegalDocument(content: LegalReportContent): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Cover page with PRIVILEGED & CONFIDENTIAL marking
  children.push(...createCoverPage(content.title, content.metadata));

  // Confidentiality notice
  children.push(
    createHeading('Confidentiality Notice', 'HEADING_3'),
  );
  children.push(
    createParagraph(
      'This document is privileged and confidential. It is intended solely for the use of the ' +
      'named recipient organization. Unauthorized distribution, copying, or disclosure of this ' +
      'document or its contents is strictly prohibited.',
      { italic: true, color: '999999' },
    ),
  );

  // Render each section
  for (const section of content.sections) {
    children.push(...renderSection(section));
  }

  // Signature block
  children.push(createHeading('Approvals', 'HEADING_1'));
  children.push(
    createParagraph(
      'This document has been reviewed and approved by the following parties:',
    ),
  );
  children.push(new Paragraph({ spacing: { after: 400 }, children: [] }));

  const signatureLines = [
    'Legal Counsel',
    'Chief Information Security Officer',
    'Compliance Officer',
    'Executive Sponsor',
  ];

  for (const role of signatureLines) {
    children.push(
      createParagraph(
        '_________________________________________',
        { spacing: { before: 240, after: 40 } },
      ),
    );
    children.push(
      createParagraph(
        `${role}    Date: _______________`,
        { color: '666666', size: 20 },
      ),
    );
  }

  const doc = createDocument(children);
  return Packer.toBuffer(doc) as Promise<Buffer>;
}
