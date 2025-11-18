import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, LoadingSpinner, XMarkIcon, MapPinIcon, UserIcon, ExclamationTriangleIcon } from './icons';
import type { Voluntario, Ocorrencia, SearchSuggestion } from '../types';

interface SearchBarProps {
  onSelect: (selection: SearchSuggestion) => void;
  voluntarios: Voluntario[];
  ocorrencias: Ocorrencia[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect, voluntarios, ocorrencias }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    setError(null);

    const localSuggestions: SearchSuggestion[] = [];
    const queryLower = searchQuery.toLowerCase();

    // Search local data first
    voluntarios
      .filter(v => v.nome.toLowerCase().includes(queryLower))
      .forEach(v => localSuggestions.push({ type: 'volunteer', data: v }));

    ocorrencias
      .filter(o => o.code.toLowerCase().includes(queryLower) || o.tipo.toLowerCase().includes(queryLower))
      .forEach(o => localSuggestions.push({ type: 'ocorrencia', data: o }));

    // Then perform remote search for locations
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=3`);
      if (!response.ok) throw new Error('Erro na rede.');
      const data = await response.json();
      const locationSuggestions: SearchSuggestion[] = data.map((d: any) => ({ type: 'location', data: d }));
      
      setSuggestions([...localSuggestions, ...locationSuggestions]);
    } catch (err) {
      setError('Falha ao buscar locais.');
      setSuggestions(localSuggestions); // Still show local results on remote error
    } finally {
      setLoading(false);
    }
  }, [voluntarios, ocorrencias]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setError(null);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(newQuery);
    }, 500);
  };
  
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSelect(suggestion);
    let displayName = '';
    switch(suggestion.type) {
        case 'location': displayName = suggestion.data.display_name; break;
        case 'volunteer': displayName = suggestion.data.nome; break;
        case 'ocorrencia': displayName = `${suggestion.data.tipo} (${suggestion.data.code})`; break;
    }
    setQuery(displayName);
    setSuggestions([]);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    } else {
        fetchSuggestions(query);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setError(null);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch(type) {
        case 'location': return <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />;
        case 'volunteer': return <UserIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />;
        case 'ocorrencia': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />;
    }
  };

  const getSuggestionDisplayName = (suggestion: SearchSuggestion) => {
    switch(suggestion.type) {
        case 'location': return suggestion.data.display_name;
        case 'volunteer': return suggestion.data.nome;
        case 'ocorrencia': return `${suggestion.data.tipo} (${suggestion.data.code})`;
    }
  };
  
  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch(type) {
        case 'location': return 'Local';
        case 'volunteer': return 'Voluntário';
        case 'ocorrencia': return 'Ocorrência';
    }
  };

  return (
    <div className="w-96" ref={searchBarRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar endereço, voluntário ou ocorrência..."
          className="w-full bg-gray-800/80 backdrop-blur-md border border-gray-700 text-white rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && !loading && (
            <button type="button" onClick={clearSearch} className="p-1 text-gray-400 hover:text-white" aria-label="Limpar busca">
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <button type="submit" disabled={loading} className="p-1 text-gray-400 hover:text-white disabled:text-gray-600" aria-label="Buscar">
            {loading ? <LoadingSpinner className="h-5 w-5" /> : <MagnifyingGlassIcon className="h-5 w-5" />}
          </button>
        </div>
      </form>
      {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
      
      {isFocused && (query.length > 1) && (
        <div className="absolute mt-2 w-96 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-[1100] overflow-hidden animate-fade-in-down">
          {suggestions.length > 0 ? (
            <ul className="divide-y divide-gray-700">
                {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${index}`}>
                    <button 
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left flex items-start p-3 hover:bg-cyan-600/30 transition-colors"
                    >
                    {renderSuggestionIcon(suggestion.type)}
                    <div className="flex-grow">
                        <span className="text-sm text-gray-200">{getSuggestionDisplayName(suggestion)}</span>
                        <span className="text-xs text-gray-500 block">{getSuggestionTypeLabel(suggestion.type)}</span>
                    </div>
                    </button>
                </li>
                ))}
            </ul>
          ) : !loading && (
            <p className="p-4 text-sm text-gray-500">Nenhum resultado encontrado.</p>
          )}
          {loading && (
              <div className="p-4 flex items-center justify-center">
                  <LoadingSpinner className="h-5 w-5 text-gray-400" />
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
