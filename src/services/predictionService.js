// src/services/predictionService.js
const API_URL = 'http://127.0.0.1:5000';

export const predictionService = {
  async getPrediction(parkingId, totalSlots, date, time) {
    try {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday
      const hour = parseInt(time.split(':')[0]);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parkingId,
          totalSlots,
          dayOfWeek,
          hour
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Prediction API Error:', error);
      return {
        success: false,
        error: 'Failed to connect to AI server'
      };
    }
  }
};