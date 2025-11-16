// src/App.jsx
import { useRoutes, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

// Import all our page components
import LoginPage from './pages/Login.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import EmployeeListPage from './pages/EmployeeList.jsx';
import EmployeeAddPage from './pages/EmployeeAdd.jsx';
import EmployeeEditPage from './pages/EmployeeEdit.jsx';
import EmployeeViewPage from './pages/EmployeeView.jsx';

function App() {
  const routes = useRoutes([
    // Public route
    {
      path: '/login',
      element: <LoginPage />,
    },
    // Protected routes
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true, // This is the default child route (at '/')
          element: <DashboardPage />,
        },
        {
          path: 'employees',
          element: <EmployeeListPage />,
        },
        {
          path: 'employees/add', // path: '/employees/add'
          element: (
            <ProtectedRoute managerOnly={true}> 
              <EmployeeAddPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'employees/view/:id', // path: '/employees/view/123'
          element: <EmployeeViewPage />,
        },
        {
          path: 'employees/:id', // path: '/employees/123'
          element: (
            <ProtectedRoute managerOnly={true}>
              <EmployeeEditPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    // Catch-all 404
    { path: '*', element: <Navigate to="/" replace /> }
  ]);

  return routes;
}

export default App;