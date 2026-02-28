'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Search,
  LayoutDashboard,
  Settings,
  FolderPlus,
  FileOutput,
  ClipboardList,
  Download,
  ArrowRight,
  Command,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: 'Navigation' | 'Actions' | 'Recent Projects';
  shortcut?: string;
  action: () => void;
}

/* ------------------------------------------------------------------ */
/*  Keyboard shortcut display                                          */
/* ------------------------------------------------------------------ */

function ShortcutBadge({ shortcut }: { shortcut: string }): React.JSX.Element {
  const keys = shortcut.split('+');
  return (
    <span className="ml-auto flex items-center gap-0.5">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-slate-100 px-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* Build command items */
  const allItems: CommandItem[] = useMemo(() => {
    const navigate = (href: string) => () => {
      router.push(href);
      setOpen(false);
    };

    return [
      /* Navigation */
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        section: 'Navigation' as const,
        shortcut: 'G+D',
        action: navigate('/'),
      },
      {
        id: 'nav-settings',
        label: 'Settings',
        icon: Settings,
        section: 'Navigation' as const,
        shortcut: 'G+S',
        action: navigate('/settings'),
      },
      {
        id: 'nav-new-project',
        label: 'New Project',
        icon: FolderPlus,
        section: 'Navigation' as const,
        shortcut: 'G+N',
        action: navigate('/projects/new'),
      },

      /* Actions */
      {
        id: 'action-report',
        label: 'Generate Report',
        icon: FileOutput,
        section: 'Actions' as const,
        action: navigate('/projects/demo-1/reports/generate'),
      },
      {
        id: 'action-assessment',
        label: 'Run Assessment',
        icon: ClipboardList,
        section: 'Actions' as const,
        action: navigate('/projects/demo-1/discovery/questionnaire'),
      },
      {
        id: 'action-export',
        label: 'Export Data',
        icon: Download,
        section: 'Actions' as const,
        action: navigate('/projects/demo-1/reports/history'),
      },

      /* Recent Projects */
      {
        id: 'recent-enterprise-pilot',
        label: 'Enterprise AI Pilot',
        icon: ArrowRight,
        section: 'Recent Projects' as const,
        action: navigate('/projects/demo-1/overview'),
      },
      {
        id: 'recent-security-review',
        label: 'Security Review Q1',
        icon: ArrowRight,
        section: 'Recent Projects' as const,
        action: navigate('/projects/demo-1/governance/policies'),
      },
      {
        id: 'recent-sandbox-eval',
        label: 'Sandbox Evaluation',
        icon: ArrowRight,
        section: 'Recent Projects' as const,
        action: navigate('/projects/demo-1/sandbox/configure'),
      },
    ];
  }, [router]);

  /* Filter items based on query */
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [allItems, query]);

  /* Group by section */
  const groupedItems = useMemo(() => {
    const sections: Record<string, CommandItem[]> = {};
    for (const item of filteredItems) {
      if (!sections[item.section]) sections[item.section] = [];
      sections[item.section].push(item);
    }
    return sections;
  }, [filteredItems]);

  /* Flat list for keyboard navigation */
  const flatItems = useMemo(() => {
    const result: CommandItem[] = [];
    const sectionOrder: Array<'Navigation' | 'Actions' | 'Recent Projects'> = [
      'Navigation',
      'Actions',
      'Recent Projects',
    ];
    for (const section of sectionOrder) {
      if (groupedItems[section]) {
        result.push(...groupedItems[section]);
      }
    }
    return result;
  }, [groupedItems]);

  /* Reset active index when filter changes */
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  /* Global keyboard shortcut */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* Focus input when dialog opens */
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Small delay so dialog mounts before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /* Scroll active item into view */
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  /* Keyboard navigation within the palette */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev <= 0 ? Math.max(0, flatItems.length - 1) : prev - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[activeIndex]) {
            flatItems[activeIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [flatItems, activeIndex]
  );

  const sectionOrder: Array<'Navigation' | 'Actions' | 'Recent Projects'> = [
    'Navigation',
    'Actions',
    'Recent Projects',
  ];

  let runningIndex = 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[calc(100vw-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {sectionOrder.map((sectionName) => {
            const items = groupedItems[sectionName];
            if (!items || items.length === 0) return null;

            const sectionStartIndex = runningIndex;

            const sectionContent = (
              <div key={sectionName} className="mb-1">
                <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {sectionName}
                </div>
                {items.map((item, itemIdx) => {
                  const globalIdx = sectionStartIndex + itemIdx;
                  const isActive = globalIdx === activeIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      data-active={isActive}
                      onClick={() => {
                        item.action();
                      }}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.shortcut && <ShortcutBadge shortcut={item.shortcut} />}
                    </button>
                  );
                })}
              </div>
            );

            runningIndex += items.length;
            return sectionContent;
          })}
        </div>

        {/* Footer */}
        <div className="hidden sm:flex items-center justify-between border-t px-4 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border bg-slate-100 px-0.5 text-[10px] dark:bg-slate-800 dark:border-slate-700">
                &uarr;
              </kbd>
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border bg-slate-100 px-0.5 text-[10px] dark:bg-slate-800 dark:border-slate-700">
                &darr;
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border bg-slate-100 px-1 text-[10px] dark:bg-slate-800 dark:border-slate-700">
                &crarr;
              </kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />K to toggle
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
