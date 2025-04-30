import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Send, RefreshCw } from 'lucide-react';

const ConnectionTester: React.FC = () => {
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const { 
    isConnected, 
    connect, 
    disconnect, 
    sendMessage, 
    messageCount, 
    connectionId,
    connectionHistory
  } = useWebSocket();

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleConnect = () => {
    connect(sessionId || undefined);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">WebSocket Connection Tester</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session ID (Optional - for reconnection)
            </label>
            <div className="flex">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Previous session ID for reconnection"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700"
                disabled={isConnected}
              />
              <button
                onClick={handleConnect}
                disabled={isConnected}
                className={`ml-2 px-4 py-2 rounded-md flex items-center ${
                  isConnected
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                }`}
              >
                <RefreshCw size={16} className="mr-1" />
                Connect
              </button>
            </div>
          </div>
          
          {isConnected && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Send Message
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here"
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
                >
                  <Send size={16} className="mr-1" />
                  Send
                </button>
              </div>
              
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Message count: {messageCount}
                </span>
                <button
                  onClick={disconnect}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Connection Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Status</h3>
            <div className="flex items-center">
              <span className={`h-3 w-3 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Connection ID</h3>
            <div className="font-mono text-sm">
              {connectionId || 'Not connected'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Message History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Communication History</h2>
        
        <div className="overflow-auto max-h-80 rounded-lg border border-gray-200 dark:border-gray-700">
          {connectionHistory.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {connectionHistory.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.event === 'connected' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : event.event === 'disconnected' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : event.event === 'error'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {event.event}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {event.data ? (
                        <code className="text-xs font-mono p-1 bg-gray-100 dark:bg-gray-900 rounded">
                          {JSON.stringify(event.data)}
                        </code>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No connection history yet. Connect to start testing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionTester;