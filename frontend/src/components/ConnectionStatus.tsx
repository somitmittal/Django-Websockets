import React from 'react';
import { Radio } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';

const ConnectionStatus: React.FC = () => {
  const { 
    isConnected, 
    connect, 
    disconnect, 
    connectionId 
  } = useWebSocket();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <Radio className="h-8 w-8 text-indigo-500 mr-3" />
        <h2 className="text-lg font-semibold">Connection Status</h2>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          <span className="font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {connectionId && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connection ID</p>
            <p className="font-mono text-sm">{connectionId}</p>
          </div>
        )}
        
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => connect()}
            disabled={isConnected}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              isConnected
                ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
            }`}
          >
            Connect
          </button>
          
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              !isConnected
                ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
            }`}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;