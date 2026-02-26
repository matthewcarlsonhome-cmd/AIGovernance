'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { PresenceUser } from '@/hooks/use-realtime-presence';
import type { UserRole } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of avatar circles to display before showing "+N" badge. */
const MAX_VISIBLE_AVATARS = 4;

/** Role display labels matching the project convention (professional tone). */
const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Project Administrator',
  consultant: 'Governance Consultant',
  executive: 'Executive Sponsor',
  it: 'IT / Security Lead',
  legal: 'Legal / Compliance Lead',
  engineering: 'Engineering Lead',
  marketing: 'Communications Lead',
};

/** Avatar background colors per role. */
function getAvatarColor(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'bg-violet-500';
    case 'consultant':
      return 'bg-cyan-500';
    case 'executive':
      return 'bg-pink-500';
    case 'it':
      return 'bg-blue-500';
    case 'legal':
      return 'bg-amber-500';
    case 'engineering':
      return 'bg-emerald-500';
    case 'marketing':
      return 'bg-orange-500';
    default:
      return 'bg-slate-500';
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .map((w) => w[0]?.toUpperCase())
    .filter((c): c is string => Boolean(c))
    .join('')
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface AvatarCircleProps {
  user: PresenceUser;
  /** Negative margin offset index (for overlapping effect). */
  index: number;
}

function AvatarCircle({ user, index }: AvatarCircleProps): React.ReactElement {
  const initials = getInitials(user.name);
  const tooltipText = `${user.name} (${ROLE_LABELS[user.role] ?? user.role})`;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'w-8 h-8 rounded-full border-2 border-white',
        'text-xs font-semibold text-white',
        'cursor-default select-none',
        getAvatarColor(user.role),
      )}
      style={{ zIndex: MAX_VISIBLE_AVATARS - index }}
      title={tooltipText}
    >
      {user.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
      {/* Online indicator */}
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface PresenceAvatarsProps {
  /** List of users currently viewing the project. */
  viewers: PresenceUser[];
  /** Whether the presence channel is connected. */
  isConnected?: boolean;
  /** Additional CSS classes for the wrapper. */
  className?: string;
}

/**
 * Displays avatar circles of users currently viewing the same project.
 *
 * Shows up to 4 avatars in an overlapping stack. When there are more
 * than 4 viewers, a "+N" overflow badge is shown.
 *
 * Each avatar shows the user's initials (or avatar image), colored by
 * role, with a green online indicator dot. Hovering shows the user's
 * name and role.
 *
 * When no viewers are present or the connection is down, nothing is rendered.
 */
export function PresenceAvatars({
  viewers,
  isConnected = false,
  className,
}: PresenceAvatarsProps): React.ReactElement | null {
  if (!isConnected || viewers.length === 0) {
    return null;
  }

  const visibleViewers = viewers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = viewers.length - MAX_VISIBLE_AVATARS;

  const overflowNames = overflowCount > 0
    ? viewers
        .slice(MAX_VISIBLE_AVATARS)
        .map((u) => u.name)
        .join(', ')
    : '';

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex items-center -space-x-2">
        {visibleViewers.map((viewer, index) => (
          <AvatarCircle key={viewer.id} user={viewer} index={index} />
        ))}

        {overflowCount > 0 && (
          <div
            className={cn(
              'relative flex items-center justify-center',
              'w-8 h-8 rounded-full border-2 border-white',
              'bg-slate-200 text-slate-600 text-xs font-semibold',
              'cursor-default select-none',
            )}
            style={{ zIndex: 0 }}
            title={overflowNames}
          >
            +{overflowCount}
          </div>
        )}
      </div>

      <span className="ml-2 text-xs text-slate-500">
        {viewers.length === 1
          ? '1 viewer'
          : `${viewers.length} viewers`}
      </span>
    </div>
  );
}
