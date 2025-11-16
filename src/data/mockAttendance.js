// src/data/mockAttendance.js
// Generate attendance data for the current month
const generateCurrentMonthAttendance = (employeeId) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const attendance = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }
      
      // Random check-in between 8:00 AM and 9:30 AM
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkIn = new Date(date);
      checkIn.setHours(checkInHour, checkInMinute, 0);
      
      // Check-out between 5:00 PM and 6:30 PM (8-9 hours after check-in)
      const workHours = 8 + Math.random() * 1.5;
      const checkOut = new Date(checkIn);
      checkOut.setHours(checkIn.getHours() + Math.floor(workHours), checkIn.getMinute() + Math.floor((workHours % 1) * 60), 0);
      
      attendance.push({
        id: `${employeeId}-${day}`,
        employeeId,
        date: date.toISOString().split('T')[0],
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        workHours: parseFloat(workHours.toFixed(2)),
        status: 'present',
      });
    }
    
    return attendance;
  } catch (error) {
    console.error('Error generating attendance data:', error);
    return [];
  }
};

// Export with error handling
let MOCK_ATTENDANCE = [];
try {
  MOCK_ATTENDANCE = generateCurrentMonthAttendance('employee');
} catch (error) {
  console.error('Error generating mock attendance:', error);
  MOCK_ATTENDANCE = [];
}

export { MOCK_ATTENDANCE };

// Calculate weekly summary
export const getWeeklySummary = (attendance) => {
  if (!Array.isArray(attendance)) {
    return {
      daysPresent: 0,
      totalHours: 0,
      avgHoursPerDay: 0,
      attendance: [],
    };
  }
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const weekAttendance = attendance.filter(record => {
    if (!record || !record.date) return false;
    const recordDate = new Date(record.date);
    return recordDate >= startOfWeek && recordDate <= endOfWeek;
  });
  
  const totalHours = weekAttendance.reduce((sum, record) => sum + (record.workHours || 0), 0);
  const avgHours = weekAttendance.length > 0 ? totalHours / weekAttendance.length : 0;
  
  return {
    daysPresent: weekAttendance.length,
    totalHours: parseFloat(totalHours.toFixed(2)),
    avgHoursPerDay: parseFloat(avgHours.toFixed(2)),
    attendance: weekAttendance,
  };
};

// Calculate monthly summary
export const getMonthlySummary = (attendance) => {
  if (!Array.isArray(attendance)) {
    return {
      daysPresent: 0,
      expectedDays: 0,
      totalHours: 0,
      avgHoursPerDay: 0,
      attendanceRate: 0,
    };
  }
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const monthAttendance = attendance.filter(record => {
    if (!record || !record.date) return false;
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });
  
  const totalHours = monthAttendance.reduce((sum, record) => sum + (record.workHours || 0), 0);
  const avgHours = monthAttendance.length > 0 ? totalHours / monthAttendance.length : 0;
  
  // Calculate expected working days (excluding weekends)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let expectedDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      expectedDays++;
    }
  }
  
  return {
    daysPresent: monthAttendance.length,
    expectedDays,
    totalHours: parseFloat(totalHours.toFixed(2)),
    avgHoursPerDay: parseFloat(avgHours.toFixed(2)),
    attendanceRate: expectedDays > 0 ? parseFloat(((monthAttendance.length / expectedDays) * 100).toFixed(1)) : 0,
  };
};

