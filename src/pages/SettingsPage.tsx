import React from 'react';
import { Bell, Globe, Music, Sparkles, Sun, Volume2 } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';

export function SettingsPage() {
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useGame();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
          {t.settings.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 divide-y divide-slate-200 dark:divide-slate-700">
        {/* Background Music Toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-[#101C32] dark:text-white">
                {t.settings.musicLabel}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.settings.musicDesc}
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            aria-label={t.settings.musicLabel}
            checked={settings.musicEnabled}
            onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#2377B9] cursor-pointer"
          />
        </div>

        {/* Sound Effects Toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Volume2 className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-[#101C32] dark:text-white">
                {t.settings.sfxLabel}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.settings.sfxDesc}
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            aria-label={t.settings.sfxLabel}
            checked={settings.sfxEnabled}
            onChange={(e) => updateSettings({ sfxEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#2377B9] cursor-pointer"
          />
        </div>

        {/* Animation Settings */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-[#101C32] dark:text-white">
                {t.settings.animLabel}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.settings.animDesc}
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            aria-label={t.settings.animLabel}
            checked={settings.reducedAnimations}
            onChange={(e) => updateSettings({ reducedAnimations: e.target.checked })}
            className="w-5 h-5 accent-[#2377B9] cursor-pointer"
          />
        </div>

        {/* Notification Toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mt-0.5" />
            <div className="font-semibold text-sm text-[#101C32] dark:text-white">
              {t.settings.notifLabel}
            </div>
          </div>
          <input
            type="checkbox"
            aria-label={t.settings.notifLabel}
            checked={settings.notificationsEnabled}
            onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#2377B9] cursor-pointer"
          />
        </div>

        {/* Language */}
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
            <span className="font-semibold text-sm">{t.settings.langLabel}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLang('id')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                lang === 'id' ? 'bg-[#2377B9] text-white' : 'bg-[#DDF3FF] dark:bg-[#101C32]'
              }`}
            >
              Bahasa Indonesia
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                lang === 'en' ? 'bg-[#2377B9] text-white' : 'bg-[#DDF3FF] dark:bg-[#101C32]'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
            <span className="font-semibold text-sm">{t.settings.themeLabel}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                theme === 'light' ? 'bg-[#2377B9] text-white' : 'bg-[#DDF3FF] dark:bg-[#101C32]'
              }`}
            >
              {t.settings.lightMode}
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                theme === 'dark' ? 'bg-[#2377B9] text-white' : 'bg-[#DDF3FF] dark:bg-[#101C32]'
              }`}
            >
              {t.settings.darkMode}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
