import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'store_owner') return '/owner/dashboard';
    return '/stores';
  };

  const roleLabel = {
    admin: 'Admin',
    store_owner: 'Store Owner',
    normal_user: 'User',
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(getDashboardLink())} style={{ cursor: 'pointer' }}>
        Store<span>Rate</span>
      </div>
      {user && (
        <div className="navbar-links">
          {user.role === 'normal_user' && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/stores')}>
              Stores
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/update-password')}>
            Change Password
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: 13, padding: '0 4px' }}>
            {user.name?.split(' ')[0]} · <span className={`badge badge-${user.role}`}>{roleLabel[user.role]}</span>
          </span>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
