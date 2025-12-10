// src/components/SearchBar.jsx
// FIXED: Search suggestions now correctly show Cities (Delhi, Deoria, etc.)

import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader } from 'lucide-react';

const SearchBar = ({ onSearch, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [serviceReady, setServiceReady] = useState(false);
  
  const autocompleteService = useRef(null);
  const geocoder = useRef(null);
  const dropdownRef = useRef(null);

  // Wait for Google Maps to load
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          geocoder.current = new window.google.maps.Geocoder();
          setServiceReady(true);
          console.log('✅ Google Maps Autocomplete ready');
        } catch (error) {
          console.error('Error initializing Google Maps:', error);
          setTimeout(checkGoogleMaps, 500); // Retry
        }
      } else {
        setTimeout(checkGoogleMaps, 500); // Retry
      }
    };

    checkGoogleMaps();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Start fetching predictions if query is long enough
    if (value.length >= 2 && serviceReady) {
      fetchPredictions(value);
    } else {
      setPredictions([]);
      setShowDropdown(false);
    }
  };

  const fetchPredictions = async (input) => {
    if (!autocompleteService.current || !serviceReady) {
      console.warn('Autocomplete service not ready');
      return;
    }

    setIsLoading(true);
    
    try {
      const request = {
        input: input,
        componentRestrictions: { country: 'in' }, // Restrict to India
        // FIX: Changed to only '(cities)' to fix the issue where Delhi/Deoria weren't showing.
        // Mixing 'establishment' and '(cities)' often returns zero results.
        types: ['(cities)'] 
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        
        console.log('Autocomplete status:', status);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
          setShowDropdown(true);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([]);
          setShowDropdown(false);
        } else {
          console.error('Autocomplete error:', status);
          setPredictions([]);
          setShowDropdown(false);
        }
      });
    } catch (error) {
      console.error('Autocomplete error:', error);
      setIsLoading(false);
      setPredictions([]);
    }
  };

  const handleSelectPrediction = async (prediction) => {
    setSearchQuery(prediction.description);
    setShowDropdown(false);
    setPredictions([]);
    setIsLoading(true);

    // Get coordinates for the selected place
    if (geocoder.current) {
      try {
        geocoder.current.geocode({ placeId: prediction.place_id }, (results, status) => {
          setIsLoading(false);
          
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            console.log('Selected location:', { lat, lng, name: prediction.description });
            
            // Notify parent component about location selection
            if (onLocationSelect) {
              onLocationSelect({
                lat,
                lng,
                name: prediction.description,
                placeId: prediction.place_id
              });
            }
          } else {
            console.error('Geocoding failed:', status);
            alert('Failed to get location coordinates');
          }
        });
      } catch (error) {
        console.error('Geocoding error:', error);
        setIsLoading(false);
        alert('Error getting location coordinates');
      }
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setPredictions([]);
    setShowDropdown(false);
    onSearch('');
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search by city (e.g., Delhi, Mumbai)..."
          className="w-full pl-12 pr-12 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 bg-white shadow-lg"
          autoComplete="off"
        />

        {/* Loading or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {isLoading ? (
            <Loader className="h-5 w-5 text-purple-600 animate-spin" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Service Status Indicator (only in dev mode) */}
      {!serviceReady && searchQuery.length >= 2 && (
        <div className="absolute z-10 w-full mt-2 text-xs text-orange-600 pl-4">
          ⏳ Loading Google Maps services...
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-down max-h-96 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectPrediction(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showDropdown && predictions.length === 0 && searchQuery.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No locations found for "{searchQuery}"</p>
          <p className="text-xs text-gray-400 mt-1">Try searching for a city</p>
        </div>
      )}

      {/* Helper Text */}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className="absolute z-10 w-full mt-2 text-xs text-gray-500 pl-4">
          Type at least 2 characters to see suggestions...
        </div>
      )}
    </form>
  );
};

export default SearchBar;