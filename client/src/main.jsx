/**
 * @file main.jsx
 * @description Entry point of the React application. Renders the root App component into the DOM.
 *
 * Features:
 *  - Sets up the React app using React 18's createRoot API.
 *  - Wraps the app with BrowserRouter and AuthProvider for routing and authentication context.
 *  - Loads Bootstrap and global CSS styles.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// React 18 root API
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);