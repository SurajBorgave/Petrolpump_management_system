import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter email and password.');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2744 0%, #1a3c5e 50%, #2b6cb0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, sans-serif',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 60, marginBottom: 8 }}>⛽</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>Petrol Pump</h1>
          <p style={{ color: '#90cdf4', fontSize: 14, margin: '6px 0 0' }}>Management System</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ color: '#1a3c5e', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Welcome Back</h2>
          <p style={{ color: '#718096', fontSize: 13, marginBottom: 24 }}>Sign in to your account to continue</p>

          {error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fc8181',
              color: '#c53030',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 18,
              fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', color: '#4a5568', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@petrolpump.com"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#2d3748',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2b6cb0')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#4a5568', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#2d3748',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2b6cb0')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: '#a0aec0',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? '#90cdf4' : 'linear-gradient(135deg, #1a3c5e, #2b6cb0)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                letterSpacing: 0.5,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: 24,
            padding: '14px',
            background: '#f7fafc',
            borderRadius: 8,
            fontSize: 12,
            color: '#718096',
            lineHeight: 1.8,
          }}>
            <strong style={{ color: '#4a5568' }}>Demo Credentials:</strong><br />
            <span style={{ color: '#2b6cb0' }}>👑 Admin:</span> admin@petrolpump.com / Admin@123<br />
            <span style={{ color: '#276749' }}>👤 Staff:</span> staff1@petrolpump.com / Staff@123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
