import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // We can create this later if needed for basic styling

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> // Temporarily commented out for debugging Milkdown loading flag
    <App />
  // </React.StrictMode>,
); 