import { Packer, Paragraph, Table } from 'docx';
import type { MeetingSummaryContent } from './meeting-summary';
import {
  createCoverPage,
  createDocument,
  renderSection,
} from './renderer';

/**
 * Render a MeetingSummaryContent object into a DOCX buffer.
 *
 * The meeting summary is a concise document structured as:
 *   Header info -> Attendees table -> Meeting Notes ->
 *   (Optional) Summary -> Action Items table -> Next Steps
 */
export function renderMeetingDocument(content: MeetingSummaryContent): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Cover page with meeting metadata
  children.push(...createCoverPage(content.title, content.metadata));

  // Render each section (attendees, notes, summary, action items, next steps)
  for (const section of content.sections) {
    children.push(...renderSection(section));
  }

  const doc = createDocument(children);
  return Packer.toBuffer(doc) as Promise<Buffer>;
}
