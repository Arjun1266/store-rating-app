import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import API from '../utils/api';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/admin/users/${id}`)
      .then((res) => setUser(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const roleLabel = { admin: 'Admin', store_owner: 'Store Owner', normal_user: 'Normal User' };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="page-header">
            <h1 className="page-title">User Detail</h1>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>← Back</button>
          </div>

          {loading ? (
            <div className="spinner">Loading...</div>
          ) : !user ? (
            <div className="alert alert-error">User not found.</div>
          ) : (
            <div className="card">
              <div style={{ display: 'grid', gap: 18 }}>
                {[
                  { label: 'Name', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Address', value: user.address },
                  { label: 'Role', value: <span className={`badge badge-${user.role}`}>{roleLabel[user.role]}</span> },
                ].map(({ label, value }) => (
                  <div key={label} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                    <div className="form-label" style={{ marginBottom: 4 }}>{label}</div>
                    <div>{value}</div>
                  </div>
                ))}
                {user.role === 'store_owner' && (
                  <div>
                    <div className="form-label" style={{ marginBottom: 6 }}>Store Rating</div>
                    {user.avg_rating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StarRating value={Math.round(user.avg_rating)} readOnly />
                        <span style={{ fontSize: 20, fontWeight: 700 }}>{user.avg_rating}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/ 5.00</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No ratings yet</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUserDetail;
