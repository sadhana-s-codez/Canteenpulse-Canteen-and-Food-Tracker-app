import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Hash, Calendar, LogOut, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-slate-800">Profile</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-lg font-semibold text-slate-800">{profile.name}</h2>
        <p className="text-sm text-slate-500">{profile.email}</p>
        <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600 capitalize">
          {profile.role}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <User className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Full Name</p>
            <p className="text-sm text-slate-800 font-medium">{profile.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Mail className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm text-slate-800 font-medium">{profile.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Hash className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Student ID</p>
            <p className="text-sm text-slate-800 font-medium">{profile.studentId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Shield className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Role</p>
            <p className="text-sm text-slate-800 font-medium capitalize">{profile.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Joined</p>
            <p className="text-sm text-slate-800 font-medium">
              {profile.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
};

export default ProfilePage;
