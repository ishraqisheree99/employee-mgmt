// src/components/Layout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className={isDashboard ? 'w-full' : ''}>
        <div className={isDashboard ? 'w-full px-4 py-6 sm:px-6 lg:px-8' : 'mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'}>
          {/* Outlet renders the active child route */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}