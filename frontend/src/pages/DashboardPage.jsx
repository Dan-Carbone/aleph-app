import React from 'react';
import { Link } from 'react-router-dom';
import { registeredApps } from '../apps/registry';
import { useAuth } from '../context/AuthContext';

/**
 * Central dashboard displaying available sub-applications.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-white sm:text-3xl">
          Welcome back, {user?.email || user?.username || 'User'}
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-slate-400">
          Select an application from the navigation bar or choose one from the list below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {registeredApps.map((app) => (
          <Link
            key={app.id}
            to={app.path}
            className="group relative rounded-xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {app.title}
              </h3>
              <span className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">
                {app.id}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Access the {app.title} application module.
            </p>
            <div className="mt-4 flex items-center text-sm font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
              Launch application &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}