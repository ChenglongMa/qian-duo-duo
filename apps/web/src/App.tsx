import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from './pages/Login.js';
import RegisterPage from "./pages/Register.js";
import DashboardPage from "./pages/Dashboard.js";
import SettingsPage from "./pages/Settings.js";
import { useAuth } from './hooks/useAuth.js';
import { useLedgers } from "./api/hooks.js";

const RequireAuth = () => {
  const token = useAuth((s) => s.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

const LedgerInitializer = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useLedgers();
  const ledgerId = useAuth((s) => s.ledgerId);
  const setLedgerId = useAuth((s) => s.setLedgerId);

  useEffect(() => {
    if (!ledgerId && data?.length) {
      setLedgerId(data[0].id);
    }
  }, [ledgerId, data, setLedgerId]);

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

const App = () => {
  const navigate = useNavigate();
  const token = useAuth((s) => s.token);
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route
          path="/"
          element={
            <LedgerInitializer>
              <DashboardPage />
            </LedgerInitializer>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
