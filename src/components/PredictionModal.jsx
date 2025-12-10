import React, { useState } from 'react';
import { X, TrendingUp, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FutureForecast from './FutureForecast';

const PredictionModal = ({ parking, prediction, onClose }) => {
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'future'

  // Mock data for the purple "Today" graph
  const generateTrendData = () => {
    const data = [];
    const currentHour = new Date().getHours();
    for (let i = 0; i < 6; i++) { // Show next 6 hours
      const hour = (currentHour + i) % 24;
      const occupancy = Math.min(100, Math.max(0, prediction.predictedOccupancy + (Math.random() * 20 - 10)));
      data.push({ time: `${hour}:00`, occupancy: Math.round(occupancy) });
    }
    return data;
  };

  const trendData = generateTrendData();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className={`p-5 bg-gradient-to-r ${
          prediction.color === 'red' ? 'from-red-500 to-orange-500' :
          prediction.color === 'yellow' ? 'from-yellow-400 to-orange-400' :
          'from-green-500 to-emerald-500'
        } text-white shrink-0`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="w-6 h-6" /> AI Prediction
              </h2>
              <p className="opacity-90 text-sm">{parking.name}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-5xl font-black">{prediction.predictedFreeSlots}</span>
            <span className="text-lg font-medium opacity-90 mb-1">slots likely free</span>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="p-5 overflow-y-auto">
          
          {/* Status Badge */}
          <div className={`flex items-start gap-3 p-3 rounded-xl mb-4 ${
            prediction.color === 'red' ? 'bg-red-50 text-red-700' :
            prediction.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            {prediction.color === 'red' ? <AlertCircle className="w-5 h-5 mt-0.5" /> :
             prediction.color === 'yellow' ? <Info className="w-5 h-5 mt-0.5" /> :
             <CheckCircle className="w-5 h-5 mt-0.5" />}
            <div>
              <h3 className="font-bold text-base">{prediction.crowdLevel} Traffic Expected</h3>
              <p className="text-xs opacity-90">{prediction.suggestion}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase">Confidence</p>
              <p className="text-xl font-black text-purple-600">94%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase">Current Occ.</p>
              <p className="text-xl font-black text-gray-800">{prediction.predictedOccupancy}%</p>
            </div>
          </div>

          {/* --- TABS: TOGGLE BETWEEN TODAY & FUTURE --- */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button 
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                activeTab === 'today' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <TrendingUp className="w-3 h-3" /> Next Few Hours
            </button>
            <button 
              onClick={() => setActiveTab('future')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                activeTab === 'future' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Calendar className="w-3 h-3" /> Check Future
            </button>
          </div>

          {/* --- CONDITIONAL GRAPH RENDER --- */}
          <div className="min-h-[160px]"> {/* Fixed height container to prevent jumping */}
            
            {activeTab === 'today' && (
               <div className="animate-fade-in">
                 <div className="h-32 w-full mt-2">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={trendData}>
                       <defs>
                         <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="occupancy" stroke="#8884d8" fillOpacity={1} fill="url(#colorOccupancy)" strokeWidth={3} />
                       <XAxis dataKey="time" hide />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
                 <p className="text-center text-[10px] text-gray-400 mt-2">Estimated trend based on live data</p>
               </div>
            )}

            {activeTab === 'future' && (
              <div className="animate-fade-in">
                {/* We pass a 'compact' prop if you want to handle styling differently, 
                    but the FutureForecast component is already compact now. */}
                <FutureForecast /> 
              </div>
            )}

          </div>

          <button onClick={onClose} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold mt-4 hover:bg-black transition-all active:scale-95">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionModal;