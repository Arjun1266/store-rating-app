import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import API from '../utils/api';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rated_at');
  const [order, setOrder] = useState('DESC');

  useEffect(() => {
    API.get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setOrder('ASC'); }
  };
  const sortIcon = (field) => sortBy === field ? (order === 'ASC' ? ' ↑' : ' ↓') : '';

  const sortedRaters = data?.raters ? [...data.raters].sort((a, b) => {
    let valA = a[sortBy], valB = b[sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return order === 'ASC' ? -1 : 1;
    if (valA > valB) return order === 'ASC' ? 1 : -1;
    return 0;
  }) : [];

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">My Store Dashboard</h1>
          </div>

          {loading ? (
            <div className="spinner">Loading dashboard...</div>
          ) : !data ? (
            <div className="alert alert-error">No store assigned to your account. Please contact the admin.</div>
          ) : (
            <>
              <div className="stats-grid" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                  <div className="stat-number" style={{ fontSize: 28 }}>{data.store.name}</div>
                  <div className="stat-label">Store Name</div>
                </div>
                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span className="stat-number">{data.store.avg_rating ?? '—'}</span>
                    {data.store.avg_rating && <StarRating value={Math.round(data.store.avg_rating)} readOnly />}
                  </div>
                  <div className="stat-label">Average Rating</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{data.store.total_ratings}</div>
                  <div className="stat-label">Total Ratings</div>
                </div>
              </div>

              <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700 }}>Users Who Rated Your Store</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')}>Name{sortIcon('name')}</th>
                      <th onClick={() => handleSort('email')}>Email{sortIcon('email')}</th>
                      <th onClick={() => handleSort('rating')}>Rating{sortIcon('rating')}</th>
                      <th onClick={() => handleSort('rated_at')}>Date Rated{sortIcon('rated_at')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRaters.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No ratings yet.</td></tr>
                    ) : sortedRaters.map((r) => (
                      <tr key={r.id}>
                        <td>{r.name}</td>
                        <td>{r.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <StarRating value={r.rating} readOnly />
                            <span style={{ fontSize: 13 }}>{r.rating}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          {new Date(r.rated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OwnerDashboard;
