import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Leaf, LogOut, Menu, Smile, X } from 'lucide-react';
import { NAV_GROUPS, ROLE_LABELS } from '../config/constants';
import { PageSkeleton } from '../components/ui/States';
import { useAuth } from '../contexts/AuthContext';

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex size-9 overflow-hidden rounded-lg" aria-hidden="true">
        <span className="flex w-1/2 items-center justify-center bg-ayur-600 text-white"><Leaf className="size-4 translate-x-0.5" /></span>
        <span className="flex w-1/2 items-center justify-center bg-dental-600 text-white"><Smile className="size-4 -translate-x-0.5" /></span>
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">Shree Aadhitya</p>
        <p className="text-[11px] tracking-wider text-white/60 uppercase">Admin</p>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }) {
  const { can } = useAuth();
  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group, gi) => {
        const items = group.items.filter((i) => can(i.module));
        if (!items.length) return null;
        return (
          <div key={gi} className="mb-5">
            {group.title && <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-white/40 uppercase">{group.title}</p>}
            <ul className="space-y-0.5">
              {items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} onClick={onNavigate}
                    className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}>
                    <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { profile, role, user, logout, isDemo } = useAuth();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="flex h-16 shrink-0 items-center justify-between px-5"><Brand />
        <button type="button" className="text-white/70 hover:text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
      </div>
      <Sidebar onNavigate={() => setOpen(false)} />
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <a href="#admin-main" className="sr-only rounded bg-white px-3 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[90]">Skip to content</a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]" aria-label="Navigation menu">{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-ink-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <button type="button" className="flex size-10 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          <Menu className="size-5" />
        </button>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="max-w-[160px] truncate text-sm font-medium text-ink-900">{profile?.name || user?.email}</p>
            <p className="text-xs text-ink-500">{ROLE_LABELS[role]}</p>
          </div>
          <button type="button" onClick={logout} className="flex h-10 items-center gap-2 rounded-md border border-ink-300 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50">
            <LogOut className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">Sign out</span><span className="sr-only sm:hidden">Sign out</span>
          </button>
        </div>
      </header>

      {isDemo && (
        <div role="status" className="border-b border-gold-500/40 bg-gold-100 px-4 py-2 text-center text-xs text-gold-700 sm:px-6">
          <strong>Demo session</strong> — not signed in to Firebase, so screens that load or save data may show permission errors.
        </div>
      )}

      <main id="admin-main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
