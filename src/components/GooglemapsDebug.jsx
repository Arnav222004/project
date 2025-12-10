// src/components/GoogleMapsDebug.jsx
// Temporary component to diagnose Google Maps issues

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const GoogleMapsDebug = () => {
  const [checks, setChecks] = useState({
    envKey: null,
    googleLoaded: null,
    placesLoaded: null,
    autocompleteService: null,
    geocoderService: null,
    apiKeyValid: null
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = { ...checks };

    // Check 1: Environment variable
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    results.envKey = apiKey ? 'pass' : 'fail';
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

    // Check 2: Google Maps loaded
    results.googleLoaded = window.google ? 'pass' : 'fail';
    console.log('Google object:', window.google ? '✅ Loaded' : '❌ Not loaded');

    // Check 3: Places API loaded
    results.placesLoaded = window.google?.maps?.places ? 'pass' : 'fail';
    console.log('Places API:', window.google?.maps?.places ? '✅ Loaded' : '❌ Not loaded');

    // Check 4: Autocomplete Service
    if (window.google?.maps?.places) {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        results.autocompleteService = 'pass';
        console.log('AutocompleteService:', '✅ Created successfully');

        // Check 5: Test API call
        service.getPlacePredictions(
          {
            input: 'Delhi',
            componentRestrictions: { country: 'in' }
          },
          (predictions, status) => {
            console.log('Test query status:', status);
            console.log('Test predictions:', predictions);

            if (status === 'OK') {
              results.apiKeyValid = 'pass';
            } else if (status === 'REQUEST_DENIED') {
              results.apiKeyValid = 'fail';
              console.error('❌ API Key Issue: Request denied. Check API key restrictions.');
            } else if (status === 'ZERO_RESULTS') {
              results.apiKeyValid = 'warning';
              console.warn('⚠️ No results but API is working');
            } else {
              results.apiKeyValid = 'fail';
              console.error('❌ API Error:', status);
            }
            setChecks({ ...results });
          }
        );
      } catch (error) {
        results.autocompleteService = 'fail';
        console.error('AutocompleteService error:', error);
      }
    } else {
      results.autocompleteService = 'fail';
    }

    // Check 6: Geocoder Service
    if (window.google?.maps) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        results.geocoderService = 'pass';
        console.log('Geocoder:', '✅ Created successfully');
      } catch (error) {
        results.geocoderService = 'fail';
        console.error('Geocoder error:', error);
      }
    } else {
      results.geocoderService = 'fail';
    }

    setChecks({ ...results });
  };

  const getIcon = (status) => {
    if (status === 'pass') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-red-600" />;
    if (status === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <div className="w-5 h-5 border-2 border-gray-300 rounded-full animate-pulse" />;
  };

  const getStatusText = (status) => {
    if (status === 'pass') return 'Pass';
    if (status === 'fail') return 'Fail';
    if (status === 'warning') return 'Warning';
    return 'Checking...';
  };

  const getStatusColor = (status) => {
    if (status === 'pass') return 'text-green-600';
    if (status === 'fail') return 'text-red-600';
    if (status === 'warning') return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🔍 Google Maps Diagnostics
      </h3>

      <div className="space-y-3">
        {/* Check 1 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">API Key in Environment</span>
          <div className="flex items-center gap-2">
            {getIcon(checks.envKey)}
            <span className={`font-semibold ${getStatusColor(checks.envKey)}`}>
              {getStatusText(checks.envKey)}
            </span>
          </div>
        </div>

        {/* Check 2 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Google Maps Loaded</span>
          <div className="flex items-center gap-2">
            {getIcon(checks.googleLoaded)}
            <span className={`font-semibold ${getStatusColor(checks.googleLoaded)}`}>
              {getStatusText(checks.googleLoaded)}
            </span>
          </div>
        </div>

        {/* Check 3 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Places API Loaded</span>
          <div className="flex items-center gap-2">
            {getIcon(checks.placesLoaded)}
            <span className={`font-semibold ${getStatusColor(checks.placesLoaded)}`}>
              {getStatusText(checks.placesLoaded)}
            </span>
          </div>
        </div>

        {/* Check 4 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Autocomplete Service</span>
          <div className="flex items-center gap-2">
            {getIcon(checks.autocompleteService)}
            <span className={`font-semibold ${getStatusColor(checks.autocompleteService)}`}>
              {getStatusText(checks.autocompleteService)}
            </span>
          </div>
        </div>

        {/* Check 5 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Geocoder Service</span>
          <div className="flex items-center gap-2">
            {getIcon(checks.geocoderService)}
            <span className={`font-semibold ${getStatusColor(checks.geocoderService)}`}>
              {getStatusText(checks.geocoderService)}
            </span>
          </div>
        </div>

        {/* Check 6 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">API Key Valid (Test Query)</span>
          <div className="flex items-center gap-2">
            {getIcon(checks.apiKeyValid)}
            <span className={`font-semibold ${getStatusColor(checks.apiKeyValid)}`}>
              {getStatusText(checks.apiKeyValid)}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm font-semibold text-blue-900 mb-2">How to Fix Issues:</p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>API Key Missing:</strong> Add VITE_GOOGLE_MAPS_API_KEY to .env file</li>
          <li><strong>APIs Not Loaded:</strong> Wait a few seconds for Google Maps to load</li>
          <li><strong>Request Denied:</strong> Check API key restrictions in Google Cloud Console</li>
          <li><strong>Make sure these APIs are enabled:</strong>
            <ul className="ml-6 mt-1 space-y-1">
              <li>• Maps JavaScript API</li>
              <li>• Places API</li>
              <li>• Geocoding API</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={runDiagnostics}
        className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        🔄 Run Diagnostics Again
      </button>

      {/* Console Note */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        💡 Check browser console (F12) for detailed logs
      </p>
    </div>
  );
};

export default GoogleMapsDebug;