import React, { useState, useEffect } from 'react';
import { BarChart, AreaChart, PieChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart } from 'recharts';
import { RefreshCw } from 'lucide-react';

// Mock metrics data
const generateMetricsData = () => {
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => {
    const timestamp = new Date(now - (11 - i) * 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      timestamp,
      activeConnections: Math.floor(1000 + Math.random() * 4000),
      messageRate: Math.floor(200 + Math.random() * 300),
      errors: Math.floor(Math.random() * 10),
      avgResponseTime: Math.floor(20 + Math.random() * 30),
      cpuUsage: Math.floor(20 + Math.random() * 40),
      memoryUsage: Math.floor(30 + Math.random() * 30),
    };
  });
};

const getCounterData = () => {
  return [
    { name: 'Total Messages', value: 27843 + Math.floor(Math.random() * 100) },
    { name: 'Active Connections', value: 1243 + Math.floor(Math.random() * 50 - 25) },
    { name: 'Error Count', value: 12 + Math.floor(Math.random() * 3) },
    { name: 'Heartbeats Sent', value: 1872 + Math.floor(Math.random() * 10) },
    { name: 'Graceful Shutdowns', value: 4 },
  ];
};

const Metrics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(30);
  const [metricsData, setMetricsData] = useState(generateMetricsData());
  const [counters, setCounters] = useState(getCounterData());
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setMetricsData(generateMetricsData());
      setCounters(getCounterData());
      setIsLoading(false);
    }, 600);
  };

  useEffect(() => {
    refreshData();
    
    if (refreshInterval) {
      const interval = setInterval(refreshData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, timeRange]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Prometheus Metrics</h2>
          
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <div className="flex items-center space-x-2">
              <label className="text-sm whitespace-nowrap">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700"
              >
                <option value="1h">Last hour</option>
                <option value="3h">Last 3 hours</option>
                <option value="24h">Last 24 hours</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm whitespace-nowrap">Refresh:</label>
              <select
                value={refreshInterval?.toString() || 'off'}
                onChange={(e) => setRefreshInterval(e.target.value === 'off' ? null : Number(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700"
              >
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="off">Off</option>
              </select>
            </div>
            
            <button
              onClick={refreshData}
              disabled={isLoading}
              className={`p-1.5 rounded ${
                isLoading
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              <RefreshCw size={16} className={`${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Prometheus Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {counters.map((counter, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{counter.name}</h3>
              <p className="text-2xl font-bold">{counter.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
        
        {/* Connection Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-4">Active Connections</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metricsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeConnections" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-4">Message Rate</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metricsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="messageRate" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Error Rates and Response Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-4">Error Rate</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metricsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-4">Response Time (ms)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metricsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* System Resource Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">System Resources</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-4">CPU Usage (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metricsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cpuUsage" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-4">Memory Usage (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metricsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memoryUsage" 
                    stroke="#EC4899" 
                    fill="#EC4899" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert Rules */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Alert Rules</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alert</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">NoActiveConnections</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">active_connections == 0 for 60s</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Critical
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Inactive
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">HighErrorRate</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">error_rate {'>'} 5% for 5m</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Warning
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Inactive
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">HighConnectionCount</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">active_connections {'>'} 10000 for 10m</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Info
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Inactive
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Metrics;