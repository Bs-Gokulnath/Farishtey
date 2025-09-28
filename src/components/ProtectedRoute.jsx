import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAnyRole, isAuthenticated } from '../utils/roleUtils';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/signin' 
}) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If specific roles are required, check if user has access
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User has access, render the protected component
  return children;
};

export default ProtectedRoute;
