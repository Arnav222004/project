import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FutureForecast = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPrediction = async (date) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/predict_future', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: date, totalSlots: 200 }),
      });
      const data = await response.json();
      if (data.success) {
        setForecast(data.forecast);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    getPrediction(date);
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-3">
      {/* 1. HORIZONTAL HEADER: Title on Left, Input on Right */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800 text-xs flex items-center gap-2">
          📅 Check Future
        </h3>
        
        {/* Compact Date Input */}
        <input 
          type="date" 
          value={selectedDate} 
          onChange={handleDateChange} 
          className="p-1 border border-gray-300 rounded text-xs text-gray-600 focus:outline-none focus:border-purple-500"
          style={{ width: '130px' }} 
        />
      </div>

      {/* Loading Indicator */}
      {loading && <div className="h-24 flex items-center justify-center text-xs text-gray-400">Loading...</div>}

      {/* 2. WIDE HORIZONTAL GRAPH */}
      {!loading && forecast.length > 0 && (
        <div className="h-24 w-full animate-fade-in">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '11px', padding: '4px 8px' }}
              />
              <Bar dataKey="occupancy_percentage" radius={[2, 2, 0, 0]}>
                {forecast.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.occupancy_percentage > 80 ? '#ef4444' : entry.occupancy_percentage > 50 ? '#eab308' : '#10b981'} 
                  />
                ))}
              </Bar>
              {/* X-Axis is hidden to save vertical space, relying on Tooltip for details */}
              <XAxis dataKey="hour" hide />
            </BarChart>
          </ResponsiveContainer>
          
          {/* A tiny legend strip at the bottom */}
          <div className="flex justify-between px-1 mt-1">
             <span className="text-[10px] text-gray-400">8:00 AM</span>
             <span className="text-[10px] text-gray-400">Data for {selectedDate}</span>
             <span className="text-[10px] text-gray-400">10:00 PM</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureForecast;