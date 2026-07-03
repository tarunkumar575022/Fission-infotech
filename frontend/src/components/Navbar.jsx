import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import RoleBadge from './RoleBadge';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-card shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-2xl font-bold text-primary flex items-center gap-2">
          🍽️ TableFlow
        </Link>

        <div>
          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <UserIcon size={18} />
                  <span>{user.name}</span>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-danger transition-colors font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 font-medium hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
