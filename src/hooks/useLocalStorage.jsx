// src/hooks/useLocalStorage.jsx
import { useState, useEffect } from 'react';

function getStorageValue(key, defaultValue) {
  // getting stored value
  const saved = localStorage.getItem(key);
  if (!saved) {
    return defaultValue;
  }
  
  try {
    const parsed = JSON.parse(saved);
    
    // Special handling for employees: merge with mock data to ensure all employees are included
    if (key === 'employees' && Array.isArray(parsed) && Array.isArray(defaultValue)) {
      // Create a map of existing employees by id
      const existingMap = new Map(parsed.map(emp => [emp.id, emp]));
      
      // Add any employees from mock data that don't exist in stored data
      defaultValue.forEach(mockEmp => {
        if (!existingMap.has(mockEmp.id)) {
          parsed.push(mockEmp);
        } else {
          // Update existing employee with any missing fields from mock data
          const existing = existingMap.get(mockEmp.id);
          Object.keys(mockEmp).forEach(key => {
            if (existing[key] === undefined || existing[key] === null || existing[key] === '') {
              existing[key] = mockEmp[key];
            }
          });
        }
      });
      
      return parsed;
    }
    
    // Special handling for tasks: merge with mock data to ensure all mock tasks are included
    if (key === 'tasks' && Array.isArray(parsed) && Array.isArray(defaultValue)) {
      // Create a map of existing tasks by id
      const existingMap = new Map(parsed.map(task => [task.id, task]));
      
      // Add any tasks from mock data that don't exist in stored data
      defaultValue.forEach(mockTask => {
        if (!existingMap.has(mockTask.id)) {
          parsed.push(mockTask);
        }
      });
      
      return parsed;
    }
    
    // Special handling for attendance: merge with mock data to ensure all mock attendance records are included
    if (key === 'attendance' && Array.isArray(parsed) && Array.isArray(defaultValue) && defaultValue.length > 0) {
      // If parsed is empty or very small, prefer mock data (but keep any user-created records)
      if (parsed.length === 0) {
        return defaultValue;
      }
      
      // Create a map of existing attendance records by id
      const existingMap = new Map(parsed.map(record => [record.id, record]));
      
      // Add any attendance records from mock data that don't exist in stored data
      defaultValue.forEach(mockRecord => {
        if (!existingMap.has(mockRecord.id)) {
          parsed.push(mockRecord);
        }
      });
      
      return parsed;
    }
    
    return parsed;
  } catch (e) {
    // If parsing fails, return default value
    return defaultValue;
  }
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  // Initialize: merge mock data on first load if needed (for employees and tasks)
  useEffect(() => {
    if (key === 'employees' && Array.isArray(value) && Array.isArray(defaultValue)) {
      const existingIds = new Set(value.map(emp => emp.id));
      const missingEmployees = defaultValue.filter(mockEmp => !existingIds.has(mockEmp.id));
      
      if (missingEmployees.length > 0) {
        // Merge missing employees and update missing fields
        const updated = [...value];
        defaultValue.forEach(mockEmp => {
          const existing = updated.find(emp => emp.id === mockEmp.id);
          if (!existing) {
            updated.push(mockEmp);
          } else {
            // Fill in missing fields from mock data
            Object.keys(mockEmp).forEach(k => {
              if (existing[k] === undefined || existing[k] === null || existing[k] === '') {
                existing[k] = mockEmp[k];
              }
            });
          }
        });
        setValue(updated);
      }
    }
    
    // Merge mock tasks with existing tasks
    if (key === 'tasks' && Array.isArray(value) && Array.isArray(defaultValue)) {
      const existingIds = new Set(value.map(task => task.id));
      const missingTasks = defaultValue.filter(mockTask => !existingIds.has(mockTask.id));
      
      if (missingTasks.length > 0) {
        // Add missing mock tasks
        const updated = [...value, ...missingTasks];
        setValue(updated);
      }
    }
    
    // Merge mock attendance with existing attendance
    if (key === 'attendance' && Array.isArray(value) && Array.isArray(defaultValue) && defaultValue.length > 0) {
      // If value is empty, use mock data directly
      if (value.length === 0) {
        console.log('Attendance is empty, loading mock data:', defaultValue.length, 'records');
        setValue(defaultValue);
      } else {
        const existingIds = new Set(value.map(record => record.id));
        const missingAttendance = defaultValue.filter(mockRecord => !existingIds.has(mockRecord.id));
        
        if (missingAttendance.length > 0) {
          console.log('Merging', missingAttendance.length, 'missing attendance records');
          // Add missing mock attendance records
          const updated = [...value, ...missingAttendance];
          setValue(updated);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    // storing value
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};