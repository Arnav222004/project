import { useState } from 'react';
import { MapPin, Star, Navigation, Clock, Sparkles, Loader } from 'lucide-react';
import BookingModal from './BookingModal';
import PredictionModal from './PredictionModal';
import { predictionService } from '../services/predictionService';

const ParkingCard = ({ parking, onSelect, isSelected }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const getAvailabilityColor = (percentage) => {
    if (percentage > 50) return 'text-green-600 bg-green-50';
    if (percentage >= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAvailabilityText = (percentage) => {
    if (percentage > 50) return 'High Availability';
    if (percentage >= 20) return 'Medium Availability';
    return 'Low Availability';
  };

  const handleBookingSuccess = (booking) => {
    alert(`✅ Booking confirmed! ID: ${booking.id}`);
    setShowBookingModal(false);
  };

  const handlePredict = async (e) => {
    e.stopPropagation();
    setPredicting(true);
    
    // Use current date/time for prediction
    const now = new Date();
    const result = await predictionService.getPrediction(
      parking.id,
      parking.totalSlots,
      now.toISOString().split('T')[0],
      `${now.getHours()}:00`
    );

    setPredicting(false);
    
    if (result.success) {
      setPrediction(result);
      setShowPredictionModal(true);
    } else {
      alert('⚠️ Could not fetch AI prediction. Is the Python server running?');
    }
  };

  return (
    <>
      <div
        onClick={() => onSelect(parking)}
        className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden ${
          isSelected ? 'ring-4 ring-purple-500 shadow-2xl' : ''
        }`}
      >
        {isSelected && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600"></div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                {parking.name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">{parking.address}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm text-gray-700">{parking.rating}</span>
            </div>
          </div>

          {/* Availability Status */}
          <div className={`mb-4 px-4 py-3 rounded-xl ${getAvailabilityColor(parking.availabilityPercentage)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">
                {getAvailabilityText(parking.availabilityPercentage)}
              </span>
              <span className="font-bold">
                {parking.availableSlots}/{parking.totalSlots}
              </span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  parking.availabilityPercentage > 50 ? 'bg-green-500' :
                  parking.availabilityPercentage >= 20 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${parking.availabilityPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="text-xs text-gray-600 mb-1">Price</div>
              <div className="text-lg font-bold text-purple-600">
                ₹{parking.price}<span className="text-sm font-normal">/hr</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-xs text-gray-600 mb-1">Type</div>
              <div className="text-sm font-semibold text-blue-600">
                {parking.type}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePredict}
              disabled={predicting}
              className="px-3 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100"
              title="AI Prediction"
            >
              {predicting ? <Loader className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBookingModal(true);
              }}
              disabled={parking.availableSlots === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock className="w-4 h-4" />
              Book Slot
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          parking={parking}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Prediction Modal */}
      {showPredictionModal && prediction && (
        <PredictionModal
          parking={parking}
          prediction={prediction}
          onClose={() => setShowPredictionModal(false)}
        />
      )}
    </>
  );
};

export default ParkingCard;