// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  MdOutlinePerson, 
  MdOutlineLock, 
  MdVisibility, 
  MdVisibilityOff
} from 'react-icons/md';
import { FaUsers, FaShieldAlt, FaChartLine } from 'react-icons/fa';

export default function LoginPage() {
  const { user, login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const loginError = login(username, password);
      
      if (loginError) {
        setError(loginError);
      }
      setIsLoading(false);
    }, 300);
  };

  const quickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Branding Side (Hidden on mobile) */}
      <div className="hidden flex-1 flex-col justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 text-white lg:flex">
        <div className="max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <FaUsers className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">EmpMgmt</h1>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold">Welcome Back!</h2>
          <p className="mb-8 text-lg text-blue-100">
            Streamline your workforce management with our comprehensive employee management system.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <FaUsers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Employee Management</h3>
                <p className="text-sm text-blue-100">Complete employee profiles and records</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <FaChartLine className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics & Insights</h3>
                <p className="text-sm text-blue-100">Real-time dashboard with key metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <FaShieldAlt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Reliable</h3>
                <p className="text-sm text-blue-100">Enterprise-grade security features</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 xl:w-2/5">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <FaUsers className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EmpMgmt</h1>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-2 text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>
          
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <MdOutlinePerson className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="block w-full rounded-lg border-gray-300 py-3 pl-12 pr-4 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <MdOutlineLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-lg border-gray-300 py-3 pl-12 pr-12 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    // Forgot password functionality can be added here
                  }}
                >
                  Forgot password?
                </a>
              </div>
            
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                      <span className="text-sm font-bold text-red-600">!</span>
                    </div>
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          
            {/* Test Credentials */}
            <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quick Login (Demo)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('manager', 'password')}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  <div className="text-xs text-gray-500">Manager</div>
                  <div className="font-semibold">manager</div>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('employee', 'password')}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  <div className="text-xs text-gray-500">Employee</div>
                  <div className="font-semibold">employee</div>
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-gray-500">
                Password: <span className="font-mono">password</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            © 2024 EmpMgmt. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}