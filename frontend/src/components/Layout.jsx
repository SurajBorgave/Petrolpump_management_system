import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['admin', 'staff'] },
  { label: 'Fuel Management', path: '/fuel', icon: '⛽', roles: ['admin'] },
  { label: 'New Sale', path: '/sales/new', icon: '🛒', roles: ['admin', 'staff'] },
  { label: 'Sales History', path: '/sales', icon: '📋', roles: ['admin', 'staff'] },
  { label: 'Reports', path: '/reports', icon: '📈', roles: ['admin'] },
  { label: 'Staff Management', path: '/staff', icon: '👥', roles: ['admin'] },
];

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: 'linear-gradient(180deg, #1a3c5e 0%, #0f2744 100%)',
        transition: 'width 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 12px rgba(0,0,0,0.18)',
        zIndex: 100,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>⛽</span>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>PETROL PUMP</div>
              <div style={{ color: '#90cdf4', fontSize: 10, letterSpacing: 1 }}>MANAGEMENT SYSTEM</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 18px',
                textDecoration: 'none',
                color: isActive ? '#fff' : '#a0c4e4',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #63b3ed' : '3px solid transparent',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 17, minWidth: 22, textAlign: 'center' }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {sidebarOpen && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
            <div style={{
              display: 'inline-block',
              background: isAdmin ? '#2b6cb0' : '#276749',
              color: '#fff',
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 10,
              marginTop: 3,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {user?.role}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#4a5568' }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#718096', fontSize: 13 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: '#e53e3e',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
