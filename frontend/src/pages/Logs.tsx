import React, { useState, useEffect, useRef } from 'react';
import { Filter, RefreshCw, Download, Terminal, XCircle, ArrowDown } from 'lucide-react';

// Mock log data that would come from your backend
const generateLogs = (count: number) => {
  const logLevels = ['INFO', 'DEBUG', 'WARNING', 'ERROR'];
  const services = ['websocket', 'django', 'nginx', 'worker'];
  const messages = [
    'Connection established',
    'WebSocket message received',
    'Broadcasting heartbeat to 1243 connections',
    'Connection closed with code 1000',
    'Graceful shutdown initiated',
    'Thread pool task completed',
    'Health check passed',
    'Metrics scraped by Prometheus',
    'Error processing message: invalid format',
    'Reconnection attempt with session UUID',
    'Failed to authenticate connection',
    'Database query took 124ms',
    'Memory usage at 34%',
    'CPU usage at 28%',
    'Incoming traffic switched to blue stack',
    'Green stack container started'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString();
    const level = logLevels[Math.floor(Math.random() * logLevels.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const requestId = `req-${Math.random().toString(36).substring(2, 10)}`;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      timestamp,
      level,
      service,
      request_id: requestId,
      message,
      details: level === 'ERROR' ? { 
        error_code: Math.floor(Math.random() * 500), 
        stack: 'File "consumers.py", line 42, in on_connect\n  raise ValueError("Invalid token")'
      } : {}
    };
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

const Logs: React.FC = () => {
  const [logs, setLogs] = useState(generateLogs(100));
  const [filterText, setFilterText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const availableLevels = ['INFO', 'DEBUG', 'WARNING', 'ERROR'];
  const availableServices = ['websocket', 'django', 'nginx', 'worker'];

  const filteredLogs = logs.filter(log => {
    const matchesText = 
      filterText === '' || 
      log.message.toLowerCase().includes(filterText.toLowerCase()) ||
      log.request_id.toLowerCase().includes(filterText.toLowerCase());
      
    const matchesLevel = levelFilter.length === 0 || levelFilter.includes(log.level);
    const matchesService = serviceFilter.length === 0 || serviceFilter.includes(log.service);
    
    return matchesText && matchesLevel && matchesService;
  });

  const refreshLogs = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLogs(prevLogs => {
        const newLogs = generateLogs(20);
        return [...prevLogs, ...newLogs].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ).slice(-500); // Keep last 500 logs
      });
      setIsLoading(false);
    }, 500);
  };

  const toggleLevelFilter = (level: string) => {
    setLevelFilter(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  const toggleServiceFilter = (service: string) => {
    setServiceFilter(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service) 
        : [...prev, service]
    );
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-refresh effect
  useEffect(() => {
    let intervalId: number;
    if (isAutoRefresh) {
      intervalId = window.setInterval(refreshLogs, 5000);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isAutoRefresh]);

  // Initial loading
  useEffect(() => {
    refreshLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center">
            <Terminal className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">Log Viewer</h2>
          </div>
          
          <div className="flex flex-wrap items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={refreshLogs}
              disabled={isLoading}
              className={`p-2 rounded-md flex items-center text-sm ${
                isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`p-2 rounded-md flex items-center text-sm ${
                isAutoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <span className={`mr-2 h-2 w-2 rounded-full ${isAutoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              Auto-refresh
            </button>
            
            <button
              onClick={scrollToBottom}
              className="p-2 rounded-md flex items-center text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              <ArrowDown size={16} className="mr-1" />
              Bottom
            </button>
            
            <button
              onClick={() => {
                // In a real app, this would download the logs as a file
                alert('This would download logs in a real implementation');
              }}
              className="p-2 rounded-md flex items-center text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              <Download size={16} className="mr-1" />
              Export
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter logs..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                <XCircle size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {availableLevels.map(level => (
              <button
                key={level}
                onClick={() => toggleLevelFilter(level)}
                className={`px-2 py-1 text-xs rounded-full ${
                  levelFilter.includes(level)
                    ? level === 'ERROR'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : level === 'WARNING'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : level === 'INFO'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-1">
            {availableServices.map(service => (
              <button
                key={service}
                onClick={() => toggleServiceFilter(service)}
                className={`px-2 py-1 text-xs rounded-full ${
                  serviceFilter.includes(service)
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>
        
        {/* Log display */}
        <div className="bg-gray-900 font-mono text-sm rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400">
            Showing {filteredLogs.length} logs {filterText && `(filtered by "${filterText}")`}
          </div>
          <div className="overflow-auto h-[calc(100vh-350px)] p-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <div key={index} className="mb-2 pb-2 border-b border-gray-800">
                  <div className="flex flex-wrap items-start">
                    <span className="text-gray-500 mr-3 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs mr-3 whitespace-nowrap ${
                      log.level === 'ERROR'
                        ? 'bg-red-900/30 text-red-400'
                        : log.level === 'WARNING'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : log.level === 'INFO'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-gray-700 text-gray-300'
                    }`}>
                      {log.level}
                    </span>
                    <span className="bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded text-xs mr-3 whitespace-nowrap">
                      {log.service}
                    </span>
                    <span className="text-gray-400 text-xs mr-3 font-normal whitespace-nowrap">
                      {log.request_id}
                    </span>
                    <span className="text-gray-200 mt-1 sm:mt-0">
                      {log.message}
                    </span>
                  </div>
                  
                  {log.level === 'ERROR' && log.details && (
                    <div className="mt-1 ml-6 pl-3 border-l border-red-800 text-red-400 text-xs whitespace-pre">
                      {log.details.stack}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No logs match your filter criteria
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;