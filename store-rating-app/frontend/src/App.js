import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminStores from './pages/AdminStores';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Shared protected */}
          <Route path="/update-password" element={
            <ProtectedRoute roles={['admin', 'normal_user', 'store_owner']}>
              <UpdatePassword />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUserDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute roles={['admin']}>
              <AdminStores />
            </ProtectedRoute>
          } />

          {/* Normal user routes */}
          <Route path="/stores" element={
            <ProtectedRoute roles={['normal_user', 'admin']}>
              <UserStores />
            </ProtectedRoute>
          } />

          {/* Store owner routes */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute roles={['store_owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="/unauthorized" element={
            <div style={{ textAlign: 'center', padding: 60 }}>
              <h2>403 — Unauthorized</h2>
              <p>You don't have access to this page.</p>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
