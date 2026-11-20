import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/AppShell';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { BreakPacksPage } from './pages/BreakPacksPage';
import { CardCreatorPage } from './pages/CardCreatorPage';
import { CollectionPage } from './pages/CollectionPage';
import { BattlePage } from './pages/BattlePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

function AutostartHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autostart') === '1' && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <GameProvider>
            <BrowserRouter>
              <AutostartHandler />
              <AppShell>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/break" element={<BreakPacksPage />} />
                  <Route path="/creator" element={<CardCreatorPage />} />
                  <Route path="/collection" element={<CollectionPage />} />
                  <Route path="/battle" element={<BattlePage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            </BrowserRouter>
          </GameProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
