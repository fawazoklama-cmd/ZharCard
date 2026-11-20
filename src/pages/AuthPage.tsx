import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';

export function AuthPage() {
  const { t } = useI18n();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useGame();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim() || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    if (mode !== 'reset' && password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (mode === 'register' && username.trim().length < 2) {
      setError('Nama pengguna minimal 2 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
        navigate('/dashboard');
      } else if (mode === 'register') {
        await registerWithEmail(email.trim(), password, username.trim());
        navigate('/dashboard');
      } else {
        await resetPassword(email.trim());
        setInfo(t.auth.resetSent);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.common.errorGeneric;
      if (msg.includes('auth/operation-not-allowed')) {
        setError(
          'Email/Password login belum diaktifkan di Firebase Console. Gunakan Google Sign-In atau aktifkan Email/Password provider pada Firebase Console.'
        );
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-12">
      <div className="rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/40 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DDF3FF] dark:bg-[#101C32] text-[#2377B9] dark:text-[#75C9FF] mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#101C32] dark:text-white">
            {t.auth.welcomeTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.auth.welcomeSub}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#DDF3FF]/70 dark:bg-[#101C32]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-[#2377B9] text-white'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.auth.loginTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-[#2377B9] text-white'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.auth.registerTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setError('');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'reset'
                ? 'bg-[#2377B9] text-white'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.auth.resetTab}
          </button>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          disabled={submitting}
          onClick={handleGoogle}
          className="w-full py-3 px-4 rounded-xl border border-[#75C9FF]/50 bg-[#F4FBFF] dark:bg-[#101C32] hover:bg-[#DDF3FF] dark:hover:bg-slate-800 text-sm font-semibold text-[#101C32] dark:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {t.auth.googleBtn}
        </button>

        <div className="relative flex items-center justify-center text-xs text-slate-400">
          <span className="bg-white dark:bg-[#162644] px-3 z-10">{t.auth.orDivider}</span>
          <span className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-username" className="block text-xs font-semibold mb-1.5">
                {t.auth.usernameLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SkyWalker"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm focus:outline-none focus:ring-2 focus:ring-[#2377B9]"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold mb-1.5">
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@zharworld.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm focus:outline-none focus:ring-2 focus:ring-[#2377B9]"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold mb-1.5">
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm focus:outline-none focus:ring-2 focus:ring-[#2377B9]"
                />
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-xs text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}

          {info && (
            <div role="status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-700 dark:text-emerald-200">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {mode === 'login'
              ? t.auth.submitLogin
              : mode === 'register'
              ? t.auth.submitRegister
              : t.auth.submitReset}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2377B9] dark:text-[#75C9FF] hover:underline"
          >
            {t.auth.guestPractice}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
