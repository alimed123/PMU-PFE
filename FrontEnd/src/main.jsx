import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AlertProvider } from './components/context/AlertContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AlertProvider> 
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AlertProvider>
  </React.StrictMode>
);
