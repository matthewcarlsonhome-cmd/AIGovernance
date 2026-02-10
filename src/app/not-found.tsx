import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl border shadow-sm p-6 space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <FileQuestion className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Page Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
