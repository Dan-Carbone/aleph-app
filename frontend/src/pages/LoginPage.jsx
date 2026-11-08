import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Unified Authentication Page: Sign In & Registration.
 */
export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isRegistering) {
        await register(formData.username, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-wider text-indigo-400">
            ALEPH<span className="text-white">-APP</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {isRegistering
              ? 'Create a new account to access the modular apps'
              : 'Sign in to access your dashboard and workspace'}
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-6 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@domain.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-50 text-sm"
          >
            {submitting
              ? 'Processing...'
              : isRegistering
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Mode switch button */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">
            {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none ml-1"
            >
              {isRegistering ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}