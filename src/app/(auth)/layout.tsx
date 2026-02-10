export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">GovAI Studio</h1>
          <p className="text-slate-500 mt-2">AI Governance &amp; Implementation Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
