// src/pages/AdminDashboard.jsx
// FULLY UPDATED: Includes CRUD operations, Bookings, and Day 8 Analytics Charts

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, TrendingUp, Users, MapPin, 
  DollarSign, Calendar, Activity, Clock 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { bookingService } from '../services/bookingService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [parkings, setParkings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalParkings: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    avgOccupancy: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParking, setEditingParking] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // 1. Load parkings
    const storedParkings = localStorage.getItem('admin_parkings');
    const parkingsList = storedParkings ? JSON.parse(storedParkings) : getDefaultParkings();
    setParkings(parkingsList);

    // 2. Load bookings
    const result = await bookingService.getAllBookings();
    setBookings(result);

    // 3. Calculate stats
    const activeBookings = result.filter(b => b.status === 'CONFIRMED').length;
    const totalRevenue = result.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const avgOccupancy = parkingsList.length > 0 
      ? parkingsList.reduce((sum, p) => sum + ((p.totalSlots - p.availableSlots) / p.totalSlots * 100), 0) / parkingsList.length 
      : 0;

    setStats({
      totalParkings: parkingsList.length,
      totalBookings: result.length,
      activeBookings,
      totalRevenue,
      avgOccupancy: avgOccupancy.toFixed(1)
    });
  };

  const getDefaultParkings = () => {
    return [
      { id: '1', name: 'Connaught Place', address: 'CP, New Delhi', lat: 28.6304, lng: 77.2177, totalSlots: 100, availableSlots: 45, price: 50, type: 'Covered' },
      { id: '2', name: 'India Gate', address: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295, totalSlots: 150, availableSlots: 80, price: 40, type: 'Open' },
      { id: '3', name: 'Saket Mall', address: 'Saket, New Delhi', lat: 28.5244, lng: 77.2066, totalSlots: 200, availableSlots: 120, price: 60, type: 'Covered' },
    ];
  };

  const handleAddParking = (parkingData) => {
    const newParking = {
      ...parkingData,
      id: `parking_${Date.now()}`,
      availableSlots: parkingData.totalSlots
    };
    const updated = [...parkings, newParking];
    setParkings(updated);
    localStorage.setItem('admin_parkings', JSON.stringify(updated));
    setShowAddModal(false);
    loadDashboardData();
  };

  const handleEditParking = (parkingData) => {
    const updated = parkings.map(p => p.id === editingParking.id ? { ...editingParking, ...parkingData } : p);
    setParkings(updated);
    localStorage.setItem('admin_parkings', JSON.stringify(updated));
    setEditingParking(null);
    loadDashboardData();
  };

  const handleDeleteParking = (id) => {
    if (!confirm('Are you sure you want to delete this parking?')) return;
    const updated = parkings.filter(p => p.id !== id);
    setParkings(updated);
    localStorage.setItem('admin_parkings', JSON.stringify(updated));
    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage parking locations and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard icon={<MapPin className="w-8 h-8" />} title="Total Parkings" value={stats.totalParkings} color="purple" />
          <StatsCard icon={<Calendar className="w-8 h-8" />} title="Total Bookings" value={stats.totalBookings} color="blue" />
          <StatsCard icon={<Clock className="w-8 h-8" />} title="Active Bookings" value={stats.activeBookings} color="green" />
          <StatsCard icon={<DollarSign className="w-8 h-8" />} title="Total Revenue" value={`₹${stats.totalRevenue}`} color="pink" />
          <StatsCard icon={<TrendingUp className="w-8 h-8" />} title="Avg Occupancy" value={`${stats.avgOccupancy}%`} color="orange" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'parkings', 'bookings', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content Areas */}
        {activeTab === 'overview' && <OverviewTab stats={stats} parkings={parkings} bookings={bookings} />}
        {activeTab === 'parkings' && <ParkingsTab parkings={parkings} onAdd={() => setShowAddModal(true)} onEdit={setEditingParking} onDelete={handleDeleteParking} />}
        {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}
        {activeTab === 'analytics' && <AnalyticsTab bookings={bookings} parkings={parkings} />}

        {/* Add/Edit Modal */}
        {(showAddModal || editingParking) && (
          <ParkingFormModal
            parking={editingParking}
            onClose={() => { setShowAddModal(false); setEditingParking(null); }}
            onSubmit={editingParking ? handleEditParking : handleAddParking}
          />
        )}
      </div>
    </div>
  );
};

// --- Sub-Components ---

const StatsCard = ({ icon, title, value, color }) => {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600',
    orange: 'from-orange-500 to-orange-600'
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className={`w-14 h-14 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
};

const OverviewTab = ({ stats, parkings, bookings }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-gray-900 mb-4">Top Parkings</h3>
      <div className="space-y-3">
        {parkings.slice(0, 3).map(p => (
          <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">{p.name}</span>
            <span className="text-green-600 font-bold">{p.availableSlots} slots left</span>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {bookings.slice(0, 3).map(b => (
          <div key={b.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">{b.parkingName}</p>
              <p className="text-xs text-gray-500">{b.date}</p>
            </div>
            <span className="text-purple-600 font-bold">₹{b.totalAmount}</span>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-gray-500 text-sm">No recent bookings</p>}
      </div>
    </div>
  </div>
);

// --- DAY 8: ANALYTICS CHARTS ---
const AnalyticsTab = ({ bookings, parkings }) => {
  // Data 1: Revenue over time
  const bookingsPerDay = bookings.reduce((acc, booking) => {
    const date = booking.date; 
    if (!acc[date]) acc[date] = { date, count: 0, revenue: 0 };
    acc[date].count += 1;
    acc[date].revenue += booking.totalAmount;
    return acc;
  }, {});
  
  const timelineData = Object.values(bookingsPerDay)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  // Data 2: Utilization per parking
  const utilizationData = parkings.map(p => ({
    name: p.name.split(' ')[0], 
    utilization: Math.round(((p.totalSlots - p.availableSlots) / p.totalSlots) * 100)
  }));

  // Data 3: Peak Hours (Heatmap logic)
  const hoursData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: 0
  }));

  bookings.forEach(b => {
    if (b.startTime) {
      const hour = parseInt(b.startTime.split(':')[0]);
      if (hoursData[hour]) hoursData[hour].count += 1;
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Booking Trends
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Last 7 Days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" name="Bookings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Live Occupancy (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="utilization" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} name="Occupancy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Peak Booking Hours
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" fontSize={12} interval={2} />
                <YAxis fontSize={12} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const ParkingsTab = ({ parkings, onAdd, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex justify-between mb-6">
      <h2 className="text-xl font-bold">Manage Locations</h2>
      <button onClick={onAdd} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-purple-700">
        <Plus className="w-4 h-4" /> Add Parking
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-gray-500 text-sm">
            <th className="py-3">Name</th>
            <th>Address</th>
            <th>Slots</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parkings.map(p => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-medium">{p.name}</td>
              <td className="text-sm text-gray-600">{p.address}</td>
              <td className="text-sm">{p.availableSlots}/{p.totalSlots}</td>
              <td className="text-sm">₹{p.price}</td>
              <td className="flex gap-2 py-3">
                <button onClick={() => onEdit(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit className="w-4 h-4" /></button>
                <button onClick={() => onDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BookingsTab = ({ bookings }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold mb-6">All Bookings</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-gray-500 text-sm">
            <th className="py-3">ID</th>
            <th>User</th>
            <th>Parking</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-mono text-xs">{b.id}</td>
              <td className="text-sm">{b.userId}</td>
              <td className="text-sm font-medium">{b.parkingName}</td>
              <td className="text-sm">{b.date}</td>
              <td className="text-sm font-bold text-green-600">₹{b.totalAmount}</td>
              <td>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                  b.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ParkingFormModal = ({ parking, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(parking || {
    name: '', address: '', lat: '', lng: '', totalSlots: '', price: '', type: 'Open'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      totalSlots: parseInt(formData.totalSlots),
      price: parseInt(formData.price)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up">
        <h2 className="text-xl font-bold mb-4">{parking ? 'Edit' : 'Add'} Parking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="w-full border p-2 rounded" placeholder="Address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" type="number" step="any" placeholder="Latitude" required value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} />
            <input className="border p-2 rounded" type="number" step="any" placeholder="Longitude" required value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" type="number" placeholder="Total Slots" required value={formData.totalSlots} onChange={e => setFormData({...formData, totalSlots: e.target.value})} />
            <input className="border p-2 rounded" type="number" placeholder="Price/hr" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;