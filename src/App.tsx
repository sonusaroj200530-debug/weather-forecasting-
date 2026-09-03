import React, { useState, useEffect, useCallback } from 'react';
import { WeatherData, ChatMessage, CitySearchResult } from './types';
import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { AirQualityCard } from './components/AirQualityCard';
import { ClimateSection } from './components/ClimateSection';
import { ChatInterface } from './components/ChatInterface';
import {
  Sparkles,
  CloudSun,
  Bot,
  Compass,
  AlertTriangle,
  Loader2,
  Calendar,
  Wind
} from 'lucide-react';

const DEFAULT_CITY = {
  name: 'New York',
  lat: 40.7128,
  lon: -74.006,
  country: 'United States',
};

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('atmosphere_temp_unit') as 'C' | 'F') || 'C';
  });
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'dashboard'>('dashboard');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: `Welcome to **AtmosphereAI**! 🌦️\n\nI am your live meteorological forecaster, severe weather risk alert bot, and global climate intelligence system.\n\nAsk me anything about current conditions, 7-day precipitation outlooks, storm & heat safety advisories, air quality index, or long-term climate patterns for any city worldwide.`,
        timestamp: new Date().toISOString(),
        suggestedFollowUps: [
          'Will it rain this week?',
          'Check active severe weather alerts',
          'Explain local climate norms and trends',
        ],
      },
    ];
  });

  const toggleTempUnit = () => {
    const nextUnit = tempUnit === 'C' ? 'F' : 'C';
    setTempUnit(nextUnit);
    localStorage.setItem('atmosphere_temp_unit', nextUnit);
  };

  // Fetch live weather data
  const loadWeatherData = useCallback(
    async (lat: number, lon: number, cityName: string, countryName: string = '') => {
      setIsLoadingWeather(true);
      try {
        const url = `/api/weather/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}&country=${encodeURIComponent(countryName)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to retrieve meteorological data');
        const data: WeatherData = await res.json();
        setWeather(data);
      } catch (err) {
        console.error('Failed to load weather:', err);
      } finally {
        setIsLoadingWeather(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadWeatherData(DEFAULT_CITY.lat, DEFAULT_CITY.lon, DEFAULT_CITY.name, DEFAULT_CITY.country);
  }, [loadWeatherData]);

  // Geolocation handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode via Open-Meteo or generic fallback
          const revRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
          );
          let cityName = 'Current Location';
          let countryName = '';
          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData.results?.[0]) {
              cityName = revData.results[0].name;
              countryName = revData.results[0].country || '';
            }
          }
          await loadWeatherData(latitude, longitude, cityName, countryName);
        } catch {
          await loadWeatherData(latitude, longitude, 'Current Location');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSelectCity = (city: CitySearchResult) => {
    loadWeatherData(city.latitude, city.longitude, city.name, city.country);
  };

  // Send message to AI
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const cityContext = weather
        ? {
            name: weather.city,
            country: weather.country,
            lat: weather.latitude,
            lon: weather.longitude,
          }
        : DEFAULT_CITY;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          cityContext,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error('Chat API returned an error');

      const data = await res.json();

      // If the response brought back updated weather data for a new location, sync it!
      if (data.weatherData) {
        setWeather(data.weatherData);
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is the meteorological analysis for your query.',
        timestamp: new Date().toISOString(),
        weatherData: data.weatherData || undefined,
        alerts: data.weatherData?.alerts || undefined,
        suggestedFollowUps: data.followUps || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an issue processing meteorological intelligence. Please try asking again or check your location query.',
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        currentCity={weather?.city || DEFAULT_CITY.name}
        onSelectCity={handleSelectCity}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
        tempUnit={tempUnit}
        onToggleUnit={toggleTempUnit}
        activeAlertCount={weather?.alerts?.length || 0}
      />

      {/* Mobile Tab Toggle */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 pt-4 w-full">
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700">
          <button
            type="button"
            onClick={() => setMobileTab('dashboard')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            Forecast & Radar
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all relative ${
              mobileTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Meteorologist
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Meteorological Dashboard (Forecasts, Alerts, AQI, Climate) */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              mobileTab === 'dashboard' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Severe Weather Alert Banner (Prominent when active) */}
            {weather && weather.alerts && weather.alerts.length > 0 && (
              <AlertBanner alerts={weather.alerts} />
            )}

            {/* Current Weather Card */}
            {weather ? (
              <CurrentWeatherCard
                weather={weather}
                tempUnit={tempUnit}
                onRefresh={() =>
                  loadWeatherData(weather.latitude, weather.longitude, weather.city, weather.country)
                }
                isLoading={isLoadingWeather}
              />
            ) : (
              <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}

            {/* Hourly Forecast Strip */}
            {weather && (
              <HourlyForecast hourly={weather.hourly} tempUnit={tempUnit} />
            )}

            {/* 7-Day Outlook */}
            {weather && (
              <DailyForecast daily={weather.daily} tempUnit={tempUnit} />
            )}

            {/* Air Quality & Climate Normals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {weather && <AirQualityCard airQuality={weather.airQuality} />}
              {weather && <ClimateSection climate={weather.climate} />}
            </div>
          </div>

          {/* Right Column: Conversational AI Bot */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 ${
              mobileTab === 'chat' ? 'block' : 'hidden lg:block'
            }`}
          >
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingChat}
              onClearHistory={() =>
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    sender: 'assistant',
                    text: `Conversation reset. Ask AtmosphereAI about live forecasts, severe alerts, or climate patterns for **${weather?.city || 'any city'}**.`,
                    timestamp: new Date().toISOString(),
                    suggestedFollowUps: [
                      `What is the weekend forecast for ${weather?.city || 'here'}?`,
                      `Are there any active weather alerts?`,
                      `Explain local climate records and trends`,
                    ],
                  },
                ])
              }
              tempUnit={tempUnit}
              currentCity={weather?.city || DEFAULT_CITY.name}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AtmosphereAI • Powered by Google Gemini Intelligence & Open-Meteo Global Meteorological Observations
          </span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Severe Weather Alerts</span>
            <span>•</span>
            <span>Climate Norms</span>
            <span>•</span>
            <span>7-Day Synoptic Models</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
