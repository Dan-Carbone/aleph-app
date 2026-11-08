import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registeredApps } from '../apps/registry';

/**
 * Main navigation bar rendered for authenticated users.
 * Automatically populates links from registeredApps.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Hide navigation if no active session
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity & dynamic sub-app links */}
        <div className="flex items-center space-x-8">
          <NavLink to="/" className="text-xl font-extrabold tracking-wider text-indigo-400">
            ALEPH<span className="text-white">-APP</span>
          </NavLink>

          <nav className="flex items-center space-x-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              Dashboard
            </NavLink>

            {registeredApps.map((app) => (
              <NavLink
                key={app.id}
                to={app.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                {app.title}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User badge & logout trigger */}
        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {user?.email || user?.username || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>

      </div>
    </header>
  );
}