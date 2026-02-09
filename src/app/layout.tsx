import type { Metadata } from 'next';
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
        <div id="providers">{children}</div>
      </body>
    </html>
  );
}
