import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  PackageOpen,
  Paintbrush,
  Layers,
  Swords,
  Store,
  Trophy,
  User,
  Settings,
  ShieldCheck,
  Home,
  LayoutDashboard,
  Sun,
  Moon,
  Globe,
  Volume2,
  VolumeX,
  Coins,
  LogIn,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { Footer } from './Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { profile, isAuthenticated, isAdmin, settings, updateSettings } = useGame();
  const location = useLocation();
  const navigate = useNavigate();

  const isLanding = location.pathname === '/';

  const sidebarItems = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/discover', label: t.nav.discover, icon: Compass },
    { to: '/break', label: t.nav.breakPacks, icon: PackageOpen },
    { to: '/creator', label: t.nav.creator, icon: Paintbrush },
    { to: '/collection', label: t.nav.collection, icon: Layers },
    { to: '/battle', label: t.nav.battle, icon: Swords },
    { to: '/marketplace', label: t.nav.marketplace, icon: Store },
    { to: '/leaderboard', label: t.nav.leaderboard, icon: Trophy },
    { to: '/profile', label: t.nav.profile, icon: User },
    { to: '/settings', label: t.nav.settings, icon: Settings },
    ...(isAdmin ? [{ to: '/admin', label: t.nav.admin, icon: ShieldCheck }] : []),
  ];

  const mobileBottomItems = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/break', label: t.nav.breakPacks, icon: PackageOpen },
    { to: '/collection', label: t.nav.collection, icon: Layers },
    { to: '/battle', label: t.nav.battle, icon: Swords },
    { to: '/profile', label: t.nav.profile, icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4FBFF] dark:bg-[#101C32] text-[#101C32] dark:text-[#F0F8FF] transition-colors">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#75C9FF]/30 bg-white/85 dark:bg-[#101C32]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single clean wordmark */}
          <Link
            to="/"
            className="font-display font-extrabold text-xl tracking-tight text-[#101C32] dark:text-white whitespace-nowrap shrink-0"
          >
            ZharCard
          </Link>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <NavLink
              to="/discover"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors ${
                  isActive ? 'text-[#2377B9] dark:text-[#75C9FF] font-semibold' : ''
                }`
              }
            >
              {t.nav.discover}
            </NavLink>
            <NavLink
              to="/break"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors ${
                  isActive ? 'text-[#2377B9] dark:text-[#75C9FF] font-semibold' : ''
                }`
              }
            >
              {t.nav.breakPacks}
            </NavLink>
            <NavLink
              to="/creator"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors ${
                  isActive ? 'text-[#2377B9] dark:text-[#75C9FF] font-semibold' : ''
                }`
              }
            >
              {t.nav.creator}
            </NavLink>
            <NavLink
              to="/battle"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors ${
                  isActive ? 'text-[#2377B9] dark:text-[#75C9FF] font-semibold' : ''
                }`
              }
            >
              {t.nav.battle}
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors ${
                  isActive ? 'text-[#2377B9] dark:text-[#75C9FF] font-semibold' : ''
                }`
              }
            >
              {t.nav.leaderboard}
            </NavLink>
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="shrink-0">
            {isLanding ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                {t.nav.playNow}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/auth')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                {isAuthenticated ? (
                  <>
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[110px]">{profile.username}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t.nav.login}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body Layout: Landing uses full-width canvas; App pages use Desktop Sidebar + Workspace */}
      {isLanding ? (
        <>
          {/* Compact Workspace Preferences Bar below hero fold on Landing or top utility strip */}
          <div className="border-b border-[#75C9FF]/20 bg-[#DDF3FF]/60 dark:bg-[#162644]/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <span className="font-semibold text-[#2377B9] dark:text-[#75C9FF]">{t.brand.world}</span>
                <span aria-hidden="true">·</span>
                <span>{t.brand.tagline}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                  aria-label="Toggle language"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#101C32] border border-[#75C9FF]/40 font-semibold hover:bg-[#DDF3FF] dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <Globe className="w-3.5 h-3.5 text-[#2377B9] dark:text-[#75C9FF]" />
                  {lang === 'id' ? 'ID' : 'EN'}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle light or dark mode"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#101C32] border border-[#75C9FF]/40 font-semibold hover:bg-[#DDF3FF] dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  {theme === 'light' ? (
                    <Moon className="w-3.5 h-3.5 text-[#2377B9]" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-[#FFD76A]" />
                  )}
                  {theme === 'light' ? 'Dark' : 'Light'}
                </button>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#101C32] border border-[#75C9FF]/40 font-semibold hover:bg-[#DDF3FF] dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#2377B9] dark:text-[#75C9FF]" />
                  {isAuthenticated ? profile.username : t.nav.login}
                </Link>
              </div>
            </div>
          </div>

          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <Footer />
        </>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-[#75C9FF]/25 bg-white/60 dark:bg-[#0f1a2e]/70 p-4 min-h-[calc(100vh-4rem)]">
            <div className="space-y-6">
              {/* Coin & Level Readout */}
              <div className="rounded-2xl bg-[#DDF3FF]/70 dark:bg-[#162644] border border-[#75C9FF]/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#101C32] dark:text-white truncate">
                    {profile.username}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-[#2377B9] dark:text-[#75C9FF]">
                    Lv.{profile.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#75C9FF]/25">
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    Coins
                  </span>
                  <span className="font-mono tabular-nums font-bold text-[#101C32] dark:text-[#FFD76A]">
                    {profile.coins.toLocaleString()}
                  </span>
                </div>
              </div>

              <nav aria-label="Dashboard Sidebar" className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? 'bg-[#2377B9] text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-[#DDF3FF] dark:hover:bg-[#162644]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Utility Toggles (Language, Theme, Audio) */}
            <div className="pt-4 border-t border-[#75C9FF]/25 space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                  aria-label="Switch Language"
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-[#DDF3FF]/70 dark:bg-[#162644] text-xs font-semibold hover:bg-[#BDEBFF] dark:hover:bg-slate-700 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-[#DDF3FF]/70 dark:bg-[#162644] text-xs font-semibold hover:bg-[#BDEBFF] dark:hover:bg-slate-700 transition-colors"
                >
                  {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-[#FFD76A]" />}
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ sfxEnabled: !settings.sfxEnabled })}
                  aria-label="Toggle Sound Effects"
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-[#DDF3FF]/70 dark:bg-[#162644] text-xs font-semibold hover:bg-[#BDEBFF] dark:hover:bg-slate-700 transition-colors"
                >
                  {settings.sfxEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#2377B9] dark:text-[#75C9FF]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0 flex flex-col">
            {/* Tablet/Mobile quick status bar */}
            <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-[#75C9FF]/20 bg-[#DDF3FF]/40 dark:bg-[#162644]/60 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono tabular-nums">{profile.coins.toLocaleString()}</span>
                <span aria-hidden="true">·</span>
                <span>Lv.{profile.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                  className="px-2 py-1 rounded bg-white dark:bg-[#101C32] border border-[#75C9FF]/30 font-semibold"
                >
                  {lang.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="p-1.5 rounded bg-white dark:bg-[#101C32] border border-[#75C9FF]/30"
                >
                  {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-[#FFD76A]" />}
                </button>
                <Link
                  to="/dashboard"
                  className="px-2.5 py-1 rounded bg-[#2377B9] text-white font-semibold"
                >
                  {t.nav.dashboard}
                </Link>
              </div>
            </div>

            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10">{children}</main>
            <Footer />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Home, Break, Collection, Battle, Profile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white/95 dark:bg-[#0d1629]/95 border-t border-[#75C9FF]/30 backdrop-blur-md grid grid-cols-5"
      >
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#2377B9] dark:text-[#75C9FF] font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[68px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
