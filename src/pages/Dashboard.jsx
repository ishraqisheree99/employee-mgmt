// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Show different dashboard based on role
  if (!user) {
    return <div className="p-4">Loading...</div>; // ProtectedRoute should handle redirect, but just in case
  }
  
  if (user.role === 'employee') {
    return <EmployeeDashboard />;
  }
  
  return <ManagerDashboard />;
}