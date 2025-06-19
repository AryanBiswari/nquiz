// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';    // ← new API
import App from './App';
//import { auth, db } from './firebase';             // ensure your Firebase init runs

const container = document.getElementById('root');
const root = createRoot(container);               // create the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
