import React from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';

const PageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/test': 'Connection Tester',
  '/metrics': 'Metrics',
  '/deployment': 'Deployment',
  '/logs': 'Logs',
};

const Header: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useWebSocket();
  
  const pageTitle = PageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">{pageTitle}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon size={20} className="text-gray-700" />
          ) : (
            <Sun size={20} className="text-gray-300" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;