import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { registeredApps } from './apps/registry';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes accessible only after successful login */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />

          {/* Dynamically register all app routes */}
          {registeredApps.map((app) => (
            <Route
              key={app.id}
              path={`${app.path}/*`}
              element={<app.component />}
            />
          ))}
        </Route>

        {/* Fallback redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}