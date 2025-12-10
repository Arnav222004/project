import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, XCircle, Loader } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const result = await bookingService.getUserBookings(user.email);
    if (result.success) {
      setBookings(result.data);
    }
    setLoading(false);
  };

  const handleCheckOut = async (bookingId) => {
    if (!confirm('Are you sure you want to check out?')) return;

    const result = await bookingService.checkOut(bookingId);
    if (result.success) {
      alert('✅ Checked out successfully!');
      loadBookings();
    } else {
      alert('❌ ' + result.error);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const result = await bookingService.cancelBooking(bookingId);
    if (result.success) {
      alert('✅ Booking cancelled successfully!');
      loadBookings();
    } else {
      alert('❌ ' + result.error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      CONFIRMED: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };

    const icons = {
      CONFIRMED: <CheckCircle className="w-4 h-4" />,
      COMPLETED: <CheckCircle className="w-4 h-4" />,
      CANCELLED: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
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
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage all your parking reservations</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {['all', 'active', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'all' && ` (${bookings.length})`}
              {tab === 'active' && ` (${bookings.filter(b => b.status === 'CONFIRMED').length})`}
              {tab === 'completed' && ` (${bookings.filter(b => b.status === 'COMPLETED').length})`}
              {tab === 'cancelled' && ` (${bookings.filter(b => b.status === 'CANCELLED').length})`}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <Calendar className="w-32 h-32 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No {filter !== 'all' ? filter : ''} bookings found
            </h2>
            <p className="text-gray-600 mb-8">
              {filter === 'all' 
                ? "You haven't made any bookings yet. Start by finding a parking spot!"
                : `You don't have any ${filter} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Booking Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.parkingName}
                        </h3>
                        <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold">{booking.date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Time:</span>
                        <span className="font-semibold">
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{booking.duration}h</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-green-600">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {booking.status === 'CONFIRMED' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                      >
                        Check Out
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;