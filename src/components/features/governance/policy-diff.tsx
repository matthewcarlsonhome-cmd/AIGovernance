'use client';

import { useMemo } from 'react';
import { diffLines, type Change } from 'diff';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PolicyDiffProps {
  oldContent: string;
  newContent: string;
  oldVersion: string;
  newVersion: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

/* ------------------------------------------------------------------ */
/*  Helper: build line-level diff                                      */
/* ------------------------------------------------------------------ */

function buildDiffLines(changes: Change[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const change of changes) {
    const valueLines = change.value.replace(/\n$/, '').split('\n');

    for (const line of valueLines) {
      if (change.added) {
        lines.push({
          type: 'added',
          content: line,
          oldLineNumber: null,
          newLineNumber: newLine,
        });
        newLine++;
      } else if (change.removed) {
        lines.push({
          type: 'removed',
          content: line,
          oldLineNumber: oldLine,
          newLineNumber: null,
        });
        oldLine++;
      } else {
        lines.push({
          type: 'unchanged',
          content: line,
          oldLineNumber: oldLine,
          newLineNumber: newLine,
        });
        oldLine++;
        newLine++;
      }
    }
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  Summary stats                                                      */
/* ------------------------------------------------------------------ */

function computeSummary(lines: DiffLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const line of lines) {
    if (line.type === 'added') added++;
    if (line.type === 'removed') removed++;
  }
  return { added, removed };
}

/* ------------------------------------------------------------------ */
/*  Side-by-side view builders                                         */
/* ------------------------------------------------------------------ */

interface SideLine {
  lineNumber: number | null;
  content: string;
  type: 'added' | 'removed' | 'unchanged' | 'empty';
}

interface SidePair {
  left: SideLine;
  right: SideLine;
}

function buildSideBySide(diffLines: DiffLine[]): SidePair[] {
  const pairs: SidePair[] = [];
  let i = 0;

  while (i < diffLines.length) {
    const current = diffLines[i];

    if (current.type === 'unchanged') {
      pairs.push({
        left: {
          lineNumber: current.oldLineNumber,
          content: current.content,
          type: 'unchanged',
        },
        right: {
          lineNumber: current.newLineNumber,
          content: current.content,
          type: 'unchanged',
        },
      });
      i++;
    } else if (current.type === 'removed') {
      // Collect consecutive removed lines
      const removedLines: DiffLine[] = [];
      while (i < diffLines.length && diffLines[i].type === 'removed') {
        removedLines.push(diffLines[i]);
        i++;
      }
      // Collect consecutive added lines
      const addedLines: DiffLine[] = [];
      while (i < diffLines.length && diffLines[i].type === 'added') {
        addedLines.push(diffLines[i]);
        i++;
      }

      const maxLen = Math.max(removedLines.length, addedLines.length);
      for (let j = 0; j < maxLen; j++) {
        const removed = removedLines[j];
        const added = addedLines[j];
        pairs.push({
          left: removed
            ? {
                lineNumber: removed.oldLineNumber,
                content: removed.content,
                type: 'removed',
              }
            : { lineNumber: null, content: '', type: 'empty' },
          right: added
            ? {
                lineNumber: added.newLineNumber,
                content: added.content,
                type: 'added',
              }
            : { lineNumber: null, content: '', type: 'empty' },
        });
      }
    } else if (current.type === 'added') {
      pairs.push({
        left: { lineNumber: null, content: '', type: 'empty' },
        right: {
          lineNumber: current.newLineNumber,
          content: current.content,
          type: 'added',
        },
      });
      i++;
    }
  }

  return pairs;
}

/* ------------------------------------------------------------------ */
/*  Line number gutter                                                 */
/* ------------------------------------------------------------------ */

function LineNumber({ num }: { num: number | null }): React.JSX.Element {
  return (
    <span className="inline-block w-10 shrink-0 select-none text-right pr-2 text-xs text-slate-400">
      {num ?? ''}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Row styling                                                        */
/* ------------------------------------------------------------------ */

function getLineBg(type: SideLine['type']): string {
  switch (type) {
    case 'added':
      return 'bg-green-50 dark:bg-green-950/30';
    case 'removed':
      return 'bg-red-50 dark:bg-red-950/30';
    case 'empty':
      return 'bg-slate-50 dark:bg-slate-900/30';
    default:
      return '';
  }
}

function getLineTextColor(type: SideLine['type']): string {
  switch (type) {
    case 'added':
      return 'text-green-800 dark:text-green-300';
    case 'removed':
      return 'text-red-800 dark:text-red-300';
    default:
      return 'text-slate-700 dark:text-slate-300';
  }
}

function getPrefix(type: SideLine['type']): string {
  switch (type) {
    case 'added':
      return '+';
    case 'removed':
      return '-';
    default:
      return ' ';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PolicyDiff({
  oldContent,
  newContent,
  oldVersion,
  newVersion,
}: PolicyDiffProps): React.JSX.Element {
  const { diffLineList, summary, sidePairs } = useMemo(() => {
    const changes = diffLines(oldContent, newContent);
    const diffLineList = buildDiffLines(changes);
    const summary = computeSummary(diffLineList);
    const sidePairs = buildSideBySide(diffLineList);
    return { diffLineList, summary, sidePairs };
  }, [oldContent, newContent]);

  return (
    <div className="w-full rounded-lg border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Policy Version Diff
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-red-700 dark:bg-red-900/40 dark:text-red-300">
              {oldVersion}
            </span>
            <span aria-hidden="true">&rarr;</span>
            <span className="rounded bg-green-100 px-2 py-0.5 font-mono text-green-700 dark:bg-green-900/40 dark:text-green-300">
              {newVersion}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-600 dark:text-green-400 font-medium">
            +{summary.added} added
          </span>
          <span className="text-red-600 dark:text-red-400 font-medium">
            -{summary.removed} removed
          </span>
        </div>
      </div>

      {/* Side-by-side diff table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b bg-slate-50/50 dark:bg-slate-900/30">
              <th className="w-1/2 px-4 py-2 text-left text-xs font-semibold text-slate-500">
                {oldVersion} (Previous)
              </th>
              <th className="w-1/2 px-4 py-2 text-left text-xs font-semibold text-slate-500 border-l">
                {newVersion} (Current)
              </th>
            </tr>
          </thead>
          <tbody>
            {sidePairs.map((pair, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                {/* Left side (old) */}
                <td
                  className={cn(
                    'px-2 py-0.5 align-top whitespace-pre-wrap break-all',
                    getLineBg(pair.left.type)
                  )}
                >
                  <div className="flex items-start">
                    <LineNumber num={pair.left.lineNumber} />
                    <span
                      className={cn(
                        'inline-block w-4 shrink-0 select-none text-center',
                        pair.left.type === 'removed'
                          ? 'text-red-500 font-bold'
                          : 'text-transparent'
                      )}
                    >
                      {getPrefix(pair.left.type)}
                    </span>
                    <span className={cn('flex-1', getLineTextColor(pair.left.type))}>
                      {pair.left.content || '\u00A0'}
                    </span>
                  </div>
                </td>
                {/* Right side (new) */}
                <td
                  className={cn(
                    'px-2 py-0.5 align-top whitespace-pre-wrap break-all border-l',
                    getLineBg(pair.right.type)
                  )}
                >
                  <div className="flex items-start">
                    <LineNumber num={pair.right.lineNumber} />
                    <span
                      className={cn(
                        'inline-block w-4 shrink-0 select-none text-center',
                        pair.right.type === 'added'
                          ? 'text-green-500 font-bold'
                          : 'text-transparent'
                      )}
                    >
                      {getPrefix(pair.right.type)}
                    </span>
                    <span className={cn('flex-1', getLineTextColor(pair.right.type))}>
                      {pair.right.content || '\u00A0'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      {diffLineList.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          No differences found between {oldVersion} and {newVersion}.
        </div>
      )}
    </div>
  );
}
