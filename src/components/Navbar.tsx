import React, { useState, useEffect, useRef } from 'react';
import { CitySearchResult } from '../types';
import {
  CloudSun,
  Search,
  MapPin,
  Compass,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';

interface NavbarProps {
  currentCity: string;
  onSelectCity: (city: CitySearchResult) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  tempUnit: 'C' | 'F';
  onToggleUnit: () => void;
  activeAlertCount: number;
}

const POPULAR_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.006, country: 'United States' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onSelectCity,
  onUseCurrentLocation,
  isLocating,
  tempUnit,
  onToggleUnit,
  activeAlertCount,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search locations:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: CitySearchResult) => {
    onSelectCity(item);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="font-bold text-slate-900 text-sm">A</span>
            </div>
            <div>
              <span className="text-xl font-semibold tracking-tight text-white flex items-center">
                Atmosphere<span className="text-blue-400">AI</span>
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (results.length > 0) setIsOpen(true);
                }}
                placeholder="Search any global city or coordinates..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />

              {isSearching ? (
                <Loader2 className="w-4 h-4 text-blue-400 absolute right-3 top-2.5 animate-spin" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Results Dropdown */}
            {isOpen && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
                {results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 transition-colors flex items-center justify-between text-sm group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-white">{r.name}</span>
                      {r.admin1 && (
                        <span className="text-xs text-slate-400">{r.admin1},</span>
                      )}
                      <span className="text-xs text-slate-400">{r.country}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {r.latitude.toFixed(1)}°, {r.longitude.toFixed(1)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls: Live Data Status, Geolocation, Units, Active Alerts badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Data Badge from Sleek Interface design */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">Live Global Data</span>
            </div>

            {activeAlertCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-900/30 text-rose-300 border border-rose-500/40 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{activeAlertCount} Alert{activeAlertCount > 1 ? 's' : ''}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              title="Locate via GPS"
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <Compass className="w-4 h-4 text-blue-400" />
              )}
              <span className="hidden md:inline">My Location</span>
            </button>

            {/* Celsius / Fahrenheit Toggle */}
            <button
              type="button"
              onClick={onToggleUnit}
              className="flex items-center rounded-xl bg-slate-900 border border-slate-700 p-1 text-xs font-bold transition-colors"
            >
              <span
                className={`px-2 py-1 rounded-lg transition-colors ${
                  tempUnit === 'C'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </span>
              <span
                className={`px-2 py-1 rounded-lg transition-colors ${
                  tempUnit === 'F'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search global city..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {isOpen && results.length > 0 && (
            <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm flex items-center justify-between"
                >
                  <span className="font-medium text-white">{r.name}, {r.country}</span>
                  <span className="text-xs text-slate-400">{r.admin1}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Popular Cities Bar */}
        <div className="flex items-center gap-1.5 py-2 border-t border-slate-800 text-xs overflow-x-auto scrollbar-none">
          <span className="text-slate-500 shrink-0 mr-1 uppercase text-[10px] font-bold tracking-wider">Popular:</span>
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity({
                id: Math.random(),
                name: city.name,
                latitude: city.lat,
                longitude: city.lon,
                country: city.country,
              })}
              className={`px-3 py-1 rounded-full shrink-0 transition-colors ${
                currentCity.toLowerCase() === city.name.toLowerCase()
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
