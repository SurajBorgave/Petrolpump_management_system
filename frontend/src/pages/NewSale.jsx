import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const NewSale = () => {
  const navigate = useNavigate();
  const [fuels, setFuels] = useState([]);
  const [form, setForm] = useState({
    fuelType: '',
    quantity: '',
    customerName: '',
    vehicleNumber: '',
    paymentMethod: 'cash',
  });
  const [amountInput, setAmountInput] = useState('');
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get('/fuel').then((res) => setFuels(res.data.data.fuels)).catch(() => setError('Failed to load fuels.'));
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Auto-uppercase vehicle number
    if (name === 'vehicleNumber') {
      value = value.toUpperCase();
    }
    
    const updated = { ...form, [name]: value };
    setForm(updated);
    setError('');

    const activePayment = name === 'paymentMethod' ? value : form.paymentMethod;

    if (name === 'fuelType') {
      const fuel = fuels.find((f) => f._id === value);
      setSelectedFuel(fuel || null);
      if (fuel && updated.quantity) {
        let amt = fuel.pricePerLiter * parseFloat(updated.quantity);
        if (activePayment === 'cash') amt = Math.round(amt);
        setAmountInput(activePayment === 'cash' ? amt.toString() : amt.toFixed(2));
      } else {
        setAmountInput('');
      }
    }

    if (name === 'quantity') {
      if (selectedFuel && value && !isNaN(value)) {
        let amt = selectedFuel.pricePerLiter * parseFloat(value);
        if (activePayment === 'cash') amt = Math.round(amt);
        setAmountInput(activePayment === 'cash' ? amt.toString() : amt.toFixed(2));
      } else {
        setAmountInput('');
      }
    }

    if (name === 'paymentMethod') {
      if (selectedFuel && form.quantity && !isNaN(form.quantity)) {
        let amt = selectedFuel.pricePerLiter * parseFloat(form.quantity);
        if (value === 'cash') amt = Math.round(amt);
        setAmountInput(value === 'cash' ? amt.toString() : amt.toFixed(2));
      }
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmountInput(val);
    setError('');
    if (selectedFuel && val && !isNaN(val)) {
        setForm({ ...form, quantity: (parseFloat(val) / selectedFuel.pricePerLiter).toFixed(2) });
    } else {
        setForm({ ...form, quantity: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fuelType) { setError('Please select a fuel type.'); return; }
    if (!form.quantity || parseFloat(form.quantity) <= 0) { setError('Please enter a valid quantity or amount.'); return; }
    if (selectedFuel && parseFloat(form.quantity) > selectedFuel.stock) {
      setError(`Insufficient stock. Available: ${selectedFuel.stock.toFixed(1)} L`);
      return;
    }
    
    if (form.vehicleNumber) {
      const tempV = form.vehicleNumber.replace(/\s+/g, '');
      if (!/^[A-Z]{2}[A-Z0-9]{4,9}$/.test(tempV)) {
        setError('Invalid Vehicle Number. Use formats like MH12AB1234');
        return;
      }
    }

    setSubmitting(true);
    try {
      // The backend expects quantity. Amount is auto-calculated on backend as well.
      const res = await api.post('/sales', form);
      setSuccess(res.data.data.sale);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadBill = async (saleId) => {
    try {
      const res = await api.get(`/sales/${saleId}/bill`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill-${success.billNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download bill.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    color: '#2d3748', background: '#fff',
  };

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 };

  // Success screen
  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '40px 36px', maxWidth: 420, width: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ color: '#276749', fontSize: 20, fontWeight: 700 }}>Sale Recorded!</h2>
          <p style={{ color: '#718096', fontSize: 14, marginBottom: 24 }}>Transaction completed successfully</p>

          <div style={{ background: '#f7fafc', borderRadius: 10, padding: 20, textAlign: 'left', marginBottom: 24 }}>
            {[
              ['Bill Number', success.billNumber],
              ['Fuel', success.fuelName],
              ['Quantity', `${success.quantity} L`],
              ['Rate', `₹${success.pricePerLiter}/L`],
              ['Payment', success.paymentMethod?.toUpperCase()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', fontSize: 13 }}>
                <span style={{ color: '#718096' }}>{k}</span>
                <span style={{ color: '#2d3748', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: 16, fontWeight: 700 }}>
              <span style={{ color: '#1a3c5e' }}>Total Amount</span>
              <span style={{ color: '#1a3c5e' }}>₹{success.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleDownloadBill(success._id)}
              style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1a3c5e, #2b6cb0)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
            >
              📄 Download Bill
            </button>
            <button
              onClick={() => { setSuccess(null); setForm({ fuelType: '', quantity: '', customerName: '', vehicleNumber: '', paymentMethod: 'cash' }); setAmountInput(''); setSelectedFuel(null); }}
              style={{ flex: 1, padding: '12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
            >
              New Sale
            </button>
          </div>
          <button
            onClick={() => navigate('/sales')}
            style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', color: '#2b6cb0', border: '1.5px solid #2b6cb0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
          >
            View All Sales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#1a202c', fontSize: 22, fontWeight: 700, margin: 0 }}>🛒 New Sale Entry</h1>
        <p style={{ color: '#718096', fontSize: 13, marginTop: 4 }}>Record a new fuel sale transaction</p>
      </div>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Form */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Fuel Type */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Fuel Type *</label>
                  <select name="fuelType" value={form.fuelType} onChange={handleChange} required style={inputStyle}>
                    <option value="">-- Select Fuel --</option>
                    {fuels.map((f) => (
                      <option key={f._id} value={f._id} disabled={f.stock < 0.1}>
                        {f.name} — ₹{f.pricePerLiter}/L (Stock: {f.stock.toFixed(1)} L)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label style={labelStyle}>Quantity (Liters) *</label>
                  <input
                    type="number" name="quantity" min="0.01" step="0.01"
                    value={form.quantity} onChange={handleChange} disabled={!selectedFuel}
                    placeholder="e.g. 10.5" style={inputStyle} required
                  />
                  {selectedFuel && (
                    <p style={{ color: '#718096', fontSize: 11, marginTop: 4 }}>
                      Max available: {selectedFuel.stock.toFixed(1)} L
                    </p>
                  )}
                </div>

                {/* Amount Output */}
                <div>
                  <label style={labelStyle}>Total Amount (₹) *</label>
                  <input
                    type="number" name="amountInput" min="1" step={form.paymentMethod === 'cash' ? '1' : '0.01'}
                    value={amountInput} onChange={handleAmountChange} disabled={!selectedFuel}
                    placeholder="e.g. 1000" style={inputStyle} required
                  />
                   {selectedFuel && (
                    <p style={{ color: '#718096', fontSize: 11, marginTop: 4 }}>
                      Rate: ₹{selectedFuel.pricePerLiter}/L
                    </p>
                  )}
                </div>

                {/* Customer */}
                <div>
                  <label style={labelStyle}>Customer Name</label>
                  <input type="text" name="customerName" value={form.customerName} onChange={handleChange}
                    placeholder="Walk-in Customer" style={inputStyle} />
                </div>

                {/* Vehicle */}
                <div>
                  <label style={labelStyle}>Vehicle Number</label>
                  <input type="text" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange}
                    placeholder="e.g. MH12AB1234" style={inputStyle} />
                </div>

                {/* Payment */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Payment Method</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['cash', 'card', 'upi'].map((pm) => (
                      <label key={pm} style={{
                        flex: 1, padding: '10px', border: `2px solid ${form.paymentMethod === pm ? '#2b6cb0' : '#e2e8f0'}`,
                        borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 13, fontWeight: 600,
                        color: form.paymentMethod === pm ? '#2b6cb0' : '#718096',
                        background: form.paymentMethod === pm ? '#ebf8ff' : '#fff',
                        transition: 'all 0.15s',
                      }}>
                        <input type="radio" name="paymentMethod" value={pm} checked={form.paymentMethod === pm}
                          onChange={handleChange} style={{ display: 'none' }} />
                        {pm === 'cash' ? '💵' : pm === 'card' ? '💳' : '📱'} {pm.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary bar */}
              {selectedFuel && form.quantity && amountInput && (
                <div style={{
                  marginTop: 20, padding: '14px 18px', background: '#ebf8ff',
                  borderRadius: 8, border: '1px solid #90cdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontSize: 13, color: '#2b6cb0' }}>
                    <strong>{form.quantity} L</strong> × ₹{selectedFuel.pricePerLiter}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3c5e' }}>= ₹{parseFloat(amountInput).toFixed(2)}</div>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => navigate('/dashboard')}
                  style={{ padding: '12px 24px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1a3c5e, #2b6cb0)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                  {submitting ? 'Processing...' : '✅ Record Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
