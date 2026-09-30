import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/auth';
import {
  ClipboardList, Users, UtensilsCrossed, Settings, LogOut, ChefHat, Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffLayout: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out');
    navigate('/login');
  };

  const navItems = [
    { path: '/staff', icon: ClipboardList, label: 'Orders', exact: true },
    { path: '/staff/queue', icon: Users, label: 'Queue & Crowd' },
    { path: '/staff/menu', icon: UtensilsCrossed, label: 'Menu' },
    { path: '/staff/canteen', icon: Settings, label: 'Canteen' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 fixed inset-y-0">
        <div className="p-5 border-b border-slate-100">
          <Link to="/staff" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">CanteenPulse</span>
              <p className="text-[10px] text-purple-600 font-medium uppercase">Staff Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">{profile?.name}</p>
              <p className="text-[10px] text-slate-500">Staff</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-60">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-sm text-slate-800">Staff Panel</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
          <div className="flex items-center justify-around h-14">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  isActive(item.path, item.exact) ? 'text-purple-600' : 'text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <main className="p-4 sm:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
