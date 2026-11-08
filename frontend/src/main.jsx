import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css'; // Tailwind CSS directives (@tailwind base; @tailwind components; @tailwind utilities;)

/**
 * Main entry point mounting the authenticated application portal.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);