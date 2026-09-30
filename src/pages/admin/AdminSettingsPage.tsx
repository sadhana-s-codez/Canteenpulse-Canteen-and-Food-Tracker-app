import React, { useEffect, useState } from 'react';
import { subscribeCanteenStatus, updateCanteenStatus, initializeCanteenStatus } from '../../services/realtimeService';
import { seedDatabase } from '../../services/seedData';
import type { CanteenStatus } from '../../types';
import { Settings, Database, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettingsPage: React.FC = () => {
  const [status, setStatus] = useState<CanteenStatus | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    const unsub = subscribeCanteenStatus(setStatus);
    return () => unsub();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedDatabase();
      toast.success(result ? 'Sample data seeded!' : 'Data already exists');
    } catch { toast.error('Seed failed'); }
    finally { setSeeding(false); }
  };

  const handleInitCanteen = async () => {
    setInitializing(true);
    try {
      await initializeCanteenStatus();
      toast.success('Canteen status initialized');
    } catch { toast.error('Failed'); }
    finally { setInitializing(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-800">Settings</h1>

      {/* Database Setup */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Database Setup</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">Seed Sample Data</p>
              <p className="text-xs text-slate-500">Add sample food items and categories</p>
            </div>
            <button onClick={handleSeed} disabled={seeding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              Seed
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">Initialize Canteen Status</p>
              <p className="text-xs text-slate-500">Create/reset the canteen status document</p>
            </div>
            <button onClick={handleInitCanteen} disabled={initializing}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1.5">
              {initializing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
              Initialize
            </button>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {status && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Current Canteen Status
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Open:</span> <span className="font-medium">{status.isOpen ? 'Yes' : 'No'}</span></div>
            <div><span className="text-slate-500">Crowd:</span> <span className="font-medium">{status.crowdCount} ({status.crowdLevel})</span></div>
            <div><span className="text-slate-500">Queue:</span> <span className="font-medium">{status.queueCount}</span></div>
            <div><span className="text-slate-500">Token:</span> <span className="font-medium">{status.currentToken}</span></div>
            <div><span className="text-slate-500">Wait:</span> <span className="font-medium">{status.estimatedWait} min</span></div>
            <div><span className="text-slate-500">Prep Time:</span> <span className="font-medium">{status.avgPreparationTime} min</span></div>
          </div>
        </div>
      )}

      {/* Firebase Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Firebase Configuration</h2>
        </div>
        <div className="text-xs text-slate-500 space-y-1 font-mono">
          <p>Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not configured'}</p>
          <p>Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Not configured'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
