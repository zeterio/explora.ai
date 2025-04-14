'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { api } from '@/lib/api';

interface HealthResponse {
  status: string;
  message: string;
  version: string;
  timestamp: string;
  environment: string;
}

/**
 * API Status component
 * 
 * Displays the current connection status to the backend API
 * by making a request to the health check endpoint.
 */
export function ApiStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [apiInfo, setApiInfo] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const data = await api.get<HealthResponse>('health');
        setApiInfo(data);
        setStatus('connected');
      } catch (err) {
        console.error('API connection error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to API');
      }
    };

    checkApiStatus();
  }, []);

  return (
    <Card title="API Connection Status">
      <div className="p-4">
        {status === 'loading' && (
          <div className="flex items-center">
            <div className="animate-pulse h-2 w-2 bg-yellow-400 rounded-full mr-2"></div>
            <p>Connecting to API...</p>
          </div>
        )}

        {status === 'connected' && apiInfo && (
          <div>
            <div className="flex items-center mb-4">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <p className="text-green-700 font-medium">Connected to API</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Status:</span>
              <span>{apiInfo.status}</span>
              
              <span className="text-gray-500">Message:</span>
              <span>{apiInfo.message}</span>
              
              <span className="text-gray-500">API Version:</span>
              <span>{apiInfo.version}</span>
              
              <span className="text-gray-500">Environment:</span>
              <span>{apiInfo.environment}</span>
              
              <span className="text-gray-500">Last Check:</span>
              <span>{new Date(apiInfo.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="flex items-center mb-2">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
              <p className="text-red-700 font-medium">API Connection Error</p>
            </div>
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </Card>
  );
} 