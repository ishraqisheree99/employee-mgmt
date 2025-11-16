// src/pages/TaskAdd.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_EMPLOYEES } from '../data/mockData';
import { MOCK_TASKS } from '../data/mockTasks';
import { useToast } from '../context/ToastContext';
import { FaTasks } from 'react-icons/fa';

export default function TaskAddPage() {
  // Get all employees to populate the dropdown
  const [employees] = useLocalStorage('employees', MOCK_EMPLOYEES);
  // Get the 'setTasks' function to update the tasks list
  const [tasks, setTasks] = useLocalStorage('tasks', MOCK_TASKS);
  
  const navigate = useNavigate();
  const { success, error } = useToast();

  // Form state
  const [employeeId, setEmployeeId] = useState(''); // Will store the employee's username (email)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !title || !dueDate) {
      error('Please select an employee, set a title, and pick a due date.');
      return;
    }

    const newTaskId = String(Date.now());
    const newEmployee = employees.find(emp => emp.email === employeeId);

    const newTask = {
      id: newTaskId,
      employeeId: employeeId, // This is the employee's email/username
      title,
      description,
      status: 'pending', // All new tasks start as pending
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    // Add the new task to the existing list in localStorage
    setTasks([...tasks, newTask]);
    
    success(`Task assigned to ${newEmployee?.name || employeeId}`);
    navigate('/'); // Go back to the manager dashboard
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assign New Task</h1>
        <p className="mt-2 text-sm text-gray-600">
          Assign a new task to an employee. It will appear on their dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-lg">
        <div className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign To *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.email}>
                  {emp.name} ({emp.position})
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FaTasks size={14} />
            Assign Task
          </button>
        </div>
      </form>
    </div>
  );
}