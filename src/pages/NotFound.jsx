import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="text-9xl mb-4 animate-bounce">🚗💨</div>
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          Oops! Wrong Turn
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Looks like this parking spot doesn't exist
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all"
        >
          <Home className="w-5 h-5" />
          Take Me Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;