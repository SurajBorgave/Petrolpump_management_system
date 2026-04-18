import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import api from '../utils/api';

const COLORS = ['#2b6cb0', '#38a169', '#805ad5', '#d69e2e'];

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const handleTabChange = (key) => {
    setReport(null);
    setReportType(key);
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await api.get(`/sales/reports?type=${reportType}&month=${month}&year=${year}`);
      setReport(res.data.data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [reportType, month, year]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const YEARS = [2023, 2024, 2025, 2026];

  const tabStyle = (active) => ({
    padding: '9px 20px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    background: active ? '#1a3c5e' : '#edf2f7',
    color: active ? '#fff' : '#4a5568',
    transition: 'all 0.15s',
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#1a202c', fontSize: 22, fontWeight: 700, margin: 0 }}>📈 Reports & Analytics</h1>
        <p style={{ color: '#718096', fontSize: 13, marginTop: 4 }}>Comprehensive sales reports and business insights</p>
      </div>

      {/* Controls */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'daily', label: '📅 Today' },
            { key: 'monthly', label: '📆 Monthly' },
            { key: 'fuel', label: '⛽ By Fuel' },
            { key: 'staff', label: '👥 By Staff' },
          ].map((t) => (
            <button key={t.key} onClick={() => handleTabChange(t.key)} style={tabStyle(reportType === t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {reportType !== 'daily' && (
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }}>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>Loading report...</div>
      ) : !report ? null : (
        <>
          {/* Daily Report */}
          {reportType === 'daily' && (
            <div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { label: "Today's Sales", value: report.totalSales, icon: '🛒', color: '#2b6cb0' },
                  { label: 'Revenue', value: `₹${(report.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: '💰', color: '#38a169' },
                  { label: 'Liters Sold', value: `${(report.totalLiters || 0).toFixed(1)} L`, icon: '⛽', color: '#805ad5' },
                ].map((s) => (
                  <div key={s.label} style={{ flex: 1, minWidth: 200, background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: 28 }}>{s.icon}</div>
                    <p style={{ color: '#718096', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', margin: '8px 0 4px' }}>{s.label}</p>
                    <p style={{ color: '#1a202c', fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: '0 0 16px' }}>Today's Transactions</h3>
                {(report.sales || []).length === 0 ? (
                  <p style={{ color: '#a0aec0', textAlign: 'center', padding: '30px 0' }}>No sales today yet.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        {['Bill No', 'Customer', 'Fuel', 'Qty', 'Amount', 'Time'].map((h) => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#718096', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.sales.map((s) => (
                        <tr key={s._id} style={{ borderBottom: '1px solid #f7fafc' }}>
                          <td style={{ padding: '10px 12px', color: '#2b6cb0', fontWeight: 600 }}>{s.billNumber}</td>
                          <td style={{ padding: '10px 12px' }}>{s.customerName}</td>
                          <td style={{ padding: '10px 12px' }}>{s.fuelName}</td>
                          <td style={{ padding: '10px 12px' }}>{s.quantity} L</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700 }}>₹{s.totalAmount.toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', color: '#718096' }}>
                            {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Monthly Report */}
          {reportType === 'monthly' && (
            <div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { label: 'Total Sales', value: report.totalSales, icon: '🛒', color: '#2b6cb0' },
                  { label: 'Monthly Revenue', value: `₹${(report.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: '💰', color: '#38a169' },
                  { label: 'Liters Sold', value: `${(report.totalLiters || 0).toFixed(1)} L`, icon: '⛽', color: '#805ad5' },
                ].map((s) => (
                  <div key={s.label} style={{ flex: 1, minWidth: 200, background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: 28 }}>{s.icon}</div>
                    <p style={{ color: '#718096', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', margin: '8px 0 4px' }}>{s.label}</p>
                    <p style={{ color: '#1a202c', fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: '0 0 20px' }}>
                  Daily Revenue — {MONTHS[month - 1]} {year}
                </h3>
                {(report.breakdown || []).length === 0 ? (
                  <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px 0' }}>No data for this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={(report.breakdown || []).map((d) => ({ day: `Day ${d._id}`, revenue: parseFloat(d.totalRevenue.toFixed(0)), liters: parseFloat(d.totalLiters.toFixed(1)) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${v}` : `${v} L`, n === 'revenue' ? 'Revenue' : 'Liters']} />
                      <Bar dataKey="revenue" name="revenue" fill="#2b6cb0" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Fuel-wise Report */}
          {reportType === 'fuel' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: '0 0 20px' }}>Revenue by Fuel Type</h3>
                {(report.breakdown || []).length === 0 ? (
                  <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px 0' }}>No data for this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={report.breakdown} dataKey="totalRevenue" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                        {report.breakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, 'Revenue']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: '0 0 20px' }}>Fuel-wise Breakdown</h3>
                {(report.breakdown || []).length === 0 ? (
                  <p style={{ color: '#a0aec0', textAlign: 'center', padding: '60px 0' }}>No data available.</p>
                ) : (
                  <div>
                    {report.breakdown.map((fuel, i) => (
                      <div key={fuel._id} style={{ marginBottom: 18, padding: '16px', background: '#f7fafc', borderRadius: 10, borderLeft: `4px solid ${COLORS[i % COLORS.length]}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: '#1a202c' }}>{fuel._id}</span>
                          <span style={{ color: '#38a169', fontWeight: 700 }}>₹{fuel.totalRevenue.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                          <div><span style={{ color: '#718096' }}>Sales: </span><strong>{fuel.count}</strong></div>
                          <div><span style={{ color: '#718096' }}>Liters: </span><strong>{fuel.totalLiters.toFixed(1)} L</strong></div>
                          <div><span style={{ color: '#718096' }}>Avg Rate: </span><strong>₹{fuel.avgPrice.toFixed(2)}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Staff-wise Report */}
          {reportType === 'staff' && (
            <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: '0 0 20px' }}>
                Staff Performance — {MONTHS[month - 1]} {year}
              </h3>
              {(report.breakdown || []).length === 0 ? (
                <p style={{ color: '#a0aec0', textAlign: 'center', padding: '60px 0' }}>No data for this period.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={report.breakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="staffName" type="category" tick={{ fontSize: 12 }} width={120} />
                      <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                      <Bar dataKey="totalRevenue" fill="#2b6cb0" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                        {['#', 'Staff Name', 'Total Sales', 'Liters Sold', 'Revenue'].map((h) => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#718096', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.breakdown.map((s, i) => (
                        <tr key={s.staffName} style={{ borderBottom: '1px solid #f7fafc' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: COLORS[i % COLORS.length], color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                              {i + 1}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#2d3748' }}>{s.staffName}</td>
                          <td style={{ padding: '12px 14px', color: '#2d3748' }}>{s.count}</td>
                          <td style={{ padding: '12px 14px', color: '#2d3748' }}>{s.totalLiters.toFixed(1)} L</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#38a169' }}>₹{s.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
