import React, { useEffect, useState } from 'react';
import { subscribeCanteenStatus, updateCanteenStatus } from '../../services/realtimeService';
import LiveBadge from '../../components/LiveBadge';
import type { CanteenStatus } from '../../types';
import { Users, ListOrdered, Clock, Minus, Plus, Loader2, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffQueuePage: React.FC = () => {
  const [status, setStatus] = useState<CanteenStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local editable values
  const [crowdCount, setCrowdCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [currentToken, setCurrentToken] = useState('');
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [avgPrepTime, setAvgPrepTime] = useState(8);

  useEffect(() => {
    const unsub = subscribeCanteenStatus((s) => {
      setStatus(s);
      setCrowdCount(s.crowdCount);
      setQueueCount(s.queueCount);
      setCurrentToken(s.currentToken);
      setEstimatedWait(s.estimatedWait);
      setAvgPrepTime(s.avgPreparationTime);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (field: string, value: any) => {
    setSaving(true);
    try {
      await updateCanteenStatus({ [field]: value } as any);
      toast.success('Updated successfully');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Queue & Crowd Control</h1>
        <LiveBadge updatedAt={status?.updatedAt} />
      </div>

      {/* Crowd Control */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Current Crowd</h2>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => {
              const v = Math.max(0, crowdCount - 5);
              setCrowdCount(v);
              handleSave('crowdCount', v);
            }}
            className="w-12 h-12 rounded-xl border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"
          >
            <Minus className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <input
              type="number"
              min={0}
              value={crowdCount}
              onChange={(e) => setCrowdCount(Math.max(0, parseInt(e.target.value) || 0))}
              onBlur={() => handleSave('crowdCount', crowdCount)}
              className="w-24 text-center text-4xl font-bold text-slate-800 border-b-2 border-slate-300 focus:border-purple-500 focus:outline-none bg-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">people</p>
          </div>
          <button
            onClick={() => {
              const v = crowdCount + 5;
              setCrowdCount(v);
              handleSave('crowdCount', v);
            }}
            className="w-12 h-12 rounded-xl border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"
          >
            <Plus className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="flex justify-center gap-2">
          {[10, 25, 50, 75, 100].map((v) => (
            <button
              key={v}
              onClick={() => {
                setCrowdCount(v);
                handleSave('crowdCount', v);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                crowdCount === v
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Control */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ListOrdered className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Queue Count</h2>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => {
              const v = Math.max(0, queueCount - 1);
              setQueueCount(v);
              handleSave('queueCount', v);
            }}
            className="w-12 h-12 rounded-xl border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50"
          >
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="number"
            min={0}
            value={queueCount}
            onChange={(e) => setQueueCount(Math.max(0, parseInt(e.target.value) || 0))}
            onBlur={() => handleSave('queueCount', queueCount)}
            className="w-20 text-center text-3xl font-bold text-slate-800 border-b-2 border-slate-300 focus:border-purple-500 focus:outline-none bg-transparent"
          />
          <button
            onClick={() => {
              const v = queueCount + 1;
              setQueueCount(v);
              handleSave('queueCount', v);
            }}
            className="w-12 h-12 rounded-xl border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Now Serving Token */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Now Serving</h2>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={currentToken}
            onChange={(e) => setCurrentToken(e.target.value.toUpperCase())}
            onBlur={() => handleSave('currentToken', currentToken)}
            placeholder="A000"
            className="flex-1 text-center text-2xl font-bold text-purple-600 border-2 border-slate-300 rounded-xl py-3 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={() => {
              // Auto-increment token
              const match = currentToken.match(/^([A-Z])(\d+)$/);
              if (match) {
                const prefix = match[1];
                const num = parseInt(match[2]) + 1;
                const next = `${prefix}${String(num).padStart(3, '0')}`;
                setCurrentToken(next);
                handleSave('currentToken', next);
              }
            }}
            className="px-4 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
          >
            Next
          </button>
        </div>
      </div>

      {/* Estimated Wait & Prep Time */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Estimated Wait</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={estimatedWait}
              onChange={(e) => setEstimatedWait(Math.max(0, parseInt(e.target.value) || 0))}
              onBlur={() => handleSave('estimatedWait', estimatedWait)}
              className="w-20 text-center text-2xl font-bold border-b-2 border-slate-300 focus:border-purple-500 focus:outline-none bg-transparent"
            />
            <span className="text-sm text-slate-500">minutes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Avg. Prep Time</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={avgPrepTime}
              onChange={(e) => setAvgPrepTime(Math.max(1, parseInt(e.target.value) || 1))}
              onBlur={() => handleSave('avgPreparationTime', avgPrepTime)}
              className="w-20 text-center text-2xl font-bold border-b-2 border-slate-300 focus:border-purple-500 focus:outline-none bg-transparent"
            />
            <span className="text-sm text-slate-500">minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffQueuePage;
