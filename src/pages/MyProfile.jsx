// src/pages/MyProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_EMPLOYEES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaDollarSign, FaCalendarAlt, FaUser, FaStar, FaIdCard } from 'react-icons/fa';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees] = useLocalStorage('employees', MOCK_EMPLOYEES);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Find the full employee profile using the username (which is the email)
    const found = employees.find((emp) => emp.email === user.username);
    if (found) {
      setEmployee(found);
    } else {
      // Handle case where user might be 'manager' but not in employee list
      // Or just show a basic profile
      console.warn("Logged in user not found in employee list. Displaying partial data.");
      // Create a fallback profile
      setEmployee({
        name: user.username,
        email: user.username,
        position: user.role,
        status: 'active',
        skills: [user.role],
      });
    }
  }, [user, employees, navigate]);

  if (!employee) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const InfoCard = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Icon className="text-blue-600" size={18} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      {/* Header Card */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white shadow-lg">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600">
            {employee.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{employee.name}</h2>
            <p className="mt-2 text-xl text-blue-100">{employee.position}</p>
            {employee.department && (
              <p className="mt-1 text-sm text-blue-200">{employee.department} Department</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4">
              {employee.employeeId && (
                <div className="flex items-center gap-2">
                  <FaIdCard size={14} />
                  <span className="text-sm">{employee.employeeId}</span>
                </div>
              )}
              {employee.performance && (
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-300" size={14} />
                  <span className="text-sm">{employee.performance.toFixed(1)} / 5.0</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  employee.status === 'active'
                    ? 'bg-green-500 text-white'
                    : employee.status === 'on-leave'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {employee.status || 'active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Contact Information</h3>
          <div className="space-y-4">
            <InfoCard icon={FaEnvelope} label="Email" value={employee.email} />
            <InfoCard icon={FaPhone} label="Phone" value={employee.phone} />
            <InfoCard icon={FaMapMarkerAlt} label="Address" value={employee.address} />
          </div>
        </div>

        {/* Employment Details */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Employment Details</h3>
          <div className="space-y-4">
            <InfoCard icon={FaBuilding} label="Department" value={employee.department} />
            <InfoCard icon={FaDollarSign} label="Salary" value={employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'} />
            <InfoCard 
              icon={FaCalendarAlt} 
              label="Hire Date" 
              value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'} 
            />
            {employee.manager && (
              <InfoCard icon={FaUser} label="Manager" value={employee.manager} />
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {employee.skills && employee.skills.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {employee.skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}