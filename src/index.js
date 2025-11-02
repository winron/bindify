// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.js';

window.onload = () => {
    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(<App />);
};
