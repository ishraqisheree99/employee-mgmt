// src/context/AuthContext.jsx
import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

// NEW: A mock user database. In a real app, this would be in a database.
const MOCK_USERS = [
  { username: 'manager', password: 'password', role: 'manager' },
  { username: 'employee', password: 'password', role: 'employee' },
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // The 'user' object will now store { username, role }
  const [user, setUser] = useLocalStorage('user', null); 
  const navigate = useNavigate();

  // CHANGED: The login function now accepts username and password
  const login = (username, password) => {
    // Find a user in our mock database
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // Set the user in localStorage
      setUser({ username: foundUser.username, role: foundUser.role });
      navigate('/'); // Redirect to dashboard
      return null; // No error
    } else {
      // User not found or wrong password
      return 'Invalid username or password';
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};