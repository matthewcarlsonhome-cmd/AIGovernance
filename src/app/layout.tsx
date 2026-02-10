import type { Metadata } from 'next';
import { QueryProvider } from '@/lib/query/provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'GovAI Studio - AI Governance Platform',
  description: 'AI Governance & Enterprise Implementation Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
