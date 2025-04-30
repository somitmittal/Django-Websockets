import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ConnectionTester from './pages/ConnectionTester';
import Metrics from './pages/Metrics';
import Deployment from './pages/Deployment';
import Logs from './pages/Logs';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <WebSocketProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="test" element={<ConnectionTester />} />
              <Route path="metrics" element={<Metrics />} />
              <Route path="deployment" element={<Deployment />} />
              <Route path="logs" element={<Logs />} />
            </Route>
          </Routes>
        </Router>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;