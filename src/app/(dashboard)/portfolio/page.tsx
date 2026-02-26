'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Portfolio has been merged into the unified Projects page.
 * Redirect any bookmarks or old links to /projects.
 */
export default function PortfolioRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/projects');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-slate-500">Redirecting to Projects...</p>
    </div>
  );
}
