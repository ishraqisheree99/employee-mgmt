// src/context/AuthContext.jsx
import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

// NEW: Use emails from mockData for logins
const MOCK_USERS = [
  { 
    username: 'bob.white@example.com', // This is Bob White (Project Manager)
    password: 'password', 
    role: 'manager' 
  },
  { 
    username: 'alice.green@example.com', // This is Alice Green (Software Engineer)
    password: 'password', 
    role: 'employee' 
  },
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // The 'user' object will now store { username: (email), role }
  const [user, setUser] = useLocalStorage('user', null); 
  const navigate = useNavigate();

  const login = (username, password) => {
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      setUser({ username: foundUser.username, role: foundUser.role });
      navigate('/'); 
      return null;
    } else {
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