import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Live checklist helper component
function PasswordRequirements({ password }) {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 1 uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'At least 1 number (0-9)', met: /\d/.test(password) },
    { label: 'At least 1 special character (!@#$%^&*...)', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  return (
    <div className="mt-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
      <p className="text-xs font-semibold text-slate-400 mb-1">Password requirements:</p>
      {criteria.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-2 text-xs">
          <span className={item.met ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
            {item.met ? '✓' : '○'}
          </span>
          <span className={item.met ? 'text-emerald-300' : 'text-slate-400'}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset' | 'dashboard'
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aleph_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [notification, setNotification] = useState({ text: '', type: '' });

  const clearMessages = () => setNotification({ text: '', type: '' });

  const notify = (text, type = 'error') => {
    setNotification({ text, type });
  };

  // Client-side password validation helper
  const isPasswordSecure = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)
    );
  };

  // Submit Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('aleph_token', data.token);
      localStorage.setItem('aleph_user', JSON.stringify(data.user));
      setUser(data.user);
      setView('dashboard');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Submit Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!isPasswordSecure(password)) {
      notify('Password does not meet all security requirements.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('aleph_token', data.token);
      localStorage.setItem('aleph_user', JSON.stringify(data.user));
      setUser(data.user);
      setView('dashboard');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Request Reset Token
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToken(data.resetToken);
      notify(`Development reset token: ${data.resetToken}`, 'success');
      setView('reset');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Apply New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!isPasswordSecure(password)) {
      notify('Password does not meet all security requirements.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      notify('Password updated successfully. You can now sign in.', 'success');
      setPassword('');
      setView('login');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('aleph_token');
    localStorage.removeItem('aleph_user');
    setUser(null);
    setEmail('');
    setPassword('');
    setView('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-400">aleph-app</h1>
        <p className="text-sm text-slate-400 mt-1">Authentication Portal</p>
      </header>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {notification.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm border break-all ${
              notification.type === 'error'
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}
          >
            {notification.text}
          </div>
        )}

        {/* Dashboard */}
        {user || view === 'dashboard' ? (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 mt-1 text-sm">
                Signed in as <span className="font-semibold text-indigo-400">{user?.email}</span>
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {view === 'login' && 'Sign in to Aleph'}
              {view === 'register' && 'Create your account'}
              {view === 'forgot' && 'Reset your password'}
              {view === 'reset' && 'Set new password'}
            </h2>

            {/* Login */}
            {view === 'login' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setView('forgot'); }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold transition shadow-lg shadow-indigo-600/20"
                >
                  Sign in
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { clearMessages(); setView('register'); }} className="text-indigo-400 hover:underline">
                    Sign up
                  </button>
                </p>
              </form>
            )}

            {/* Register */}
            {view === 'register' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <PasswordRequirements password={password} />
                </div>
                <button
                  type="submit"
                  disabled={!isPasswordSecure(password)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition shadow-lg shadow-indigo-600/20"
                >
                  Create account
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { clearMessages(); setView('login'); }} className="text-indigo-400 hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* Forgot */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Account Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@example.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold transition"
                >
                  Generate recovery token
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => { clearMessages(); setView('login'); }} className="text-xs text-slate-400 hover:underline">
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {/* Reset */}
            {view === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Reset token</label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Paste recovery token"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">New password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <PasswordRequirements password={password} />
                </div>
                <button
                  type="submit"
                  disabled={!isPasswordSecure(password)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
                >
                  Save new password
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}