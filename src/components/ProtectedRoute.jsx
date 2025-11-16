// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// CHANGED: Renamed 'adminOnly' to 'managerOnly'
const ProtectedRoute = ({ children, managerOnly = false }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // User not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CHANGED: Logic now checks for 'manager' role
  if (managerOnly && user.role !== 'manager') {
    // User is not a manager but trying to access manager-only route
    return <Navigate to="/" replace />; // Redirect to dashboard
  }

  return children;
};

export default ProtectedRoute;