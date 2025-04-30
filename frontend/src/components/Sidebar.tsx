import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  BarChart, 
  GitBranch, 
  Terminal 
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-center mb-8">
        <Radio className="h-8 w-8 text-blue-600 mr-2" />
        <h1 className="text-xl font-bold">WebSocket Monitor</h1>
      </div>
      
      <nav className="space-y-2">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="/test" icon={<Radio size={20} />} label="Connection Tester" />
        <NavItem to="/metrics" icon={<BarChart size={20} />} label="Metrics" />
        <NavItem to="/deployment" icon={<GitBranch size={20} />} label="Deployment" />
        <NavItem to="/logs" icon={<Terminal size={20} />} label="Logs Viewer" />
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-sm font-medium mb-2">Documentation</h3>
          <ul className="text-xs space-y-1 text-blue-600 dark:text-blue-400">
            <li><a href="#" className="hover:underline">DESIGN.md</a></li>
            <li><a href="#" className="hover:underline">OBSERVABILITY.md</a></li>
            <li><a href="#" className="hover:underline">Setup Guide</a></li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;