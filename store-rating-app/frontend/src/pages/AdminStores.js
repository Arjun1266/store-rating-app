import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import API from '../utils/api';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [owners, setOwners] = useState([]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/stores', { params: { ...filters, sortBy, order } });
      setStores(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    // Fetch store owners for the dropdown
    API.get('/admin/users', { params: { role: 'store_owner' } })
      .then((res) => setOwners(res.data))
      .catch(console.error);
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setOrder('ASC'); }
  };
  const sortIcon = (field) => sortBy === field ? (order === 'ASC' ? ' ↑' : ' ↓') : '';

  const validateForm = () => {
    const errs = {};
    if (form.name.length < 20 || form.name.length > 60) errs.name = 'Store name: 20-60 characters.';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required.';
    if (form.address.length === 0 || form.address.length > 400) errs.address = 'Address required (max 400 chars).';
    return errs;
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({}); setSubmitError('');
    setSubmitLoading(true);
    try {
      await API.post('/admin/stores', form);
      setShowModal(false);
      setForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create store.');
    } finally { setSubmitLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Stores</h1>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Store</button>
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
          </div>

          {loading ? (
            <div className="spinner">Loading stores...</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>Name{sortIcon('name')}</th>
                    <th onClick={() => handleSort('email')}>Email{sortIcon('email')}</th>
                    <th onClick={() => handleSort('address')}>Address{sortIcon('address')}</th>
                    <th onClick={() => handleSort('avg_rating')}>Rating{sortIcon('avg_rating')}</th>
                    <th>Total Ratings</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stores found.</td></tr>
                  ) : stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                      <td>
                        {s.avg_rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <StarRating value={Math.round(s.avg_rating)} readOnly />
                            <span style={{ fontSize: 13 }}>{s.avg_rating}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)' }}>No ratings</span>}
                      </td>
                      <td>{s.total_ratings}</td>
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
            <h2 className="modal-title">Add New Store</h2>
            {submitError && <div className="alert alert-error">{submitError}</div>}
            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Min 20 characters"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {formErrors.email && <div className="form-error">{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
                {formErrors.address && <div className="form-error">{formErrors.address}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Assign Owner (optional)</label>
                <select
                  className="form-input"
                  value={form.owner_id}
                  onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                >
                  <option value="">— No owner —</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminStores;
