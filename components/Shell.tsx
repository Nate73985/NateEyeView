import Link from 'next/link';
import { Activity, BookOpen, Globe2, Info, Radio } from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: Globe2 },
  { href: '/methodology', label: 'Methodology', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info }
];

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-obsidian/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="NateEyeView dashboard">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan/40 bg-cyan/10 shadow-glow">
              <Activity className="h-5 w-5 text-cyan" aria-hidden />
            </span>
            <span>
              <span className="block text-lg font-black leading-tight tracking-wide">NateEyeView</span>
              <span className="hidden text-xs uppercase tracking-[0.24em] text-slate-400 sm:block">Global health intelligence</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-10 items-center gap-2 rounded-md px-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <item.icon className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success lg:flex">
            <Radio className="h-4 w-4" aria-hidden />
            12h mortality refresh / 1h news scan
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 lg:py-6">{children}</main>
    </div>
  );
}
