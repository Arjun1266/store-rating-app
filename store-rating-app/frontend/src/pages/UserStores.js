import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import API from '../utils/api';

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [ratingModal, setRatingModal] = useState(null); // { store }
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/stores', { params: { ...search, sortBy, order } });
      setStores(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setOrder('ASC'); }
  };
  const sortIcon = (field) => sortBy === field ? (order === 'ASC' ? ' ↑' : ' ↓') : '';

  const openRatingModal = (store) => {
    setRatingModal(store);
    setSelectedRating(store.user_rating || 0);
    setRatingError('');
  };

  const handleSubmitRating = async () => {
    if (!selectedRating) { setRatingError('Please select a rating.'); return; }
    setRatingLoading(true);
    setRatingError('');
    try {
      await API.post(`/stores/${ratingModal.id}/ratings`, { rating: selectedRating });
      setRatingModal(null);
      fetchStores();
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
    } finally { setRatingLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">All Stores</h1>
          </div>

          <div className="filters">
            <input
              className="form-input"
              placeholder="Search by store name"
              value={search.name}
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
            />
            <input
              className="form-input"
              placeholder="Search by address"
              value={search.address}
              onChange={(e) => setSearch({ ...search, address: e.target.value })}
            />
          </div>

          {loading ? (
            <div className="spinner">Loading stores...</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>Store Name{sortIcon('name')}</th>
                    <th onClick={() => handleSort('address')}>Address{sortIcon('address')}</th>
                    <th onClick={() => handleSort('avg_rating')}>Overall Rating{sortIcon('avg_rating')}</th>
                    <th>Your Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stores found.</td></tr>
                  ) : stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                      <td>
                        {s.avg_rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <StarRating value={Math.round(s.avg_rating)} readOnly />
                            <span style={{ fontSize: 13 }}>{s.avg_rating}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Not rated yet</span>}
                      </td>
                      <td>
                        {s.user_rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <StarRating value={s.user_rating} readOnly />
                            <span style={{ fontSize: 13 }}>{s.user_rating}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Not rated</span>}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => openRatingModal(s)}>
                          {s.user_rating ? 'Modify Rating' : 'Rate Store'}
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

      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Rate "{ratingModal.name}"</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
              Select a rating between 1 and 5 stars.
            </p>
            {ratingError && <div className="alert alert-error">{ratingError}</div>}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ transform: 'scale(1.8)', transformOrigin: 'center' }}>
                <StarRating value={selectedRating} onChange={setSelectedRating} />
              </div>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 24, fontSize: 13 }}>
              {selectedRating > 0 ? `You selected: ${selectedRating} star${selectedRating > 1 ? 's' : ''}` : 'Click a star to select'}
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitRating} disabled={ratingLoading}>
                {ratingLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserStores;
