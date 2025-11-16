// src/components/dashboards/EmployeeDashboard.jsx
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../context/ToastContext';
import { MOCK_TASKS } from '../../data/mockTasks';
import { MOCK_ATTENDANCE, getWeeklySummary, getMonthlySummary } from '../../data/mockAttendance';
import { 
  // ... (icons are unchanged)
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

const SAFE_MOCK_ATTENDANCE = Array.isArray(MOCK_ATTENDANCE) ? MOCK_ATTENDANCE : [];

// Debug: Log mock attendance data
if (SAFE_MOCK_ATTENDANCE.length > 0) {
  console.log('Mock attendance data available:', SAFE_MOCK_ATTENDANCE.length, 'records');
  console.log('Sample record:', SAFE_MOCK_ATTENDANCE[0]);
} else {
  console.warn('WARNING: No mock attendance data available!');
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useLocalStorage('tasks', Array.isArray(MOCK_TASKS) ? MOCK_TASKS : []);
  const [attendance, setAttendance] = useLocalStorage('attendance', SAFE_MOCK_ATTENDANCE);
  
  // Local state for check-in time, remove checkOutTime
  const [checkInTime, setCheckInTime] = useState(null);
  
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('all');
  
  const success = toast?.success || (() => {});
  
  // Remove today's attendance record on mount (so check-in/out resets each day/server restart)
  useEffect(() => {
    if (!user || !user.username) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecordId = `${user.username}-${today}`;
    
    // Remove today's attendance record so user can check in fresh each day
    if (Array.isArray(attendance)) {
      const hasTodayRecord = attendance.some(record => record && record.id === todayRecordId);
      if (hasTodayRecord) {
        const filteredAttendance = attendance.filter(record => record && record.id !== todayRecordId);
        setAttendance(filteredAttendance);
      }
    }
  }, []); // Only run once on mount
  
  // Force load mock attendance data if none exists for this user
  useEffect(() => {
    if (!user || !user.username) return;
    
    if (Array.isArray(attendance) && SAFE_MOCK_ATTENDANCE.length > 0) {
      const userAttendance = attendance.filter(record => {
        if (!record || !record.employeeId) return false;
        const today = new Date().toISOString().split('T')[0];
        // Exclude today's record from count
        return record.employeeId === user.username && record.date !== today;
      });
      if (userAttendance.length === 0) {
        console.log('No attendance found for user, ensuring mock data is loaded');
        // Check if mock data exists in attendance array
        const hasMockData = attendance.some(record => record && record.employeeId === 'alice.green@example.com');
        if (!hasMockData && user.username === 'alice.green@example.com') {
          console.log('Loading mock attendance data for Alice Green');
          setAttendance(SAFE_MOCK_ATTENDANCE);
        }
      }
    }
  }, [user, attendance, setAttendance]);
  
  if (!user || !user.username) {
    return null;
  }

  // ... (employeeTasks useMemo is unchanged)
  const employeeTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task && task.employeeId === user.username);
  }, [tasks, user.username]);

  // ... (employeeAttendance useMemo is unchanged)
  const employeeAttendance = useMemo(() => {
    if (!Array.isArray(attendance)) {
      console.log('Attendance is not an array:', attendance);
      return [];
    }
    console.log('Total attendance records:', attendance.length, 'for user:', user.username);
    const filtered = attendance.filter(record => {
      if (!record || !record.employeeId) return false;
      return record.employeeId === user.username;
    });
    console.log('Filtered attendance for', user.username, ':', filtered.length, 'records');
    if (filtered.length === 0 && attendance.length > 0) {
      console.log('Sample attendance record employeeId:', attendance[0]?.employeeId);
    }
    return filtered;
  }, [attendance, user.username]);

  // ... (taskStats useMemo is unchanged)
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

  // ... (weeklySummary useMemo is unchanged)
  const weeklySummary = useMemo(() => {
    return getWeeklySummary(employeeAttendance);
  }, [employeeAttendance]);

  // ... (monthlySummary useMemo is unchanged)
  const monthlySummary = useMemo(() => {
    return getMonthlySummary(employeeAttendance);
  }, [employeeAttendance]);

  // Today's attendance - only show if user has checked in today
  const todayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return employeeAttendance.find(record => record && record.date === today);
  }, [employeeAttendance]);

  // ... (filteredTasks useMemo is unchanged)
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
  
  // ... (upcomingTasks useMemo is unchanged)
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


  // CHANGED: handleCheckIn now saves to localStorage
  const handleCheckIn = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (todayAttendance) {
      success('You have already checked in today!');
      return;
    }
    
    setCheckInTime(now); // For immediate UI update
    
    // Create new attendance record
    const newRecord = {
      id: `${user.username}-${today}`,
      employeeId: user.username,
      date: today,
      checkIn: now.toISOString(),
      checkOut: null, // Not checked out yet
      workHours: 0,
      status: 'present',
    };
    
    // Save to localStorage
    setAttendance([...attendance, newRecord]);
    success(`Checked in at ${now.toLocaleTimeString()}`);
  };

  // CHANGED: handleCheckOut now updates localStorage
  const handleCheckOut = () => {
    const now = new Date();
    
    if (!todayAttendance) {
      success('You must check in before you can check out!');
      return;
    }
    
    if (todayAttendance.checkOut) {
      success('You have already checked out for the day.');
      return;
    }

    const checkIn = new Date(todayAttendance.checkIn);
    const workHours = ((now - checkIn) / (1000 * 60 * 60)).toFixed(2);
    
    // Update the record in localStorage with checkout info
    setAttendance(prevAttendance => 
      prevAttendance.map(record =>
        record.id === todayAttendance.id
          ? { ...record, checkOut: now.toISOString(), workHours: parseFloat(workHours) }
          : record
      )
    );
    
    setCheckInTime(null); // Clear local state
    success(`Checked out at ${now.toLocaleTimeString()}. Worked ${workHours} hours`);
    
    // Remove today's record after a short delay so the button resets
    // This allows them to check in again (useful for testing or if they need to check in again)
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      setAttendance(prevAttendance => 
        prevAttendance.filter(record => record.id !== `${user.username}-${today}`)
      );
    }, 3000); // Remove after 3 seconds to allow user to see the success message
  };

  // ... (handleTaskStatusChange is unchanged)
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

  // ... (getPriorityColor is unchanged)
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ... (getStatusColor is unchanged)
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ... (StatCard component is unchanged)
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
  
  // NEW: Determine current check-in state
  const isCheckedIn = todayAttendance && !todayAttendance.checkOut;
  const isCheckedOut = todayAttendance && todayAttendance.checkOut;

  return (
    <div className="w-full space-y-6 animate-fade-in px-2 sm:px-4 lg:px-6">
      {/* ... (Header is unchanged) */}
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

      {/* CHANGED: Check In/Out Section now reads from todayAttendance */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold">Today's Attendance</h2>
            <p className="mt-2 text-lg text-blue-100">
              {isCheckedIn
                ? `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString()}`
                : isCheckedOut
                ? `Checked out at ${new Date(todayAttendance.checkOut).toLocaleTimeString()}`
                : 'Not checked in yet'}
            </p>
            {isCheckedIn && (
              <p className="mt-1 text-sm text-blue-200">
                Current session: {Math.floor((new Date() - new Date(todayAttendance.checkIn)) / (1000 * 60))} minutes
              </p>
            )}
            {isCheckedOut && (
              <p className="mt-1 text-sm text-blue-200">
                Total hours: {todayAttendance.workHours}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {!isCheckedIn && !isCheckedOut ? (
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
                disabled={isCheckedOut}
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <FaSignOutAlt />
                {isCheckedOut ? 'Checked Out' : 'Check Out'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ... (Rest of the file is unchanged) ... */}
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
                        {new Date(record.checkIn).toLocaleTimeString()} - {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'Pending'}
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
      
      {/* ... (Task Status Breakdown is unchanged) ... */}
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