import { useState, useEffect } from 'react';
import api from '../utils/api';

const FUEL_COLORS = { Petrol: '#2b6cb0', Diesel: '#276749', CNG: '#553c9a' };
const FUEL_BG = { Petrol: '#ebf8ff', Diesel: '#f0fff4', CNG: '#faf5ff' };

const FuelManagement = () => {
  const [fuels, setFuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [form, setForm] = useState({ name: 'Petrol', pricePerLiter: '', stock: '' });
  const [editForm, setEditForm] = useState({ pricePerLiter: '', stock: '' });
  const [stockAmount, setStockAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFuels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fuel');
      setFuels(res.data.data.fuels);
    } catch (err) {
      setError('Failed to load fuel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFuels(); }, []);

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3500);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/fuel', form);
      showMsg(`${form.name} added successfully!`);
      setShowAddModal(false);
      setForm({ name: 'Petrol', pricePerLiter: '', stock: '' });
      fetchFuels();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to add fuel.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/fuel/${editModal._id}`, editForm);
      showMsg('Fuel updated successfully!');
      setEditModal(null);
      fetchFuels();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update fuel.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/fuel/${stockModal._id}/addstock`, { amount: parseFloat(stockAmount) });
      showMsg(`Stock updated for ${stockModal.name}!`);
      setStockModal(null);
      setStockAmount('');
      fetchFuels();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to add stock.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const modalStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };

  const cardStyle = {
    background: '#fff', borderRadius: 12, padding: '28px 32px',
    width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#2d3748',
  };

  const btnPrimary = {
    background: 'linear-gradient(135deg, #1a3c5e, #2b6cb0)',
    color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px',
    cursor: 'pointer', fontSize: 14, fontWeight: 600,
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading fuel data...</div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#1a202c', fontSize: 22, fontWeight: 700, margin: 0 }}>⛽ Fuel Management</h1>
          <p style={{ color: '#718096', fontSize: 13, marginTop: 4 }}>Manage fuel types, prices and stock levels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          + Add Fuel Type
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

      {fuels.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 48 }}>⛽</div>
          <p style={{ color: '#718096', marginTop: 12 }}>No fuel types added yet. Click "Add Fuel Type" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {fuels.map((fuel) => {
            const pct = Math.min((fuel.stock / 10000) * 100, 100);
            const barColor = pct < 20 ? '#e53e3e' : pct < 50 ? '#ed8936' : '#38a169';
            return (
              <div key={fuel._id} style={{
                background: '#fff', borderRadius: 12, padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                borderTop: `4px solid ${FUEL_COLORS[fuel.name] || '#2b6cb0'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span style={{
                      background: FUEL_BG[fuel.name] || '#ebf8ff',
                      color: FUEL_COLORS[fuel.name] || '#2b6cb0',
                      padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                    }}>
                      {fuel.name}
                    </span>
                  </div>
                  <span style={{ color: '#38a169', fontSize: 11, fontWeight: 600, background: '#f0fff4', padding: '3px 8px', borderRadius: 10 }}>
                    ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: '#f7fafc', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ color: '#718096', fontSize: 11, fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>Price/Liter</p>
                    <p style={{ color: '#1a202c', fontSize: 20, fontWeight: 700, margin: '4px 0 0' }}>₹{fuel.pricePerLiter}</p>
                  </div>
                  <div style={{ background: '#f7fafc', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ color: '#718096', fontSize: 11, fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>Stock</p>
                    <p style={{ color: pct < 20 ? '#e53e3e' : '#1a202c', fontSize: 20, fontWeight: 700, margin: '4px 0 0' }}>
                      {fuel.stock.toFixed(1)} L
                    </p>
                  </div>
                </div>

                {/* Stock bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#718096' }}>Stock Level</span>
                    <span style={{ fontSize: 11, color: barColor, fontWeight: 600 }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${pct}%`, background: barColor, height: '100%', borderRadius: 4 }} />
                  </div>
                  {pct < 20 && (
                    <p style={{ color: '#e53e3e', fontSize: 11, marginTop: 4 }}>⚠️ Low stock alert!</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setEditModal(fuel); setEditForm({ pricePerLiter: fuel.pricePerLiter, stock: fuel.stock }); }}
                    style={{ flex: 1, padding: '8px', background: '#ebf8ff', color: '#2b6cb0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                  >
                    ✏️ Edit Price
                  </button>
                  <button
                    onClick={() => setStockModal(fuel)}
                    style={{ flex: 1, padding: '8px', background: '#f0fff4', color: '#276749', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                  >
                    + Add Stock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Fuel Modal */}
      {showAddModal && (
        <div style={modalStyle} onClick={() => setShowAddModal(false)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#1a202c' }}>Add Fuel Type</h3>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Fuel Type</label>
                <select
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>CNG</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Price per Liter (₹)</label>
                <input type="number" step="0.01" min="0" required value={form.pricePerLiter}
                  onChange={(e) => setForm({ ...form, pricePerLiter: e.target.value })}
                  placeholder="e.g. 96.72" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Initial Stock (Liters)</label>
                <input type="number" step="0.1" min="0" value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="e.g. 5000" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '10px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, flex: 1 }}>
                  {submitting ? 'Adding...' : 'Add Fuel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fuel Modal */}
      {editModal && (
        <div style={modalStyle} onClick={() => setEditModal(null)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#1a202c' }}>Edit {editModal.name}</h3>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Price per Liter (₹)</label>
                <input type="number" step="0.01" min="0" required value={editForm.pricePerLiter}
                  onChange={(e) => setEditForm({ ...editForm, pricePerLiter: e.target.value })}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Current Stock (Liters)</label>
                <input type="number" step="0.1" min="0" value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditModal(null)}
                  style={{ flex: 1, padding: '10px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, flex: 1 }}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {stockModal && (
        <div style={modalStyle} onClick={() => setStockModal(null)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', color: '#1a202c' }}>Add Stock: {stockModal.name}</h3>
            <p style={{ color: '#718096', fontSize: 13, marginBottom: 20 }}>
              Current stock: <strong>{stockModal.stock.toFixed(1)} L</strong>
            </p>
            <form onSubmit={handleAddStock}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Amount to Add (Liters)</label>
                <input type="number" step="0.1" min="1" required value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
                  placeholder="e.g. 1000" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStockModal(null)}
                  style={{ flex: 1, padding: '10px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '10px', background: '#276749', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  {submitting ? 'Adding...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelManagement;
