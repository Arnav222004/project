// src/services/bookingService.js
// FIXED VERSION - Bookings now work properly

class BookingService {
  constructor() {
    this.STORAGE_KEY = 'smartpark_bookings';
    this.PARKING_STORAGE_KEY = 'smartpark_parking_availability';
  }

  // Get all bookings from storage
  getAllBookings() {
    try {
      const bookings = localStorage.getItem(this.STORAGE_KEY);
      return bookings ? JSON.parse(bookings) : [];
    } catch (error) {
      console.error('Error reading bookings:', error);
      return [];
    }
  }

  // Get parking availability
  getParkingData() {
    try {
      const parking = localStorage.getItem(this.PARKING_STORAGE_KEY);
      return parking ? JSON.parse(parking) : {};
    } catch (error) {
      console.error('Error reading parking data:', error);
      return {};
    }
  }

  // Save bookings with error handling
  saveBookings(bookings) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        this.cleanupOldBookings();
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
          return true;
        } catch (retryError) {
          console.error('Storage still full after cleanup');
          return false;
        }
      }
      console.error('Error saving bookings:', error);
      return false;
    }
  }

  // Save parking availability
  saveParkingData(parkingData) {
    try {
      localStorage.setItem(this.PARKING_STORAGE_KEY, JSON.stringify(parkingData));
      return true;
    } catch (error) {
      console.error('Error saving parking data:', error);
      return false;
    }
  }

  // Cleanup old bookings to free space
  cleanupOldBookings() {
    try {
      const bookings = this.getAllBookings();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredBookings = bookings.filter(booking => {
        if (booking.status === 'CONFIRMED') return true;
        const bookingDate = new Date(booking.bookingTime);
        return bookingDate > thirtyDaysAgo;
      });

      this.saveBookings(filteredBookings);
      console.log(`Cleaned up ${bookings.length - filteredBookings.length} old bookings`);
    } catch (error) {
      console.error('Error cleaning up bookings:', error);
    }
  }

  // Create a new booking - FIXED VERSION
  async createBooking(bookingData) {
    try {
      const { userId, parkingId, parkingName, date, startTime, endTime, duration, price } = bookingData;

      // Validate required fields
      if (!userId || !parkingId || !date || !startTime || !endTime) {
        return {
          success: false,
          error: 'Missing required booking information'
        };
      }

      // Validate duration
      if (!duration || duration <= 0) {
        return {
          success: false,
          error: 'Invalid duration'
        };
      }

      // Check if parking spot is available (optional - can be skipped for demo)
      const parkingData = this.getParkingData();
      let parkingAvailability = parkingData[parkingId];

      // If parking data doesn't exist, we can still proceed (for demo purposes)
      let slotsUpdated = false;
      if (parkingAvailability && parkingAvailability.availableSlots > 0) {
        parkingAvailability.availableSlots -= 1;
        parkingData[parkingId] = parkingAvailability;
        slotsUpdated = true;
      }

      // Create booking object
      const booking = {
        id: `BK${Date.now()}`,
        userId,
        parkingId,
        parkingName: parkingName || 'Parking Location',
        date,
        startTime,
        endTime,
        duration: parseInt(duration),
        price: parseInt(price) || 0,
        totalAmount: (parseInt(price) || 0) * parseInt(duration),
        status: 'CONFIRMED',
        bookingTime: new Date().toISOString(),
        checkInTime: null,
        checkOutTime: null
      };

      console.log('Creating booking:', booking);

      // Save booking
      const allBookings = this.getAllBookings();
      allBookings.push(booking);
      
      const savedBookings = this.saveBookings(allBookings);
      if (!savedBookings) {
        return {
          success: false,
          error: 'Failed to save booking'
        };
      }

      // Update parking availability if it was tracked
      if (slotsUpdated) {
        this.saveParkingData(parkingData);
      }

      console.log('Booking created successfully:', booking.id);

      return {
        success: true,
        data: booking
      };

    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to create booking'
      };
    }
  }

  // Get user's bookings - FIXED VERSION
  async getUserBookings(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const allBookings = this.getAllBookings();
      const userBookings = allBookings.filter(b => b.userId === userId);
      
      // Sort by booking time (newest first)
      userBookings.sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime));

      console.log(`Found ${userBookings.length} bookings for user ${userId}`);

      return {
        success: true,
        data: userBookings
      };
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return {
        success: false,
        error: error.message || 'Failed to get bookings'
      };
    }
  }

  // Check out from parking
  async checkOut(bookingId) {
    try {
      const bookings = this.getAllBookings();
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);

      if (bookingIndex === -1) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      const booking = bookings[bookingIndex];

      // Only allow checkout for confirmed bookings
      if (booking.status !== 'CONFIRMED') {
        return {
          success: false,
          error: 'Booking is not active'
        };
      }

      // Update booking status
      booking.status = 'COMPLETED';
      booking.checkOutTime = new Date().toISOString();
      bookings[bookingIndex] = booking;
      
      const saved = this.saveBookings(bookings);
      if (!saved) {
        return {
          success: false,
          error: 'Failed to update booking'
        };
      }

      // Free up parking slot
      const parkingData = this.getParkingData();
      if (parkingData[booking.parkingId]) {
        parkingData[booking.parkingId].availableSlots += 1;
        this.saveParkingData(parkingData);
      }

      console.log('Checked out booking:', bookingId);

      return {
        success: true,
        data: booking
      };
    } catch (error) {
      console.error('Error checking out:', error);
      return {
        success: false,
        error: error.message || 'Failed to check out'
      };
    }
  }

  // Cancel booking
  async cancelBooking(bookingId) {
    try {
      const bookings = this.getAllBookings();
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);

      if (bookingIndex === -1) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      const booking = bookings[bookingIndex];

      // Only allow cancellation for confirmed bookings
      if (booking.status !== 'CONFIRMED') {
        return {
          success: false,
          error: 'Booking cannot be cancelled'
        };
      }

      // Update booking status
      booking.status = 'CANCELLED';
      booking.cancelledTime = new Date().toISOString();
      bookings[bookingIndex] = booking;
      
      const saved = this.saveBookings(bookings);
      if (!saved) {
        return {
          success: false,
          error: 'Failed to cancel booking'
        };
      }

      // Free up parking slot
      const parkingData = this.getParkingData();
      if (parkingData[booking.parkingId]) {
        parkingData[booking.parkingId].availableSlots += 1;
        this.saveParkingData(parkingData);
      }

      console.log('Cancelled booking:', bookingId);

      return {
        success: true,
        data: booking
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel booking'
      };
    }
  }

  // Initialize parking availability (for testing)
  initializeParkingAvailability(parkingSpots) {
    try {
      const parkingData = {};
      parkingSpots.forEach(spot => {
        parkingData[spot.id] = {
          totalSlots: spot.totalSlots || 100,
          availableSlots: spot.availableSlots || 50,
          price: spot.price || 50
        };
      });
      this.saveParkingData(parkingData);
      console.log('Initialized parking availability for', parkingSpots.length, 'spots');
    } catch (error) {
      console.error('Error initializing parking:', error);
    }
  }

  // Get booking by ID
  async getBookingById(bookingId) {
    try {
      const bookings = this.getAllBookings();
      const booking = bookings.find(b => b.id === bookingId);
      
      if (booking) {
        return {
          success: true,
          data: booking
        };
      }
      
      return {
        success: false,
        error: 'Booking not found'
      };
    } catch (error) {
      console.error('Error getting booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear all bookings (for testing/debugging)
  clearAllBookings() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('All bookings cleared');
      return true;
    } catch (error) {
      console.error('Error clearing bookings:', error);
      return false;
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();