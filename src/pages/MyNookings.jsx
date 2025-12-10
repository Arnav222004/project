// src/pages/MyBookings.jsx
// FIXED VERSION - Now properly displays all bookings

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, XCircle, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    if (!user || !user.email) {
      console.error('No user email found');
      setLoading(false);
      return;
    }

    console.log('Loading bookings for user:', user.email);
    setLoading(true);
    
    try {
      const result = await bookingService.getUserBookings(user.email);
      console.log('Bookings result:', result);
      
      if (result.success) {
        setBookings(result.data);
        console.log(`Loaded ${result.data.length} bookings`);
      } else {
        console.error('Failed to load bookings:', result.error);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (bookingId) => {
    if (!confirm('Are you sure you want to check out from this parking?')) return;

    setActionLoading(bookingId);
    const result = await bookingService.checkOut(bookingId);
    setActionLoading(null);
    
    if (result.success) {
      alert('✅ Checked out successfully!');
      loadBookings(); // Reload to show updated status
    } else {
      alert('❌ ' + (result.error || 'Failed to check out'));
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setActionLoading(bookingId);
    const result = await bookingService.cancelBooking(bookingId);
    setActionLoading(null);
    
    if (result.success) {
      alert('✅ Booking cancelled successfully!');
      loadBookings(); // Reload to show updated status
    } else {
      alert('❌ ' + (result.error || 'Failed to cancel booking'));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
      COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200'
    };

    const icons = {
      CONFIRMED: <CheckCircle className="w-4 h-4" />,
      COMPLETED: <CheckCircle className="w-4 h-4" />,
      CANCELLED: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'active') return booking.status === 'CONFIRMED';
    if (filter === 'completed') return booking.status === 'COMPLETED';
    if (filter === 'cancelled') return booking.status === 'CANCELLED';
    return true;
  });

  const getBookingCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => {
      if (status === 'active') return b.status === 'CONFIRMED';
      if (status === 'completed') return b.status === 'COMPLETED';
      if (status === 'cancelled') return b.status === 'CANCELLED';
      return false;
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-600">Manage all your parking reservations</p>
            </div>
            <button
              onClick={loadBookings}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['all', 'active', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {getBookingCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="mb-6">
              {bookings.length === 0 ? (
                <Calendar className="w-32 h-32 mx-auto text-gray-300" />
              ) : (
                <AlertCircle className="w-32 h-32 mx-auto text-gray-300" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {bookings.length === 0 
                ? 'No bookings yet' 
                : `No ${filter} bookings found`}
            </h2>
            <p className="text-gray-600 mb-8">
              {bookings.length === 0
                ? "You haven't made any bookings yet. Start by finding a parking spot!"
                : `You don't have any ${filter} bookings at the moment.`}
            </p>
            {bookings.length === 0 && (
              <a
                href="/dashboard"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Find Parking Now
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Booking Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.parkingName}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">ID: {booking.id}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-600 block text-xs">Date</span>
                          <span className="font-semibold text-gray-900">{booking.date}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                        <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-600 block text-xs">Time</span>
                          <span className="font-semibold text-gray-900">
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                        <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-600 block text-xs">Duration</span>
                          <span className="font-semibold text-gray-900">{booking.duration}h</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm bg-green-50 p-3 rounded-lg">
                        <CreditCard className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-600 block text-xs">Amount</span>
                          <span className="font-bold text-green-600">₹{booking.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Time */}
                    <p className="text-xs text-gray-500">
                      Booked on: {new Date(booking.bookingTime).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Actions */}
                  {booking.status === 'CONFIRMED' && (
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {actionLoading === booking.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Check Out
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Completed/Cancelled Status Info */}
                  {booking.status === 'COMPLETED' && booking.checkOutTime && (
                    <div className="lg:w-48 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <p className="font-semibold text-blue-700 mb-1">Completed</p>
                      <p className="text-xs">
                        {new Date(booking.checkOutTime).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  {booking.status === 'CANCELLED' && booking.cancelledTime && (
                    <div className="lg:w-48 text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                      <p className="font-semibold text-red-700 mb-1">Cancelled</p>
                      <p className="text-xs">
                        {new Date(booking.cancelledTime).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-black text-gray-900">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Bookings</p>
                  <p className="text-3xl font-black text-green-600">
                    {bookings.filter(b => b.status === 'CONFIRMED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-black text-purple-600">
                    ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;