// src/components/BookingModal.jsx
// FIXED VERSION - Booking confirmation now works properly

import { useState } from 'react';
import { X, Calendar, Clock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ parking, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Details, 2: Confirmation, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: 2, // hours
    paymentMethod: 'wallet' // Changed default to wallet to match your screenshot
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const calculateEndTime = (startTime, duration) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':');
    const start = new Date();
    start.setHours(parseInt(hours), parseInt(minutes), 0);
    start.setHours(start.getHours() + duration);
    return start.toTimeString().slice(0, 5);
  };

  const totalAmount = parking.price * bookingData.duration;

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleConfirmBooking = async () => {
    // Validation
    if (!bookingData.startTime) {
      setError('Please select a start time');
      return;
    }

    if (!bookingData.date) {
      setError('Please select a date');
      return;
    }

    if (!bookingData.paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    console.log('Starting booking process...');
    setLoading(true);
    setError('');

    try {
      const bookingPayload = {
        userId: user.email,
        parkingId: parking.id,
        parkingName: parking.name,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: calculateEndTime(bookingData.startTime, bookingData.duration),
        duration: bookingData.duration,
        price: parking.price
      };

      console.log('Booking payload:', bookingPayload);

      const result = await bookingService.createBooking(bookingPayload);

      console.log('Booking result:', result);

      if (result.success) {
        setConfirmedBooking(result.data);
        setStep(3);
        
        // Call parent success callback
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError(result.error || 'Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Book Parking Spot</h2>
              <p className="text-purple-100 text-sm">{parking.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all ${
                  s <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between mt-2 text-xs text-purple-100">
            <span className={step >= 1 ? 'font-semibold text-white' : ''}>Details</span>
            <span className={step >= 2 ? 'font-semibold text-white' : ''}>Payment</span>
            <span className={step >= 3 ? 'font-semibold text-white' : ''}>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Booking Details */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Parking Info */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{parking.name}</h3>
                    <p className="text-sm text-gray-600">{parking.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-purple-600">₹{parking.price}</p>
                    <p className="text-xs text-gray-600">per hour</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-semibold">
                    {parking.availableSlots} slots available
                  </span>
                  <span className="text-gray-600">Type: {parking.type}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={bookingData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setBookingData({ ...bookingData, duration: hours })}
                      className={`py-3 rounded-lg font-semibold text-sm transition-all ${
                        bookingData.duration === hours
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {bookingData.startTime && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{bookingData.duration} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start:</span>
                      <span className="font-semibold">{bookingData.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End:</span>
                      <span className="font-semibold">
                        {calculateEndTime(bookingData.startTime, bookingData.duration)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-gray-900 font-semibold">Total:</span>
                      <span className="text-xl font-black text-purple-600">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!bookingData.startTime}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parking:</span>
                    <span className="font-semibold">{parking.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{bookingData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">
                      {bookingData.startTime} - {calculateEndTime(bookingData.startTime, bookingData.duration)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{bookingData.duration} hours</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-purple-200">
                    <span className="text-gray-900 font-bold">Total Amount:</span>
                    <span className="text-2xl font-black text-purple-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Payment Method
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'card', label: 'Card', icon: '💳' },
                    { value: 'upi', label: 'UPI', icon: '📱' },
                    { value: 'wallet', label: 'Wallet', icon: '👛' }
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        bookingData.paymentMethod === method.value
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={bookingData.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-purple-600"
                      />
                      <span className="ml-3 text-2xl">{method.icon}</span>
                      <span className="ml-3 font-semibold text-gray-900 capitalize">{method.label}</span>
                      {bookingData.paymentMethod === method.value && (
                        <CheckCircle className="ml-auto w-5 h-5 text-purple-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && confirmedBooking && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full animate-bounce">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600">Your parking spot is reserved</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 text-left">
                <h4 className="font-bold text-gray-900 mb-4">Booking ID: {confirmedBooking.id}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parking:</span>
                    <span className="font-semibold">{confirmedBooking.parkingName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{confirmedBooking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">
                      {confirmedBooking.startTime} - {confirmedBooking.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{confirmedBooking.duration} hours</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-purple-200">
                    <span className="text-gray-900 font-bold">Amount Paid:</span>
                    <span className="text-xl font-black text-green-600">₹{confirmedBooking.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg text-left">
                <p className="text-sm text-blue-700">
                  📧 Confirmation email sent to <strong>{user.email}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  You can view this booking in "My Bookings" section
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;