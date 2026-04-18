import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FUEL_COLORS = { Petrol: '#2b6cb0', Diesel: '#276749', CNG: '#553c9a' };
const FUEL_BG = { Petrol: '#ebf8ff', Diesel: '#f0fff4', CNG: '#faf5ff' };
const PM_ICONS = { cash: '💵', card: '💳', upi: '📱' };

const SalesHistory = () => {
  const { isAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ date: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const LIMIT = 15;

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filters.date) params.append('date', filters.date);
      else {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
      }
      const res = await api.get(`/sales?${params.toString()}`);
      setSales(res.data.data.sales);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setError('Failed to load sales.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleDownloadBill = async (sale) => {
    setDownloading(sale._id);
    try {
      const res = await api.get(`/sales/${sale._id}/bill`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill-${sale.billNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download bill.');
    } finally {
      setDownloading(null);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ date: '', startDate: '', endDate: '' });
    setPage(1);
  };

  const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#1a202c', fontSize: 22, fontWeight: 700, margin: 0 }}>📋 Sales History</h1>
        <p style={{ color: '#718096', fontSize: 13, marginTop: 4 }}>View and manage all fuel sales transactions</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 4 }}>SPECIFIC DATE</label>
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange}
            style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#2d3748', outline: 'none' }} />
        </div>
        <div style={{ color: '#a0aec0', alignSelf: 'center', fontSize: 12, fontWeight: 600 }}>OR</div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 4 }}>FROM DATE</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
            style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#2d3748', outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 4 }}>TO DATE</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
            style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#2d3748', outline: 'none' }} />
        </div>
        <button onClick={clearFilters}
          style={{ padding: '9px 16px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Clear
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#718096', fontSize: 11, margin: 0 }}>SHOWING</p>
            <p style={{ color: '#2d3748', fontSize: 16, fontWeight: 700, margin: 0 }}>{total} sales</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#718096', fontSize: 11, margin: 0 }}>TOTAL REVENUE</p>
            <p style={{ color: '#1a3c5e', fontSize: 16, fontWeight: 700, margin: 0 }}>₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>Loading sales...</div>
        ) : sales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p style={{ color: '#718096', marginTop: 12 }}>No sales found for the selected filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Bill No', 'Date & Time', 'Customer', 'Vehicle', 'Fuel', 'Qty (L)', 'Rate', 'Amount', 'Payment', isAdmin && 'Staff', 'Bill'].filter(Boolean).map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#718096', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, idx) => (
                  <tr key={sale._id} style={{ borderBottom: '1px solid #f7fafc', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 14px', color: '#2b6cb0', fontWeight: 600 }}>{sale.billNumber}</td>
                    <td style={{ padding: '12px 14px', color: '#718096', whiteSpace: 'nowrap' }}>
                      <div>{new Date(sale.date).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize: 11 }}>{new Date(sale.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#2d3748' }}>{sale.customerName}</td>
                    <td style={{ padding: '12px 14px', color: '#718096' }}>{sale.vehicleNumber || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: FUEL_BG[sale.fuelName] || '#f7fafc',
                        color: FUEL_COLORS[sale.fuelName] || '#2b6cb0',
                        padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      }}>{sale.fuelName}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#2d3748', fontWeight: 600 }}>{sale.quantity} L</td>
                    <td style={{ padding: '12px 14px', color: '#718096' }}>₹{sale.pricePerLiter}</td>
                    <td style={{ padding: '12px 14px', color: '#1a3c5e', fontWeight: 700 }}>₹{sale.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 14 }}>{PM_ICONS[sale.paymentMethod] || '💵'}</span>
                      <span style={{ fontSize: 11, color: '#718096', marginLeft: 4 }}>{sale.paymentMethod?.toUpperCase()}</span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '12px 14px', color: '#2d3748' }}>
                        {sale.staffId?.name || sale.staffName || '—'}
                      </td>
                    )}
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={() => handleDownloadBill(sale)}
                        disabled={downloading === sale._id}
                        style={{
                          background: '#ebf8ff', color: '#2b6cb0', border: 'none',
                          borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                        }}
                      >
                        {downloading === sale._id ? '...' : '📄 PDF'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 6, cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff', color: '#4a5568' }}>
              ←
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{
                  padding: '6px 12px', border: '1px solid',
                  borderColor: p === page ? '#2b6cb0' : '#e2e8f0',
                  borderRadius: 6, cursor: 'pointer',
                  background: p === page ? '#2b6cb0' : '#fff',
                  color: p === page ? '#fff' : '#4a5568',
                  fontWeight: p === page ? 700 : 400,
                }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(page + 1)} disabled={page === pages}
              style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 6, cursor: page === pages ? 'not-allowed' : 'pointer', background: '#fff', color: '#4a5568' }}>
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
