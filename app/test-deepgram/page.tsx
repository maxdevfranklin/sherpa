'use client';

import React, { useState } from 'react';
import DeepgramTest from '@/src/components/DeepgramTest';

export default function TestDeepgramPage() {
  const [apiKey, setApiKey] = useState('');
  const [showTest, setShowTest] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowTest(true);
    }
  };

  if (showTest) {
    return <DeepgramTest apiKey={apiKey} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Deepgram Test Setup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              Deepgram API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Deepgram API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Test
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">Getting Your API Key:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Visit <a href="https://console.deepgram.com/" target="_blank" rel="noopener noreferrer" className="underline">Deepgram Console</a></li>
            <li>2. Sign up or log in to your account</li>
            <li>3. Create a new project or use existing</li>
            <li>4. Go to API Keys section</li>
            <li>5. Generate a new API key</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This test page is for development purposes only. 
            Your API key is only used locally and not stored or transmitted.
          </p>
        </div>
      </div>
    </div>
  );
}
