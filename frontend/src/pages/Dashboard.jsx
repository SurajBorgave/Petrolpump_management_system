import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    borderTop: `4px solid ${color}`,
    flex: 1,
    minWidth: 180,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#718096', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>
          {label}
        </p>
        <h3 style={{ color: '#1a202c', fontSize: 26, fontWeight: 700, margin: '6px 0 0' }}>{value}</h3>
        {sub && <p style={{ color: '#a0aec0', fontSize: 11, marginTop: 3 }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 32, opacity: 0.8 }}>{icon}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/sales/dashboard');
        setData(res.data.data);

        // Generate 7-day chart data from recent sales
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
        }

        if (isAdmin) {
          const reportRes = await api.get('/sales/reports?type=monthly');
          const breakdown = reportRes.data.data.report.breakdown || [];
          const now = new Date();
          const chartD = days.map((day) => {
            const dayNum = parseInt(day.split('-')[2]);
            const found = breakdown.find((b) => b._id === dayNum);
            return {
              day: day.slice(5),
              revenue: found ? parseFloat(found.totalRevenue.toFixed(0)) : 0,
              liters: found ? parseFloat(found.totalLiters.toFixed(0)) : 0,
            };
          });
          setChartData(chartD);
        }
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>⛽</div>
        <p style={{ color: '#718096', marginTop: 12 }}>Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8, padding: 20, color: '#c53030' }}>
      {error}
    </div>
  );

  const today = data?.today || {};
  const month = data?.thisMonth || {};
  const stocks = data?.fuelStocks || [];
  const recent = data?.recentSales || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#1a202c', fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#718096', fontSize: 13, marginTop: 4 }}>
          Overview of today's operations
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard
          label="Today's Revenue"
          value={`₹${(today.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon="💰"
          color="#2b6cb0"
          sub={`${today.count || 0} transactions`}
        />
        <StatCard
          label="Liters Sold Today"
          value={`${(today.totalLiters || 0).toFixed(1)} L`}
          icon="⛽"
          color="#38a169"
          sub="All fuel types"
        />
        {isAdmin && (
          <StatCard
            label="Monthly Revenue"
            value={`₹${(month.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            icon="📅"
            color="#805ad5"
            sub={`${month.count || 0} sales this month`}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 24 }}>
        {/* Fuel Stock */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: 0 }}>⛽ Fuel Stock Levels</h3>
            {isAdmin && (
              <button
                onClick={() => navigate('/fuel')}
                style={{ background: '#ebf4ff', color: '#2b6cb0', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
              >
                Manage →
              </button>
            )}
          </div>
          {stocks.length === 0 ? (
            <p style={{ color: '#a0aec0', textAlign: 'center', padding: '20px 0' }}>No fuel data available</p>
          ) : (
            stocks.map((fuel) => {
              const pct = Math.min((fuel.stock / 10000) * 100, 100);
              const barColor = pct < 20 ? '#e53e3e' : pct < 50 ? '#ed8936' : '#38a169';
              return (
                <div key={fuel._id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>{fuel.name}</span>
                    <span style={{ fontSize: 12, color: '#718096' }}>{fuel.stock.toFixed(1)} L · ₹{fuel.pricePerLiter}/L</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: barColor, height: '100%', borderRadius: 4, transition: 'width 0.6s' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chart (admin) */}
        {isAdmin && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: '0 0 16px' }}>📈 7-Day Revenue (₹)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#2b6cb0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px 0' }}>No data for chart</p>
            )}
          </div>
        )}
      </div>

      {/* Recent Sales */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#1a202c', fontWeight: 700, fontSize: 15, margin: 0 }}>🕐 Recent Sales</h3>
          <button
            onClick={() => navigate('/sales')}
            style={{ background: '#ebf4ff', color: '#2b6cb0', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            View All →
          </button>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '20px 0' }}>No recent sales</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Bill No', 'Customer', 'Fuel', 'Qty (L)', 'Amount', 'Date'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#718096', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '10px 12px', color: '#2b6cb0', fontWeight: 600 }}>{s.billNumber}</td>
                    <td style={{ padding: '10px 12px', color: '#2d3748' }}>{s.customerName}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: s.fuelName === 'Petrol' ? '#ebf8ff' : s.fuelName === 'Diesel' ? '#f0fff4' : '#faf5ff',
                        color: s.fuelName === 'Petrol' ? '#2b6cb0' : s.fuelName === 'Diesel' ? '#276749' : '#553c9a',
                        padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                      }}>
                        {s.fuelName}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#2d3748' }}>{s.quantity} L</td>
                    <td style={{ padding: '10px 12px', color: '#2d3748', fontWeight: 600 }}>₹{s.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', color: '#718096' }}>
                      {new Date(s.date).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
