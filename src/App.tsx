import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from './auth/AuthContext';
import { OfflineProvider } from './offline/OfflineContext';
import { AppShell } from './layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnimalsPage } from './pages/AnimalsPage';
import { AnimalProfilePage } from './pages/AnimalProfilePage';
import { MilkingPage } from './pages/MilkingPage';
import { BreedingPage } from './pages/BreedingPage';
import { HealthPage } from './pages/HealthPage';
import { FeedPage } from './pages/FeedPage';
import { FinancePage } from './pages/FinancePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { TasksPage } from './pages/TasksPage';
import { CollectionPage } from './pages/CollectionPage';
import { ReportsPage } from './pages/ReportsPage';
import { AiReportsPage } from './pages/AiReportsPage';
import { AssistantPage } from './pages/AssistantPage';
import { AdminPage } from './pages/AdminPage';
import { RolesPermissionsPage } from './pages/RolesPermissionsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SettingsPage } from './pages/SettingsPage';

function Guard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <OfflineProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          element={
            <Guard>
              <AppShell />
            </Guard>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/animals" element={<AnimalsPage />} />
          <Route path="/animals/:id" element={<AnimalProfilePage />} />
          <Route path="/milking" element={<MilkingPage />} />
          <Route path="/breeding" element={<BreedingPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/ai-reports" element={<AiReportsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/roles" element={<RolesPermissionsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </OfflineProvider>
  );
}
