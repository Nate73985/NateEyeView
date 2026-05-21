import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NateEyeView | Global Disease Intelligence Dashboard',
  description: 'A responsive global dashboard for disease, mortality, and outbreak monitoring.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="fixed inset-0 -z-10 grid-fade" />
        {children}
      </body>
    </html>
  );
}
