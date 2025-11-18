import { useState, useEffect } from 'react';
import type { Weather } from '../types';

// WMO Weather interpretation codes to OpenWeatherMap icon codes
const weatherCodeMap: { [key: number]: { description: string; icon: string } } = {
  0: { description: 'Céu limpo', icon: '01' },
  1: { description: 'Principalmente limpo', icon: '02' },
  2: { description: 'Parcialmente nublado', icon: '03' },
  3: { description: 'Nublado', icon: '04' },
  45: { description: 'Nevoeiro', icon: '50' },
  48: { description: 'Nevoeiro com geada', icon: '50' },
  51: { description: 'Garoa Leve', icon: '09' },
  53: { description: 'Garoa Moderada', icon: '09' },
  55: { description: 'Garoa Intensa', icon: '09' },
  56: { description: 'Garoa Gelada Leve', icon: '09' },
  57: { description: 'Garoa Gelada Intensa', icon: '09' },
  61: { description: 'Chuva Leve', icon: '10' },
  63: { description: 'Chuva Moderada', icon: '10' },
  65: { description: 'Chuva Forte', icon: '10' },
  66: { description: 'Chuva Gelada Leve', icon: '10' },
  67: { description: 'Chuva Gelada Forte', icon: '10' },
  71: { description: 'Neve Leve', icon: '13' },
  73: { description: 'Neve Moderada', icon: '13' },
  75: { description: 'Neve Forte', icon: '13' },
  77: { description: 'Grãos de Neve', icon: '13' },
  80: { description: 'Pancadas de Chuva Leves', icon: '09' },
  81: { description: 'Pancadas de Chuva Moderadas', icon: '09' },
  82: { description: 'Pancadas de Chuva Violentas', icon: '09' },
  85: { description: 'Pancadas de Neve Leves', icon: '13' },
  86: { description: 'Pancadas de Neve Fortes', icon: '13' },
  95: { description: 'Trovoada', icon: '11' },
  96: { description: 'Trovoada com Granizo Leve', icon: '11' },
  99: { description: 'Trovoada com Granizo Forte', icon: '11' },
};

export const useWeatherData = (lat: number, lng: number) => {
  const [weatherData, setWeatherData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
        const locationUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

        const [weatherResponse, locationResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(locationUrl)
        ]);
        
        if (!weatherResponse.ok) throw new Error('Falha ao buscar dados do clima.');
        if (!locationResponse.ok) throw new Error('Falha ao buscar nome da localização.');

        const weatherDataJson = await weatherResponse.json();
        const locationDataJson = await locationResponse.json();
        
        if (!weatherDataJson.current) throw new Error('Dados do clima incompletos.');

        const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = weatherDataJson.current;
        const codeInfo = weatherCodeMap[weather_code] || { description: 'Desconhecido', icon: '01' };
        
        const locationName = locationDataJson.address?.city || locationDataJson.address?.town || locationDataJson.address?.village || 'Localização Desconhecida';
        
        setWeatherData({
          temp: Math.round(temperature_2m),
          description: codeInfo.description,
          icon: codeInfo.icon,
          windSpeed: Math.round(wind_speed_10m),
          humidity: relative_humidity_2m,
          locationName,
        });

      } catch (err: any) {
        setError('Erro ao carregar clima.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const handler = setTimeout(() => {
      fetchWeather();
    }, 500);

    return () => clearTimeout(handler);
  }, [lat, lng]);

  return { weatherData, loading, error };
};