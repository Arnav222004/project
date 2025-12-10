// src/pages/UserDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Filter, Loader, Target } from 'lucide-react';
import ParkingCard from '../components/ParkingCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/Filterpanel';
import { 
  getNearbyParking, 
  getUserLocation, 
  findNearestParking,
  filterParking,
  getMarkerColor 
} from '../services/parkingService';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '1.5rem'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const libraries = ['places'];

const UserDashboard = () => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState('');
  const [filters, setFilters] = useState({
    minAvailability: 0,
    maxPrice: 1000,
    type: 'all',
    minRating: 0,
    sortBy: 'distance'
  });

  useEffect(() => {
    loadUserLocationAndParking();
  }, []);

  useEffect(() => {
    if (parkingSpots.length > 0) {
      const filtered = filterParking(parkingSpots, filters);
      setFilteredSpots(filtered);
    }
  }, [parkingSpots, filters]);

  const loadUserLocationAndParking = async () => {
    try {
      setLoading(true);
      
      const location = await getUserLocation();
      setUserLocation(location);
      setCurrentLocationName('Your Current Location');

      const result = await getNearbyParking(location.lat, location.lng, 50);
      if (result.success) {
        setParkingSpots(result.data);
        setFilteredSpots(result.data);
      }
    } catch (error) {
      console.error('Error loading location:', error);
      setCurrentLocationName('New Delhi (Default)');
      const result = await getNearbyParking(defaultCenter.lat, defaultCenter.lng, 50);
      if (result.success) {
        setParkingSpots(result.data);
        setFilteredSpots(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (location) => {
    try {
      setLoading(true);
      setSearchedLocation(location);
      setCurrentLocationName(location.name);
      
      const result = await getNearbyParking(location.lat, location.lng, 50);
      
      if (result.success) {
        setParkingSpots(result.data);
        setFilteredSpots(result.data);
        
        if (map) {
          map.panTo({ lat: location.lat, lng: location.lng });
          map.setZoom(13);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Failed to search this location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await getUserLocation();
      setUserLocation(location);
      setSearchedLocation(null);
      setCurrentLocationName('Your Current Location');
      
      const result = await getNearbyParking(location.lat, location.lng, 50);
      if (result.success) {
        setParkingSpots(result.data);
        setFilteredSpots(result.data);
        
        if (map) {
          map.panTo(location);
          map.setZoom(13);
        }
      }
    } catch (error) {
      alert('Unable to get your location. Please enable location services.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleFindNearest = async () => {
    const location = searchedLocation || userLocation;
    
    if (!location) {
      try {
        setLocationLoading(true);
        const userLoc = await getUserLocation();
        setUserLocation(userLoc);
        
        const result = await findNearestParking(userLoc.lat, userLoc.lng);
        if (result.success && result.data) {
          setSelectedParking(result.data);
          if (map) {
            map.panTo(result.data.location);
            map.setZoom(15);
          }
        }
      } catch (error) {
        alert('Unable to get your location. Please enable location services.');
      } finally {
        setLocationLoading(false);
      }
    } else {
      const result = await findNearestParking(location.lat, location.lng);
      if (result.success && result.data) {
        setSelectedParking(result.data);
        if (map) {
          map.panTo(result.data.location);
          map.setZoom(15);
        }
      }
    }
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredSpots(parkingSpots);
      return;
    }

    const filtered = parkingSpots.filter(spot => 
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSpots(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const handleMarkerClick = (parking) => {
    setSelectedParking(parking);
    if (map) {
      map.panTo(parking.location);
    }
  };

  const handleCardClick = (parking) => {
    setSelectedParking(parking);
    if (map) {
      map.panTo(parking.location);
      map.setZoom(15);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayCenter = searchedLocation || userLocation || defaultCenter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Find Parking Anywhere in India
          </h1>
          <p className="text-gray-600 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Showing results near: <span className="font-semibold text-purple-600">{currentLocationName}</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {filteredSpots.length} parking spots available
          </p>
        </div>

        <LoadScript 
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
        >
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex-1">
              <SearchBar 
                onSearch={handleSearch} 
                onLocationSelect={handleLocationSelect}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg"
              >
                {locationLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                Use My Location
              </button>
              
              <button
                onClick={handleFindNearest}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Navigation className="w-5 h-5" />
                Find Nearest
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6">
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
            </div>
          )}

          <div className="mb-8 bg-white rounded-3xl shadow-2xl p-4">
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={displayCenter}
                zoom={13}
                onLoad={onLoad}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {userLocation && !searchedLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                      scale: 10,
                      fillColor: '#4F46E5',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3,
                    }}
                  />
                )}

                {searchedLocation && (
                  <Marker
                    position={{ lat: searchedLocation.lat, lng: searchedLocation.lng }}
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                      scale: 12,
                      fillColor: '#A855F7',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3,
                    }}
                  />
                )}

                {filteredSpots.map((parking) => (
                  <Marker
                    key={parking.id}
                    position={parking.location}
                    onClick={() => handleMarkerClick(parking)}
                    icon={{
                      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                      fillColor: getMarkerColor(parking.availableSlots, parking.totalSlots),
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                      scale: 1.5,
                      anchor: { x: 12, y: 24 }
                    }}
                  />
                ))}

                {selectedParking && (
                  <InfoWindow
                    position={selectedParking.location}
                    onCloseClick={() => setSelectedParking(null)}
                  >
                    <div className="p-3 max-w-xs">
                      <h3 className="font-bold text-lg mb-2">{selectedParking.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{selectedParking.address}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-600">
                          ₹{selectedParking.price}/hr
                        </span>
                        <span className={`text-sm font-semibold ${
                          selectedParking.availabilityPercentage > 50 ? 'text-green-600' :
                          selectedParking.availabilityPercentage >= 20 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {selectedParking.availableSlots}/{selectedParking.totalSlots} available
                        </span>
                      </div>
                      {selectedParking.distance && (
                        <p className="text-xs text-gray-500">
                          📍 {selectedParking.distanceText} away
                        </p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
        </LoadScript>

        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Map Legend:</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">High Availability (&gt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Medium (20-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Low (&lt;20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
              <span className="text-sm text-gray-600">Your Location</span>
            </div>
            {searchedLocation && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Searched Location</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Parking Spots ({filteredSpots.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map((parking) => (
              <ParkingCard
                key={parking.id}
                parking={parking}
                onSelect={handleCardClick}
                isSelected={selectedParking?.id === parking.id}
              />
            ))}
          </div>

          {filteredSpots.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No parking spots found
              </h3>
              <p className="text-gray-600 mb-4">
                Try searching for a different location or adjust your filters
              </p>
              <button
                onClick={handleUseCurrentLocation}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
              >
                Use My Current Location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;