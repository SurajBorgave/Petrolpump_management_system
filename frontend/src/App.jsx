import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FuelManagement from './pages/FuelManagement';
import NewSale from './pages/NewSale';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';
import StaffManagement from './pages/StaffManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected — all logged-in users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Dashboard /></Layout>} path="/dashboard" />
            <Route element={<Layout><NewSale /></Layout>} path="/sales/new" />
            <Route element={<Layout><SalesHistory /></Layout>} path="/sales" />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<Layout><FuelManagement /></Layout>} path="/fuel" />
            <Route element={<Layout><Reports /></Layout>} path="/reports" />
            <Route element={<Layout><StaffManagement /></Layout>} path="/staff" />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
