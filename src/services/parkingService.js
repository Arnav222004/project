// src/services/parkingService.js
// IMPROVED VERSION with better error handling and retry logic

import axios from 'axios';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Helper: Delay function for retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Retry logic
const retryOperation = async (operation, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(RETRY_DELAY * (i + 1));
    }
  }
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate mock availability for parking spots
const generateMockAvailability = () => {
  const totalSlots = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
  const availableSlots = Math.floor(Math.random() * totalSlots);
  return {
    totalSlots,
    availableSlots,
    price: Math.floor(Math.random() * (80 - 20 + 1)) + 20,
    lastUpdated: new Date().toISOString()
  };
};

// Get availability percentage
export const getAvailabilityPercentage = (availableSlots, totalSlots) => {
  if (totalSlots === 0) return 0;
  return (availableSlots / totalSlots) * 100;
};

// Get marker color based on availability
export const getMarkerColor = (availableSlots, totalSlots) => {
  const percentage = getAvailabilityPercentage(availableSlots, totalSlots);
  if (percentage > 50) return '#10B981'; // Green
  if (percentage >= 20) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
};

// Determine parking type from Google place types
const determineParkingType = (types = []) => {
  if (types.includes('parking') && types.includes('shopping_mall')) return 'Covered';
  if (types.includes('parking') && types.includes('airport')) return 'Multi-level';
  return 'Open';
};

// Mock database for parking availability
const parkingDatabase = {};

// Fetch from Google Places API with retry
const fetchFromGooglePlaces = async (lat, lng, radius = 5000) => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found');
    return [];
  }

  try {
    return await retryOperation(async () => {
      // IMPORTANT: This proxy is for development only
      // For production, use a backend server to make the API call
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=parking&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await axios.get(proxyUrl + encodeURIComponent(googleUrl), {
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data?.results) {
        return response.data.results;
      }
      return [];
    });
  } catch (error) {
    console.error('Google Places API error:', error.message);
    return [];
  }
};

// Fallback mock data
const getFallbackMockData = (lat, lng, radius) => {
  const mockData = [
    { name: "Connaught Place Parking", lat: 28.6304, lng: 77.2177, address: "Connaught Place, New Delhi", slots: 100, type: "Covered" },
    { name: "Rajiv Chowk Metro", lat: 28.6328, lng: 77.2197, address: "Rajiv Chowk, New Delhi", slots: 80, type: "Open" },
    { name: "India Gate Parking", lat: 28.6129, lng: 77.2295, address: "India Gate, New Delhi", slots: 150, type: "Open" },
    { name: "Saket Mall", lat: 28.5244, lng: 77.2066, address: "Saket, New Delhi", slots: 200, type: "Covered" },
    { name: "Indirapuram Mall", lat: 28.6410, lng: 77.3671, address: "Indirapuram, Ghaziabad", slots: 150, type: "Covered" },
    { name: "Shipra Mall", lat: 28.6461, lng: 77.3771, address: "Shipra Mall, Ghaziabad", slots: 200, type: "Covered" },
    { name: "Vaishali Metro", lat: 28.6490, lng: 77.3409, address: "Vaishali, Ghaziabad", slots: 100, type: "Open" },
    { name: "Phoenix Market City", lat: 19.0868, lng: 72.8906, address: "Kurla, Mumbai", slots: 300, type: "Multi-level" },
    { name: "Bandra Station", lat: 19.0544, lng: 72.8406, address: "Bandra, Mumbai", slots: 120, type: "Open" },
    { name: "UB City Parking", lat: 12.9716, lng: 77.5946, address: "UB City, Bangalore", slots: 250, type: "Covered" },
    { name: "MG Road Metro", lat: 12.9759, lng: 77.6069, address: "MG Road, Bangalore", slots: 150, type: "Open" },
  ];
  
  const parkingWithDistance = mockData.map((parking, index) => {
    const distance = calculateDistance(lat, lng, parking.lat, parking.lng);
    const availableSlots = Math.floor(Math.random() * parking.slots);
    
    return {
      id: `mock_${index + 1}`,
      name: parking.name,
      location: { lat: parking.lat, lng: parking.lng },
      address: parking.address,
      totalSlots: parking.slots,
      availableSlots: availableSlots,
      price: Math.floor(Math.random() * 60) + 20,
      type: parking.type,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      distance: distance.toFixed(2),
      distanceText: distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`,
      availabilityPercentage: getAvailabilityPercentage(availableSlots, parking.slots),
      isGooglePlace: false
    };
  });
  
  return parkingWithDistance
    .filter(p => parseFloat(p.distance) <= radius)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// Main function: Get nearby parking
export const getNearbyParking = async (lat, lng, radius = 50) => {
  try {
    // Validate inputs
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates');
    }

    // Try Google Places first
    const googlePlaces = await fetchFromGooglePlaces(lat, lng, radius * 1000);
    
    if (googlePlaces.length > 0) {
      const parkingSpots = googlePlaces.map((place, index) => {
        const placeId = place.place_id;
        
        if (!parkingDatabase[placeId]) {
          parkingDatabase[placeId] = generateMockAvailability();
        }
        
        const availability = parkingDatabase[placeId];
        const distance = calculateDistance(
          lat, lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        
        return {
          id: placeId,
          name: place.name || `Parking ${index + 1}`,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          address: place.vicinity || place.formatted_address || 'Address not available',
          totalSlots: availability.totalSlots,
          availableSlots: availability.availableSlots,
          price: availability.price,
          type: determineParkingType(place.types),
          rating: place.rating || 4.0,
          distance: distance.toFixed(2),
          distanceText: distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`,
          availabilityPercentage: getAvailabilityPercentage(
            availability.availableSlots,
            availability.totalSlots
          ),
          isGooglePlace: true,
          placeId: placeId
        };
      });
      
      const sortedParking = parkingSpots
        .filter(p => parseFloat(p.distance) <= radius)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      
      if (sortedParking.length > 0) {
        return {
          success: true,
          data: sortedParking,
          source: 'google_places'
        };
      }
    }
    
    // Fallback to mock data
    const mockData = getFallbackMockData(lat, lng, radius);
    return {
      success: true,
      data: mockData,
      source: 'mock_fallback'
    };
    
  } catch (error) {
    console.error('Error fetching parking data:', error);
    
    // Always provide fallback data
    const mockData = getFallbackMockData(lat, lng, radius);
    return {
      success: true,
      data: mockData,
      source: 'mock_fallback',
      error: error.message
    };
  }
};

// Get user location with better error messages
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  });
};

// Find nearest parking
export const findNearestParking = async (userLat, userLng) => {
  try {
    const result = await getNearbyParking(userLat, userLng, 50);
    if (result.success && result.data.length > 0) {
      return {
        success: true,
        data: result.data[0]
      };
    }
    return {
      success: false,
      error: 'No parking found nearby'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Filter parking
export const filterParking = (parkingList, filters) => {
  let filtered = [...parkingList];

  if (filters.minAvailability) {
    filtered = filtered.filter(p => p.availabilityPercentage >= filters.minAvailability);
  }

  if (filters.maxPrice) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice);
  }

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
  }

  if (filters.minRating) {
    filtered = filtered.filter(p => parseFloat(p.rating) >= filters.minRating);
  }

  // Sort
  switch(filters.sortBy) {
    case 'distance':
      filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      break;
    case 'price':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'availability':
      filtered.sort((a, b) => b.availabilityPercentage - a.availabilityPercentage);
      break;
    case 'rating':
      filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      break;
  }

  return filtered;
};

export default {
  getNearbyParking,
  getUserLocation,
  findNearestParking,
  filterParking,
  getMarkerColor,
  getAvailabilityPercentage
};