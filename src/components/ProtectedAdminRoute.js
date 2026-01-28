// src/components/ProtectedAdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAdmin();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedAdminRoute;