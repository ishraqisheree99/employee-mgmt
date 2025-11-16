// src/components/dashboards/EmployeeDashboard.jsx
import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../context/ToastContext';
import { MOCK_TASKS } from '../../data/mockTasks';
import { MOCK_ATTENDANCE, getWeeklySummary, getMonthlySummary } from '../../data/mockAttendance';
import { 
  FaTasks, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaChartBar,
  FaSignInAlt,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaCalendarCheck
} from 'react-icons/fa';
import { MdPendingActions, MdWork, MdFilterList } from 'react-icons/md';

// Ensure MOCK_ATTENDANCE is always an array
const SAFE_MOCK_ATTENDANCE = Array.isArray(MOCK_ATTENDANCE) ? MOCK_ATTENDANCE : [];

export default function EmployeeDashboard() {
  // All hooks must be called unconditionally first
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useLocalStorage('tasks', Array.isArray(MOCK_TASKS) ? MOCK_TASKS : []);
  const [attendance, setAttendance] = useLocalStorage('attendance', SAFE_MOCK_ATTENDANCE);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('all');
  
  // Get success function safely
  const success = toast?.success || (() => {});
  
  // Safety check after all hooks
  if (!user || !user.username) {
    return null;
  }

  // Filter tasks for current employee
  const employeeTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task && task.employeeId === user.username);
  }, [tasks, user.username]);

  // Filter attendance for current employee
  const employeeAttendance = useMemo(() => {
    if (!Array.isArray(attendance)) return [];
    return attendance.filter(record => record && record.employeeId === user.username);
  }, [attendance, user.username]);

  // Task statistics
  const taskStats = useMemo(() => {
    const pending = employeeTasks.filter(t => t.status === 'pending').length;
    const inProgress = employeeTasks.filter(t => t.status === 'in-progress').length;
    const completed = employeeTasks.filter(t => t.status === 'completed').length;
    const overdue = employeeTasks.filter(t => {
      if (t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { pending, inProgress, completed, overdue, total: employeeTasks.length };
  }, [employeeTasks]);

  // Weekly summary
  const weeklySummary = useMemo(() => {
    return getWeeklySummary(employeeAttendance);
  }, [employeeAttendance]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    return getMonthlySummary(employeeAttendance);
  }, [employeeAttendance]);

  // Today's attendance
  const todayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return employeeAttendance.find(record => record.date === today);
  }, [employeeAttendance]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = employeeTasks;
    
    if (selectedTaskFilter === 'pending') {
      filtered = filtered.filter(t => t.status === 'pending');
    } else if (selectedTaskFilter === 'in-progress') {
      filtered = filtered.filter(t => t.status === 'in-progress');
    } else if (selectedTaskFilter === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed');
    } else if (selectedTaskFilter === 'overdue') {
      filtered = filtered.filter(t => {
        if (t.status === 'completed') return false;
        return new Date(t.dueDate) < new Date();
      });
    }
    
    return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [employeeTasks, selectedTaskFilter]);

  // Upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return employeeTasks
      .filter(task => task.status !== 'completed')
      .filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [employeeTasks]);

  const handleCheckIn = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if already checked in today
    if (todayAttendance) {
      success('You have already checked in today!');
      return;
    }
    
    setCheckInTime(now);
    success(`Checked in at ${now.toLocaleTimeString()}`);
  };

  const handleCheckOut = () => {
    if (!checkInTime && !todayAttendance) {
      success('Please check in first!');
      return;
    }
    
    const now = new Date();
    const checkIn = checkInTime || (todayAttendance ? new Date(todayAttendance.checkIn) : now);
    const workHours = ((now - checkIn) / (1000 * 60 * 60)).toFixed(2);
    
    setCheckOutTime(now);
    success(`Checked out at ${now.toLocaleTimeString()}. Worked ${workHours} hours`);
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null
            }
          : task
      )
    );
    success(`Task marked as ${newStatus.replace('-', ' ')}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', onClick }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500',
    };

    return (
      <div 
        onClick={onClick}
        className={`group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-lg sm:text-xl text-gray-600">
            Welcome back, <span className="font-semibold text-gray-900">{user?.username || 'Employee'}</span>!
          </p>
        </div>
        <div className="hidden md:block">
          <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 capitalize">
            {user?.role || 'employee'}
          </span>
        </div>
      </div>

      {/* Check In/Out Section */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold">Today's Attendance</h2>
            <p className="mt-2 text-lg text-blue-100">
              {todayAttendance && todayAttendance.checkIn
                ? `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString()}`
                : checkInTime
                ? `Checked in at ${checkInTime.toLocaleTimeString()}`
                : 'Not checked in yet'}
            </p>
            {checkInTime && !checkOutTime && (
              <p className="mt-1 text-sm text-blue-200">
                Current session: {Math.floor((new Date() - checkInTime) / (1000 * 60))} minutes
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {!todayAttendance && !checkInTime ? (
              <button
                onClick={handleCheckIn}
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 shadow-lg"
              >
                <FaSignInAlt />
                Check In
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={checkOutTime !== null}
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <FaSignOutAlt />
                {checkOutTime ? 'Checked Out' : 'Check Out'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FaTasks}
          title="Total Tasks"
          value={taskStats.total}
          subtitle={`${taskStats.completed} completed`}
          color="blue"
          onClick={() => setSelectedTaskFilter('all')}
        />
        <StatCard
          icon={MdPendingActions}
          title="Pending Tasks"
          value={taskStats.pending}
          subtitle={`${taskStats.overdue} overdue`}
          color="orange"
          onClick={() => setSelectedTaskFilter('pending')}
        />
        <StatCard
          icon={FaClock}
          title="Weekly Hours"
          value={weeklySummary.totalHours}
          subtitle={`${weeklySummary.daysPresent} days`}
          color="green"
        />
        <StatCard
          icon={FaChartBar}
          title="Monthly Hours"
          value={monthlySummary.totalHours}
          subtitle={`${monthlySummary.attendanceRate}% attendance`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Tasks Overview - Takes 2 columns on XL */}
        <div className="xl:col-span-2 rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
            <div className="flex flex-wrap items-center gap-2">
              <MdFilterList className="text-gray-500" />
              <button
                onClick={() => setSelectedTaskFilter('all')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTaskFilter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTaskFilter('pending')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTaskFilter === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedTaskFilter('in-progress')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTaskFilter === 'in-progress' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setSelectedTaskFilter('completed')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTaskFilter === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setSelectedTaskFilter('overdue')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTaskFilter === 'overdue' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Overdue
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="group rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        {task.completedAt && (
                          <span className="text-green-600">Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      {task.status !== 'completed' && (
                        <div className="flex gap-1">
                          {task.status === 'pending' && (
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
                              className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                              title="Start Task"
                            >
                              <MdWork size={14} />
                            </button>
                          )}
                          {task.status === 'in-progress' && (
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'completed')}
                              className="rounded-lg bg-green-100 p-2 text-green-600 transition-colors hover:bg-green-200"
                              title="Complete Task"
                            >
                              <FaCheckCircle size={14} />
                            </button>
                          )}
                          {task.status === 'pending' && (
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'completed')}
                              className="rounded-lg bg-green-100 p-2 text-green-600 transition-colors hover:bg-green-200"
                              title="Mark Complete"
                            >
                              <FaCheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaTasks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No tasks found</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance & Work Hours */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Attendance & Work Hours</h2>
          <div className="space-y-6">
            {/* Weekly Summary */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">This Week</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-blue-50 p-4 transition-transform hover:scale-105">
                  <p className="text-xs text-gray-600">Days Present</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">{weeklySummary.daysPresent}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 transition-transform hover:scale-105">
                  <p className="text-xs text-gray-600">Total Hours</p>
                  <p className="mt-1 text-2xl font-bold text-green-600">{weeklySummary.totalHours}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 transition-transform hover:scale-105">
                  <p className="text-xs text-gray-600">Avg/Day</p>
                  <p className="mt-1 text-2xl font-bold text-purple-600">{weeklySummary.avgHoursPerDay}</p>
                </div>
              </div>
            </div>

            {/* Monthly Summary */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <FaCalendarCheck className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Days Present</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {monthlySummary.daysPresent} / {monthlySummary.expectedDays}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Total Hours</span>
                  </div>
                  <span className="font-bold text-gray-900">{monthlySummary.totalHours} hrs</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                  </div>
                  <span className="font-bold text-gray-900">{monthlySummary.attendanceRate}%</span>
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">Recent Attendance</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {employeeAttendance.slice(-5).reverse().map((record) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.checkIn).toLocaleTimeString()} - {new Date(record.checkOut).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">{record.workHours} hrs</span>
                  </div>
                ))}
                {employeeAttendance.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">No attendance records</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Task Status Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div 
            onClick={() => setSelectedTaskFilter('pending')}
            className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 transition-all hover:border-yellow-300 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MdPendingActions className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
              </div>
            </div>
          </div>
          <div 
            onClick={() => setSelectedTaskFilter('in-progress')}
            className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MdWork className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              </div>
            </div>
          </div>
          <div 
            onClick={() => setSelectedTaskFilter('completed')}
            className="rounded-lg border-2 border-green-200 bg-green-50 p-4 transition-all hover:border-green-300 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
            </div>
          </div>
        </div>
        {taskStats.overdue > 0 && (
          <div 
            onClick={() => setSelectedTaskFilter('overdue')}
            className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 p-4 transition-all hover:border-red-300 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FaExclamationCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Overdue Tasks</p>
                <p className="text-xl font-bold text-red-600">{taskStats.overdue} tasks need immediate attention</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
