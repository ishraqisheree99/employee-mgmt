// src/components/dashboards/ManagerDashboard.jsx
import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MOCK_EMPLOYEES } from '../../data/mockData';
import { 
  FaUsers, 
  FaBuilding, 
  FaDollarSign, 
  FaChartLine,
  FaStar,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [employees] = useLocalStorage('employees', Array.isArray(MOCK_EMPLOYEES) ? MOCK_EMPLOYEES : []);

  // Safety check
  if (!user) {
    return null;
  }

  const stats = useMemo(() => {
    if (!Array.isArray(employees)) return { activeCount: 0, departmentCount: 0, totalSalary: 0, avgSalary: 0, avgPerformance: 0 };
    const activeEmployees = employees.filter(emp => emp && emp.status === 'active');
    const departments = [...new Set(employees.map(emp => emp && emp.department).filter(Boolean))];
    const totalSalary = employees.reduce((sum, emp) => sum + (emp && emp.salary ? emp.salary : 0), 0);
    const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0;
    const avgPerformance = employees.length > 0 
      ? employees.reduce((sum, emp) => sum + (emp.performance || 0), 0) / employees.length 
      : 0;
    const recentHires = employees.filter(emp => {
      if (!emp.hireDate) return false;
      const hireDate = new Date(emp.hireDate);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return hireDate >= sixMonthsAgo;
    }).length;

    return {
      total: employees.length,
      active: activeEmployees.length,
      departments: departments.length,
      avgSalary,
      avgPerformance,
      recentHires,
    };
  }, [employees]);

  const departmentStats = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    const deptCounts = {};
    employees.forEach(emp => {
      if (emp && emp.department) {
        deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
      }
    });
    return Object.entries(deptCounts)
      .map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [employees]);

  const recentEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return [...employees]
      .filter(emp => emp && emp.hireDate)
      .sort((a, b) => {
        if (!a.hireDate || !b.hireDate) return 0;
        return new Date(b.hireDate) - new Date(a.hireDate);
      })
      .slice(0, 5);
  }, [employees]);

  const topPerformers = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return [...employees]
      .filter(emp => emp && emp.performance)
      .sort((a, b) => (b.performance || 0) - (a.performance || 0))
      .slice(0, 5);
  }, [employees]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500',
    };

    return (
      <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-gray-500">{subtitle}</p>
                {trend && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {trend > 0 ? <FaArrowUp size={12} /> : trend < 0 ? <FaArrowDown size={12} /> : null}
                    {Math.abs(trend)}%
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={`rounded-full ${colors[color]} p-4 opacity-90 transition-transform group-hover:scale-110`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 h-1 w-full ${colors[color]} transform transition-transform group-hover:scale-x-110`} />
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 animate-fade-in px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-2 text-lg sm:text-xl text-gray-600">
            Welcome back, <span className="font-semibold text-gray-900">{user.username}</span>!
          </p>
        </div>
        <div className="hidden md:block">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FaUsers}
          title="Total Employees"
          value={stats.total}
          subtitle={`${stats.active} active`}
          color="blue"
          trend={5.2}
        />
        <StatCard
          icon={FaBuilding}
          title="Departments"
          value={stats.departments}
          subtitle="Active departments"
          color="green"
        />
        <StatCard
          icon={FaDollarSign}
          title="Avg Salary"
          value={`$${Math.round(stats.avgSalary).toLocaleString()}`}
          subtitle="Per employee"
          color="purple"
          trend={3.1}
        />
        <StatCard
          icon={FaChartLine}
          title="Avg Performance"
          value={stats.avgPerformance.toFixed(1)}
          subtitle="Out of 5.0"
          color="orange"
          trend={2.5}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Department Distribution - Takes 2 columns */}
        <div className="xl:col-span-2 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Department Distribution</h2>
          <div className="space-y-4">
            {departmentStats.length > 0 ? (
              departmentStats.map(({ dept, count }) => {
                const percentage = (count / stats.total) * 100;
                return (
                  <div key={dept} className="group">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{dept}</span>
                      <span className="text-gray-500">{count} employees</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 group-hover:from-blue-600 group-hover:to-indigo-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No department data available</p>
            )}
          </div>
        </div>

        {/* Recent Hires */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Hires</h2>
            <Link
              to="/employees"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentEmployees.length > 0 ? (
              recentEmployees.map((emp) => (
                <Link
                  key={emp.id}
                  to={`/employees/view/${emp.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-all hover:bg-gray-50 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <span className="font-semibold">{emp.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}
                    </p>
                    {emp.performance && (
                      <div className="mt-1 flex items-center gap-1">
                        <FaStar className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {emp.performance.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No recent employees</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Top Performers</h2>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((emp, index) => (
                <Link
                  key={emp.id}
                  to={`/employees/view/${emp.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-all hover:bg-gray-50 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaStar className="h-4 w-4 text-yellow-400" />
                    <span className="font-bold text-gray-900">{emp.performance?.toFixed(1) || 'N/A'}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No performance data available</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link
              to="/employees/add"
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 hover:scale-105 active:scale-95"
            >
              <FaUsers />
              Add New Employee
            </Link>
            <Link
              to="/employees"
              className="flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
            >
              View All Employees
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
