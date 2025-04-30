import React, { useState } from 'react';
import { Play, GitBranch, Check, X, RefreshCw, Server, Terminal } from 'lucide-react';

// Mock deployment functions that would interact with your backend
const triggerBlueGreenDeployment = async () => {
  // Would call your promote.sh script via an API
  return new Promise(resolve => setTimeout(resolve, 1500));
};

const triggerSmokeTest = async () => {
  // Would run smoke tests via an API
  return new Promise(resolve => setTimeout(resolve, 2000));
};

const Deployment: React.FC = () => {
  const [activeStack, setActiveStack] = useState('blue');
  const [deploymentInProgress, setDeploymentInProgress] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState<number | null>(null);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [lastDeployment, setLastDeployment] = useState('2025-05-23T14:30:00Z');
  
  // Mock deployment steps
  const deploymentSteps = [
    'Building next color stack',
    'Starting containers',
    'Running smoke tests',
    'Switching traffic',
    'Gracefully stopping old stack'
  ];

  const appendToLog = (message: string) => {
    setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const startDeployment = async () => {
    setDeploymentInProgress(true);
    setDeploymentStep(0);
    const targetStack = activeStack === 'blue' ? 'green' : 'blue';
    
    appendToLog(`Starting blue-green deployment: ${activeStack} → ${targetStack}`);
    appendToLog(`Building ${targetStack} stack...`);
    
    // Step 1: Build next color
    await new Promise(resolve => setTimeout(resolve, 1500));
    appendToLog(`Built ${targetStack} stack successfully`);
    setDeploymentStep(1);
    
    // Step 2: Start containers
    await new Promise(resolve => setTimeout(resolve, 1000));
    appendToLog(`Started ${targetStack} containers`);
    setDeploymentStep(2);
    
    // Step 3: Run smoke tests
    appendToLog(`Running smoke tests against ${targetStack} stack...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    appendToLog(`Smoke tests passed`);
    setDeploymentStep(3);
    
    // Step 4: Switch traffic
    appendToLog(`Switching traffic to ${targetStack} stack...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    setActiveStack(targetStack);
    appendToLog(`Traffic now routing to ${targetStack} stack`);
    setDeploymentStep(4);
    
    // Step 5: Stop old stack
    appendToLog(`Gracefully shutting down ${activeStack} stack...`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    appendToLog(`${activeStack} stack shut down successfully`);
    
    // Done
    setDeploymentInProgress(false);
    setDeploymentStep(null);
    setLastDeployment(new Date().toISOString());
    appendToLog(`Blue-green deployment completed successfully`);
  };
  
  const runSmokeTest = async () => {
    appendToLog(`Running smoke tests against ${activeStack} stack...`);
    await triggerSmokeTest();
    appendToLog(`Smoke tests completed successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Blue-Green Deployment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Blue Stack Card */}
          <div 
            className={`p-6 rounded-lg border-2 ${
              activeStack === 'blue' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center mb-4">
              <Server 
                className={`h-6 w-6 ${
                  activeStack === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                } mr-2`} 
              />
              <h3 className="text-lg font-medium">Blue Stack</h3>
              {activeStack === 'blue' && (
                <span className="ml-auto px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                  Active
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`font-medium ${
                  activeStack === 'blue' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {activeStack === 'blue' ? 'Running' : 'Standby'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Version:</span>
                <span className="font-mono">v1.2.5</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Health:</span>
                <span className={`font-medium ${
                  activeStack === 'blue' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {activeStack === 'blue' ? 'Healthy' : 'Not Running'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Green Stack Card */}
          <div 
            className={`p-6 rounded-lg border-2 ${
              activeStack === 'green' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center mb-4">
              <Server 
                className={`h-6 w-6 ${
                  activeStack === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                } mr-2`} 
              />
              <h3 className="text-lg font-medium">Green Stack</h3>
              {activeStack === 'green' && (
                <span className="ml-auto px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-full">
                  Active
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`font-medium ${
                  activeStack === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {activeStack === 'green' ? 'Running' : 'Standby'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Version:</span>
                <span className="font-mono">v1.2.6</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Health:</span>
                <span className={`font-medium ${
                  activeStack === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {activeStack === 'green' ? 'Healthy' : 'Not Running'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Deployment Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={startDeployment}
            disabled={deploymentInProgress}
            className={`px-4 py-2 rounded-md flex items-center ${
              deploymentInProgress
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            {deploymentInProgress ? (
              <RefreshCw size={18} className="mr-2 animate-spin" />
            ) : (
              <GitBranch size={18} className="mr-2" />
            )}
            {deploymentInProgress ? 'Deploying...' : 'Trigger Blue-Green Deploy'}
          </button>
          
          <button
            onClick={runSmokeTest}
            disabled={deploymentInProgress}
            className={`px-4 py-2 rounded-md flex items-center ${
              deploymentInProgress
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
            }`}
          >
            <Play size={18} className="mr-2" />
            Run Smoke Tests
          </button>
        </div>
        
        {/* Deployment Progress */}
        {deploymentStep !== null && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-4">Deployment Progress</h3>
            <ol className="relative border-l border-gray-300 dark:border-gray-700 ml-3">
              {deploymentSteps.map((step, index) => (
                <li key={index} className="mb-6 ml-6">
                  <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${
                    index < deploymentStep
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : index === deploymentStep
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {index < deploymentStep ? (
                      <Check size={14} className="text-green-600 dark:text-green-400" />
                    ) : index === deploymentStep ? (
                      <RefreshCw size={14} className="text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </span>
                  <h3 className={`font-medium ${
                    index <= deploymentStep ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step}
                  </h3>
                </li>
              ))}
            </ol>
          </div>
        )}
        
        {/* Last Deployment Info */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="mr-2">Last deployment:</span>
          <span className="font-medium">
            {new Date(lastDeployment).toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Deployment Logs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <Terminal className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h2 className="text-xl font-semibold">Deployment Logs</h2>
        </div>
        
        <div className="bg-gray-900 text-gray-100 font-mono text-sm rounded-lg p-4 h-80 overflow-auto">
          {deploymentLog.length > 0 ? (
            deploymentLog.map((log, index) => (
              <div key={index} className="pb-1">
                <span className="text-gray-500">{log.substring(0, 24)}</span>
                <span className="ml-2">{log.substring(24)}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No deployment logs yet. Start a deployment to see logs.</div>
          )}
        </div>
      </div>
      
      {/* Informational Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              In a real implementation, these actions would trigger your back-end <code>promote.sh</code> script to handle the blue-green deployment process. The visualization above demonstrates how this would work in practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deployment;