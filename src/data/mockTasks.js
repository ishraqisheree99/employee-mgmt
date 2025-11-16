// src/data/mockTasks.js

// CHANGED: Assign tasks to 'alice.green@example.com'
const employeeUsername = 'alice.green@example.com';

// Get current date for relative dates
const today = new Date();
const getDateString = (daysFromNow) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const MOCK_TASKS = [
  {
    id: '1',
    employeeId: employeeUsername, // username (email) of employee
    title: 'Fix Authentication Bug',
    description: 'Investigate and fix the login issue where users are unable to authenticate after password reset. Check token expiration logic and session management.',
    status: 'in-progress',
    priority: 'high',
    dueDate: getDateString(3),
    createdAt: getDateString(-5),
    completedAt: null,
  },
  {
    id: '2',
    employeeId: employeeUsername,
    title: 'Implement User Profile Feature',
    description: 'Develop the new user profile page with editable fields, avatar upload, and privacy settings. Use React hooks and ensure responsive design.',
    status: 'pending',
    priority: 'medium',
    dueDate: getDateString(7),
    createdAt: getDateString(-2),
    completedAt: null,
  },
  {
    id: '3',
    employeeId: employeeUsername,
    title: 'Code Review: Payment Integration',
    description: 'Review the payment integration PR from the backend team. Check for security vulnerabilities, error handling, and code quality.',
    status: 'pending',
    priority: 'high',
    dueDate: getDateString(1),
    createdAt: getDateString(-1),
    completedAt: null,
  },
  {
    id: '4',
    employeeId: employeeUsername,
    title: 'Write Unit Tests for Dashboard Component',
    description: 'Create comprehensive unit tests for the dashboard component using Jest and React Testing Library. Aim for 90%+ code coverage.',
    status: 'pending',
    priority: 'medium',
    dueDate: getDateString(5),
    createdAt: getDateString(-3),
    completedAt: null,
  },
  {
    id: '5',
    employeeId: employeeUsername,
    title: 'Update API Documentation',
    description: 'Document the new REST API endpoints for the user management module. Include request/response examples and error codes.',
    status: 'completed',
    priority: 'low',
    dueDate: getDateString(-2),
    createdAt: getDateString(-7),
    completedAt: getDateString(-1),
  },
  {
    id: '6',
    employeeId: employeeUsername,
    title: 'Optimize Database Queries',
    description: 'Review and optimize slow database queries in the employee management module. Add proper indexes and refactor N+1 query problems.',
    status: 'in-progress',
    priority: 'high',
    dueDate: getDateString(4),
    createdAt: getDateString(-4),
    completedAt: null,
  },
  {
    id: '7',
    employeeId: employeeUsername,
    title: 'Setup CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment. Set up staging and production environments with proper secrets management.',
    status: 'pending',
    priority: 'medium',
    dueDate: getDateString(10),
    createdAt: getDateString(-6),
    completedAt: null,
  },
  {
    id: '8',
    employeeId: employeeUsername,
    title: 'Refactor Legacy Components',
    description: 'Refactor old class-based React components to functional components with hooks. Improve code maintainability and performance.',
    status: 'pending',
    priority: 'low',
    dueDate: getDateString(14),
    createdAt: getDateString(-8),
    completedAt: null,
  },
];