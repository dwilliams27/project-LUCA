import { AVAILABLE_MODELS, LLM_PROVIDERS, type LLMProvider } from '@/types/ipc-shared';
import { IpcService } from '@/services/ipc.service';
import { gameStore, useCostMetricsStore, useServiceStore } from '@/store/game-store';
import React, { useEffect, useState } from 'react';

const REFRESH_INTERVAL = 5000; // 5 seconds

interface LlmInfoProps {
  provider: LLMProvider;
  setProvider: (provider: LLMProvider) => void;
  model: string;
  setModel: (model: string) => void;
}

export const LlmInfo: React.FC<LlmInfoProps> = ({
  provider,
  setProvider,
  model,
  setModel,
}) => {
  const costMetrics = useCostMetricsStore();
  const { gameServiceLocator } = useServiceStore();
  const [isLoading, setIsLoading] = useState(false);

  // Handler for provider changes
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as LLMProvider;
    setProvider(newProvider);
    // Auto select the first model for the new provider
    setModel(AVAILABLE_MODELS[newProvider][0]);
  };

  // Handler for model changes
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  // Fetch cost metrics periodically
  useEffect(() => {
    const fetchCostMetrics = async () => {
      try {
        setIsLoading(true);
        const ipcService = gameServiceLocator.getService(IpcService);
        const metrics = await ipcService.getLlmCostMetrics();
        
        // Update the store with the fetched metrics
        gameStore.getState().updateCostMetrics({
          totalCost: metrics.totalCost,
          totalInputTokens: metrics.totalInputTokens,
          totalOutputTokens: metrics.totalOutputTokens
        });
      } catch (error) {
        console.error('Failed to fetch cost metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch metrics immediately
    fetchCostMetrics();

    // Set up periodic refresh
    const intervalId = setInterval(fetchCostMetrics, REFRESH_INTERVAL);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [gameServiceLocator]);

  return (
    <div className="px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-md border border-gray-600 flex items-center space-x-6">
      {/* Provider Selector */}
      <div className="flex items-center space-x-2 min-w-[180px]">
        <span className="text-gray-300 whitespace-nowrap">Provider:</span>
        <select 
          value={provider}
          onChange={handleProviderChange}
          className="bg-gray-800 text-white border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
        >
          {Object.values(LLM_PROVIDERS).map(provider => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selector */}
      <div className="flex items-center space-x-2 min-w-[240px]">
        <span className="text-gray-300 whitespace-nowrap">Model:</span>
        <select 
          value={model}
          onChange={handleModelChange}
          className="bg-gray-800 text-white border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
        >
          {AVAILABLE_MODELS[provider].map(modelName => (
            <option key={modelName} value={modelName}>
              {modelName}
            </option>
          ))}
        </select>
      </div>

      {/* Cost Display */}
      <div className="flex items-center border-l border-gray-600 pl-6">
        <div className="font-medium">
          <span className="text-gray-300 mr-2">Cost:</span>
          <span className="text-green-400 text-lg font-bold">${costMetrics.totalCost.toFixed(4)}</span>
          {isLoading && (
            <span className="ml-2 inline-block">
              <span className="animate-pulse text-blue-400">●</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};