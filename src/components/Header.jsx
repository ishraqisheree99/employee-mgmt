// src/components/Header.jsx
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaUsers, FaUserCircle } from 'react-icons/fa'; // Import new icon

export default function Header() {
  const { user, logout } = useAuth();

  // Tailwind classes for active vs. inactive links
  const activeClass = 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors';
  const inactiveClass = 'text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors';

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-blue-300 transition-colors">
                <FaUsers className="text-blue-400" />
                <span>EmpMgmt</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  end
                >
                  <FaHome size={14} />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/employees"
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                  <FaUsers size={14} />
                  Employees
                </NavLink>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Display username and role */}
            <div className="hidden sm:flex items-center gap-3 text-gray-300">
              {/* NEW: Make the user icon a link to the profile */}
              <Link
                to="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 transition-colors hover:bg-blue-500"
                title="View My Profile"
              >
                <FaUser size={14} className="text-white" />
              </Link>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>

            {/* NEW: Add a profile link for mobile */}
            <Link
              to="/profile"
              className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white sm:hidden"
              title="My Profile"
            >
              <FaUserCircle size={20} />
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <FaSignOutAlt size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}