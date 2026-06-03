import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import API from '../utils/api';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'normal_user', label: 'Normal User' },
  { value: 'store_owner', label: 'Store Owner' },
];

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'normal_user' });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, order };
      const res = await API.get('/admin/users', { params });
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters, sortBy, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setOrder('ASC'); }
  };

  const sortIcon = (field) => sortBy === field ? (order === 'ASC' ? ' ↑' : ' ↓') : '';

  const validateForm = () => {
    const errs = {};
    if (form.name.length < 20 || form.name.length > 60) errs.name = 'Name: 20-60 characters.';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required.';
    if (form.address.length === 0 || form.address.length > 400) errs.address = 'Address required (max 400 chars).';
    const pwdRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!pwdRegex.test(form.password)) errs.password = '8-16 chars, one uppercase, one special char.';
    return errs;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({}); setSubmitError('');
    setSubmitLoading(true);
    try {
      await API.post('/admin/users', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', address: '', role: 'normal_user' });
      fetchUsers();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create user.');
    } finally { setSubmitLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Users</h1>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
          </div>

          <div className="filters">
            {['name', 'email', 'address'].map((field) => (
              <input
                key={field}
                className="form-input"
                placeholder={`Filter by ${field}`}
                value={filters[field]}
                onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
              />
            ))}
            <select
              className="form-input"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="spinner">Loading users...</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>Name{sortIcon('name')}</th>
                    <th onClick={() => handleSort('email')}>Email{sortIcon('email')}</th>
                    <th onClick={() => handleSort('address')}>Address{sortIcon('address')}</th>
                    <th onClick={() => handleSort('role')}>Role{sortIcon('role')}</th>
                    <th>Rating</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                      <td>
                        {u.role === 'store_owner' && u.avg_rating
                          ? <><StarRating value={Math.round(u.avg_rating)} readOnly /><span style={{ marginLeft: 6, fontSize: 13 }}>{u.avg_rating}</span></>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/users/${u.id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add New User</h2>
            {submitError && <div className="alert alert-error">{submitError}</div>}
            <form onSubmit={handleAddUser}>
              {[
                { field: 'name', label: 'Full Name', type: 'text', placeholder: 'Min 20 characters' },
                { field: 'email', label: 'Email', type: 'email', placeholder: 'user@example.com' },
                { field: 'password', label: 'Password', type: 'password', placeholder: '8-16 chars, 1 uppercase, 1 special' },
              ].map(({ field, label, type, placeholder }) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                  {formErrors[field] && <div className="form-error">{formErrors[field]}</div>}
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Full address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
                {formErrors.address && <div className="form-error">{formErrors.address}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="normal_user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
