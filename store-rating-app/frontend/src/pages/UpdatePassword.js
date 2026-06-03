import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';

const UpdatePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    const pwdRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!pwdRegex.test(form.newPassword)) {
      setError('Password must be 8-16 characters, include at least one uppercase letter and one special character.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(res.data.message);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="page-header">
            <h1 className="page-title">Change Password</h1>
          </div>
          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
