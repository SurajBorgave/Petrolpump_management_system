import { useState, useEffect } from 'react';
import api from '../utils/api';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setUsers(res.data.data.users);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); } else { setSuccess(msg); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3500);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', form);
      showMsg(`${form.role === 'admin' ? 'Admin' : 'Staff'} "${form.name}" registered successfully!`);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Registration failed.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setToggling(user._id);
    try {
      await api.put(`/auth/users/${user._id}/status`, { isActive: !user.isActive });
      showMsg(`${user.name} has been ${!user.isActive ? 'activated' : 'deactivated'}.`);
      fetchUsers();
    } catch {
      showMsg('Failed to update status.', true);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete "${user.name}" permanently? This cannot be undone.`)) return;
    setDeleting(user._id);
    try {
      await api.delete(`/auth/users/${user._id}`);
      showMsg(`"${user.name}" has been deleted.`);
      fetchUsers();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to delete user.', true);
    } finally {
      setDeleting(null);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#2d3748',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#1a202c', fontSize: 22, fontWeight: 700, margin: 0 }}>👥 Staff Management</h1>
          <p style={{ color: '#718096', fontSize: 13, marginTop: 4 }}>Manage admin and staff user accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: 'linear-gradient(135deg, #1a3c5e, #2b6cb0)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          + Add User
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fff4', border: '1px solid #68d391', color: '#276749', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          ✅ {success}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading users...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '13px 16px', textAlign: 'left', color: '#718096', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #f7fafc', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: user.role === 'admin' ? '#ebf8ff' : '#f0fff4',
                        color: user.role === 'admin' ? '#2b6cb0' : '#276749',
                        fontWeight: 700, fontSize: 14,
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#2d3748' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#718096' }}>{user.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: user.role === 'admin' ? '#ebf8ff' : '#f0fff4',
                      color: user.role === 'admin' ? '#2b6cb0' : '#276749',
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: user.isActive ? '#f0fff4' : '#fff5f5',
                      color: user.isActive ? '#276749' : '#c53030',
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#718096' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={toggling === user._id || deleting === user._id}
                        style={{
                          padding: '6px 14px',
                          background: user.isActive ? '#fff5f5' : '#f0fff4',
                          color: user.isActive ? '#c53030' : '#276749',
                          border: `1px solid ${user.isActive ? '#fc8181' : '#68d391'}`,
                          borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        }}
                      >
                        {toggling === user._id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deleting === user._id || toggling === user._id}
                        style={{
                          padding: '6px 12px',
                          background: '#fff5f5',
                          color: '#c53030',
                          border: '1px solid #fc8181',
                          borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        }}
                      >
                        {deleting === user._id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px', color: '#1a202c', fontSize: 17 }}>Register New User</h3>
            <form onSubmit={handleRegister}>
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'e.g. Ravi Kumar' },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'e.g. ravi@petrolpump.com' },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 characters' },
              ].map((field) => (
                <div key={field.name} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>{field.label}</label>
                  <input
                    type={field.type} name={field.name} required placeholder={field.placeholder}
                    value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    style={inputStyle}
                    minLength={field.name === 'password' ? 6 : undefined}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Role</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['staff', 'admin'].map((role) => (
                    <label key={role} style={{
                      flex: 1, padding: '10px', border: `2px solid ${form.role === role ? (role === 'admin' ? '#2b6cb0' : '#276749') : '#e2e8f0'}`,
                      borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 13, fontWeight: 600,
                      color: form.role === role ? (role === 'admin' ? '#2b6cb0' : '#276749') : '#718096',
                      background: form.role === role ? (role === 'admin' ? '#ebf8ff' : '#f0fff4') : '#fff',
                    }}>
                      <input type="radio" name="role" value={role} checked={form.role === role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ display: 'none' }} />
                      {role === 'admin' ? '👑 Admin' : '👤 Staff'}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '10px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #1a3c5e, #2b6cb0)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  {submitting ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
