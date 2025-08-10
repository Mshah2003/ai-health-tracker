import React, { useState } from 'react';
import { Key, AlertTriangle } from 'lucide-react';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }
    setError('');
    onApiKeySet(apiKey.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            API Configuration
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter your Google Gemini API key to enable AI features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Enter your API key"
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-teal-600 hover:to-purple-600 focus:ring-4 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all duration-200 font-medium"
          >
            Continue
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How to get your API key:</strong><br />
            1. Go to Google AI Studio<br />
            2. Sign in with your Google account<br />
            3. Create a new API key<br />
            4. Copy and paste it here
          </p>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Your API key is never shared. It's only used to communicate with Google's AI services.
        </p>
      </div>
    </div>
  );
};