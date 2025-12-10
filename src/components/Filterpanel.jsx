// src/components/FilterPanel.jsx
import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

const FilterPanel = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      minAvailability: 0,
      maxPrice: 1000,
      type: 'all',
      minRating: 0,
      sortBy: 'distance'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-down">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Minimum Availability */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Minimum Availability
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={localFilters.minAvailability}
              onChange={(e) => handleChange('minAvailability', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0%</span>
              <span className="font-semibold text-purple-600">{localFilters.minAvailability}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Max Price (₹/hr)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localFilters.maxPrice}
              onChange={(e) => handleChange('maxPrice', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹0</span>
              <span className="font-semibold text-purple-600">₹{localFilters.maxPrice}</span>
              <span>₹100</span>
            </div>
          </div>
        </div>

        {/* Parking Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Parking Type
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2.5 text-base rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all bg-white"
          >
            <option value="all">All Types</option>
            <option value="covered">Covered</option>
            <option value="open">Open</option>
            <option value="multi-level">Multi-Level</option>
            <option value="street">Street</option>
            <option value="valet">Valet</option>
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Minimum Rating
          </label>
          <div className="flex gap-2">
            {[0, 3, 3.5, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleChange('minRating', rating)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  localFilters.minRating === rating
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rating === 0 ? 'Any' : `${rating}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Sort By
          </label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-4 py-2.5 text-base rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all bg-white"
          >
            <option value="distance">Distance</option>
            <option value="price">Price (Low to High)</option>
            <option value="availability">Availability (High to Low)</option>
            <option value="rating">Rating (High to Low)</option>
          </select>
        </div>

        {/* Active Filters Count */}
        <div className="flex items-center justify-center md:col-span-2 lg:col-span-1">
          <div className="text-center p-4 bg-purple-50 rounded-xl w-full">
            <div className="text-3xl font-black text-purple-600 mb-1">
              {Object.values(localFilters).filter(v => 
                (typeof v === 'number' && v !== 0) || 
                (typeof v === 'string' && v !== 'all' && v !== 'distance')
              ).length}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Active Filters
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm font-semibold text-gray-700 mb-3">Quick Filters:</div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              handleChange('minAvailability', 50);
              handleChange('sortBy', 'distance');
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
          >
            🟢 High Availability
          </button>
          <button
            onClick={() => {
              handleChange('maxPrice', 40);
              handleChange('sortBy', 'price');
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
          >
            💰 Budget Friendly
          </button>
          <button
            onClick={() => {
              handleChange('minRating', 4.5);
              handleChange('sortBy', 'rating');
            }}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
          >
            ⭐ Top Rated
          </button>
          <button
            onClick={() => {
              handleChange('type', 'covered');
            }}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
          >
            🏢 Covered Only
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;