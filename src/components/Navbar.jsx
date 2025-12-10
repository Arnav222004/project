// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Menu, X, LayoutDashboard, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('Navbar - Current user:', user);
    console.log('Navbar - Location:', location.pathname);
  }, [user, location]);

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <span className="text-2xl">🅿️</span>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SmartPark
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
              {/* Logged In - Show Dashboard Links */}
                <Link
                  // FIX: Send Admins to /admin and Users to /dashboard
                  to={user.role === 'ADMIN' ? "/admin" : "/dashboard"}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <LayoutDashboard className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                  <span className="font-medium text-gray-700 group-hover:text-purple-600">
                    {/* Optional: Change text to "Admin Panel" for admins */}
                    {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                  </span>
                </Link>
                
                {/* Keep My Bookings link as is */}
                <Link
                  to="/my-bookings"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <Calendar className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                  <span className="font-medium text-gray-700 group-hover:text-purple-600">My Bookings</span>
                </Link>

                {/* User Info */}
                <div className="flex items-center space-x-3 pl-4 border-l-2 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not Logged In - Show Login/Signup */}
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-down">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Dashboard</span>
                </Link>
                
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">My Bookings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;