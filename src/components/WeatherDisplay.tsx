import React from 'react';
import type { Weather } from '../types';
import { LoadingSpinner, WeatherConditionIcon, WindIcon, WaterDropIcon, ExclamationTriangleIcon } from './icons';

interface WeatherDisplayProps {
  weatherData: Weather | null;
  loading: boolean;
  error: string | null;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, loading, error }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 w-full p-4 text-white animate-fade-in-up">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner className="h-6 w-6 text-gray-400" />
          <span className="ml-3 text-sm text-gray-400">Carregando clima...</span>
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center text-red-400">
           <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
           <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
      {weatherData && !loading && !error && (
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400">{weatherData.locationName}</p>
              <p className="text-4xl font-bold">{weatherData.temp}°C</p>
              <p className="text-sm text-gray-300 capitalize">{weatherData.description}</p>
            </div>
            <WeatherConditionIcon iconCode={weatherData.icon} className="w-16 h-16 text-yellow-300" />
          </div>
          <div className="border-t border-gray-700 mt-3 pt-3 flex justify-around text-xs">
            <div className="flex items-center">
              <WindIcon className="w-4 h-4 mr-1.5 text-cyan-400" />
              <span>{weatherData.windSpeed} km/h</span>
            </div>
            <div className="flex items-center">
              <WaterDropIcon className="w-4 h-4 mr-1.5 text-blue-400" />
              <span>{weatherData.humidity}% umid.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;