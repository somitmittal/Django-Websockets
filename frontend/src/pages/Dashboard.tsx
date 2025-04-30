import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { 
  Activity, 
  MessageSquare, 
  Clock, 
  Radio,
  AlertCircle,
  Server
} from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus';

const Dashboard: React.FC = () => {
  const { 
    isConnected, 
    messageCount, 
    lastHeartbeat, 
    connectionHistory 
  } = useWebSocket();

  // Mock data for deployment status
  const deploymentStatus = {
    activeStack: 'blue',
    blueStatus: 'running',
    greenStatus: 'standby',
    lastSwitch: '2025-05-23T14:30:00Z'
  };

  // Mock data for metrics
  const metrics = {
    totalMessages: 27843,
    activeConnections: 1243,
    errorCount: 12,
    avgResponseTime: 24
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ConnectionStatus />
        
        {/* Message Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-lg font-semibold">Message Stats</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Session Count</p>
              <p className="text-2xl font-bold">{messageCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold">{metrics.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Last Heartbeat */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500 mr-3" />
            <h2 className="text-lg font-semibold">Last Heartbeat</h2>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
            <p className="text-2xl font-bold">
              {lastHeartbeat 
                ? new Date(lastHeartbeat).toLocaleTimeString() 
                : 'No heartbeat received'}
            </p>
            <p className="mt-2 text-sm">
              {lastHeartbeat 
                ? new Date(lastHeartbeat).toLocaleDateString() 
                : ''}
            </p>
          </div>
        </div>
      </div>
      
      {/* Deployment Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <Server className="h-6 w-6 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold">Deployment Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg border ${
            deploymentStatus.activeStack === 'blue' 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Blue Stack</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                deploymentStatus.blueStatus === 'running' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {deploymentStatus.blueStatus}
              </span>
            </div>
            {deploymentStatus.activeStack === 'blue' && (
              <span className="text-xs text-blue-600 dark:text-blue-400 mt-2 block">
                Active stack
              </span>
            )}
          </div>
          
          <div className={`p-4 rounded-lg border ${
            deploymentStatus.activeStack === 'green' 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Green Stack</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                deploymentStatus.greenStatus === 'running' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {deploymentStatus.greenStatus}
              </span>
            </div>
            {deploymentStatus.activeStack === 'green' && (
              <span className="text-xs text-green-600 dark:text-green-400 mt-2 block">
                Active stack
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Last switch: {new Date(deploymentStatus.lastSwitch).toLocaleString()}
        </p>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <Activity className="h-6 w-6 text-orange-500 mr-2" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        
        <div className="overflow-hidden">
          <ul className="space-y-3">
            {connectionHistory.slice(0, 5).map((event, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-2 w-2 rounded-full mt-2 mr-3 bg-blue-500"></span>
                <div>
                  <p className="text-sm font-medium">
                    {event.event.charAt(0).toUpperCase() + event.event.slice(1)}
                    {event.data && event.data.content && `: "${event.data.content}"`}
                  </p>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;