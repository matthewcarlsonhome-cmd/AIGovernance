import type { MeetingNote, ActionItem } from '@/types';

export interface MeetingSummaryData {
  meeting: MeetingNote;
  actionItems: ActionItem[];
  projectName: string;
  generatedAt: string;
}

export interface MeetingSummaryContent {
  title: string;
  metadata: Record<string, string>;
  sections: { heading: string; body: string; items?: string[]; table?: { headers: string[]; rows: string[][] } }[];
}

export function generateMeetingSummaryContent(data: MeetingSummaryData): MeetingSummaryContent {
  const { meeting, actionItems, projectName, generatedAt } = data;

  const openItems = actionItems.filter(a => a.status === 'open');
  const inProgressItems = actionItems.filter(a => a.status === 'in_progress');
  const completeItems = actionItems.filter(a => a.status === 'complete');

  return {
    title: `Meeting Summary: ${meeting.title}`,
    metadata: {
      project: projectName,
      date: meeting.meeting_date,
      type: formatMeetingType(meeting.meeting_type),
      attendees: meeting.attendees.map(a => `${a.name}${a.role ? ` (${a.role})` : ''}`).join(', '),
      generatedAt,
    },
    sections: [
      {
        heading: 'Attendees',
        body: `${meeting.attendees.length} participants:`,
        table: {
          headers: ['Name', 'Role', 'Email'],
          rows: meeting.attendees.map(a => [
            a.name,
            a.role || '—',
            a.email || '—',
          ]),
        },
      },
      {
        heading: 'Meeting Notes',
        body: meeting.notes || 'No notes recorded.',
      },
      ...(meeting.summary ? [{
        heading: 'Summary',
        body: meeting.summary,
      }] : []),
      {
        heading: 'Action Items',
        body: `${actionItems.length} action items: ${openItems.length} open, ${inProgressItems.length} in progress, ${completeItems.length} complete.`,
        table: actionItems.length > 0 ? {
          headers: ['Action Item', 'Assigned To', 'Priority', 'Due Date', 'Status'],
          rows: actionItems.map(a => [
            a.title,
            a.assigned_to_name || '—',
            a.priority.toUpperCase(),
            a.due_date || '—',
            a.status.replace('_', ' ').toUpperCase(),
          ]),
        } : undefined,
      },
      {
        heading: 'Next Steps',
        body: openItems.length > 0
          ? 'The following items require immediate attention:'
          : 'All action items have been addressed.',
        items: openItems.map(a =>
          `${a.title} — assigned to ${a.assigned_to_name || 'TBD'}${a.due_date ? `, due ${a.due_date}` : ''}`
        ),
      },
    ],
  };
}

function formatMeetingType(type: string): string {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
