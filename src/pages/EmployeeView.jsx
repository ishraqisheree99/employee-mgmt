// src/pages/EmployeeView.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_EMPLOYEES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaDollarSign, FaCalendarAlt, FaUser, FaStar, FaIdCard } from 'react-icons/fa';

export default function EmployeeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees] = useLocalStorage('employees', MOCK_EMPLOYEES);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const found = employees.find((emp) => emp.id === id);
    if (found) {
      setEmployee(found);
    } else {
      navigate('/employees');
    }
  }, [id, employees, navigate]);

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
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/employees"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Employees
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
        </div>
        {user.role === 'manager' && (
          <Link
            to={`/employees/${employee.id}`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FaEdit size={14} />
            Edit Employee
          </Link>
        )}
      </div>

      {/* Header Card */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white shadow-lg">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600">
            {employee.name?.charAt(0) || '?'}
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
            <InfoCard
              icon={FaEnvelope}
              label="Email"
              value={employee.email}
            />
            <InfoCard
              icon={FaPhone}
              label="Phone"
              value={employee.phone}
            />
            <InfoCard
              icon={FaMapMarkerAlt}
              label="Address"
              value={employee.address}
            />
          </div>
        </div>

        {/* Employment Details */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Employment Details</h3>
          <div className="space-y-4">
            <InfoCard
              icon={FaBuilding}
              label="Department"
              value={employee.department}
            />
            <InfoCard
              icon={FaDollarSign}
              label="Salary"
              value={employee.salary ? `$${employee.salary.toLocaleString()}` : null}
            />
            <InfoCard
              icon={FaCalendarAlt}
              label="Hire Date"
              value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : null}
            />
            {employee.manager && (
              <InfoCard
                icon={FaUser}
                label="Manager"
                value={employee.manager}
              />
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

      {/* Performance */}
      {employee.performance && (
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Performance Rating</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Overall Rating</span>
                <span className="font-bold text-gray-900">{employee.performance.toFixed(1)} / 5.0</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                  style={{ width: `${(employee.performance / 5) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.round(employee.performance) ? 'text-yellow-400' : 'text-gray-300'}
                  size={24}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

