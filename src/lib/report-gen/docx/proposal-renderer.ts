import { Packer, Paragraph, Table } from 'docx';
import type { ProposalContent } from './proposal-generator';
import {
  createCoverPage,
  createDocument,
  renderSection,
} from './renderer';

/**
 * Render a ProposalContent object into a DOCX buffer.
 *
 * The proposal follows a professional engagement-proposal layout:
 *   Cover page -> Objectives -> Scope table -> Deliverables ->
 *   Timeline -> Team Requirements -> Investment -> Assumptions
 */
export function renderProposalDocument(content: ProposalContent): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Cover page
  children.push(...createCoverPage(content.title, content.metadata));

  // Render each section (objectives, scope, deliverables, timeline, team, investment, assumptions)
  for (const section of content.sections) {
    children.push(...renderSection(section));
  }

  const doc = createDocument(children);
  return Packer.toBuffer(doc) as Promise<Buffer>;
}
