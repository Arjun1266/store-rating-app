import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Admin Dashboard</h1>
          </div>

          {loading ? (
            <div className="spinner">Loading stats...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats?.totalUsers ?? 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats?.totalStores ?? 0}</div>
                <div className="stat-label">Total Stores</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats?.totalRatings ?? 0}</div>
                <div className="stat-label">Ratings Submitted</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
              <h3 style={{ marginBottom: 8 }}>👥 Manage Users</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>View, filter, and add users and admins.</p>
            </div>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/stores')}>
              <h3 style={{ marginBottom: 8 }}>🏪 Manage Stores</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>View, filter, and add new stores.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
