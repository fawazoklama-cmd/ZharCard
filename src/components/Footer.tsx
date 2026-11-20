import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[#75C9FF]/30 bg-white/90 dark:bg-[#0d1629] text-[#101C32] dark:text-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div className="space-y-2">
            <div className="font-display font-extrabold text-xl tracking-tight text-[#101C32] dark:text-white">
              {t.brand.name}
            </div>
            <p className="text-sm font-medium text-[#2377B9] dark:text-[#75C9FF]">
              {t.brand.tagline}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.footer.rights}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link to="/discover" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.discover}
            </Link>
            <Link to="/break" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.breakPacks}
            </Link>
            <Link to="/creator" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.creator}
            </Link>
            <Link to="/collection" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.collection}
            </Link>
            <Link to="/battle" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.battle}
            </Link>
            <Link to="/marketplace" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.marketplace}
            </Link>
            <Link to="/leaderboard" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.leaderboard}
            </Link>
            <Link to="/settings" className="hover:text-[#2377B9] dark:hover:text-[#75C9FF] transition-colors">
              {t.nav.settings}
            </Link>
          </div>

          {/* Credit Section */}
          <div className="rounded-2xl bg-[#DDF3FF]/60 dark:bg-[#162644] border border-[#75C9FF]/35 p-5 space-y-3">
            <div className="text-xs font-bold tracking-wider text-[#2377B9] dark:text-[#75C9FF]">
              {t.footer.creditTitle}
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {t.footer.creatorRole}
              </div>
              <div className="font-display font-bold text-base text-[#101C32] dark:text-white">
                {t.footer.creatorHandle}
              </div>
            </div>
            <a
              href="https://www.instagram.com/wazzz.dotcom/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white text-xs font-semibold transition-colors"
            >
              <Instagram className="w-4 h-4" />
              {t.footer.instagramBtn}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
