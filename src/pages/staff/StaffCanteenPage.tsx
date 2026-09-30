import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeCanteenStatus, updateCanteenStatus,
  createAnnouncement, subscribeAllAnnouncements, toggleAnnouncement
} from '../../services/realtimeService';
import LiveBadge from '../../components/LiveBadge';
import type { CanteenStatus, Announcement } from '../../types';
import { DoorOpen, DoorClosed, Megaphone, Plus, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffCanteenPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<CanteenStatus | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [annoTitle, setAnnoTitle] = useState('');
  const [annoMessage, setAnnoMessage] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const unsubs = [
      subscribeCanteenStatus((s) => { setStatus(s); setLoading(false); }),
      subscribeAllAnnouncements(setAnnouncements),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const toggleOpen = async () => {
    if (!status) return;
    try {
      await updateCanteenStatus({ isOpen: !status.isOpen });
      toast.success(status.isOpen ? 'Canteen closed' : 'Canteen opened');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handlePublish = async () => {
    if (!annoTitle.trim() || !annoMessage.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    if (!user || !profile) return;
    setPublishing(true);
    try {
      await createAnnouncement(annoTitle.trim(), annoMessage.trim(), user.uid, profile.name);
      setAnnoTitle('');
      setAnnoMessage('');
      toast.success('Announcement published!');
    } catch {
      toast.error('Failed to publish');
    } finally {
      setPublishing(false);
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
        <h1 className="text-xl font-bold text-slate-800">Canteen Control</h1>
        <LiveBadge updatedAt={status?.updatedAt} />
      </div>

      {/* Open/Close Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Canteen Status</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status?.isOpen ? (
              <DoorOpen className="w-8 h-8 text-green-500" />
            ) : (
              <DoorClosed className="w-8 h-8 text-red-500" />
            )}
            <div>
              <p className={`text-xl font-bold ${status?.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {status?.isOpen ? 'OPEN' : 'CLOSED'}
              </p>
              <p className="text-xs text-slate-500">
                {status?.isOpen ? 'Canteen is serving' : 'Canteen is closed'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleOpen}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              status?.isOpen
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {status?.isOpen ? 'Close Canteen' : 'Open Canteen'}
          </button>
        </div>
      </div>

      {/* New Announcement */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Publish Announcement</h2>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={annoTitle}
            onChange={(e) => setAnnoTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            value={annoMessage}
            onChange={(e) => setAnnoMessage(e.target.value)}
            placeholder="Announcement message..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Announcements</h2>
        {announcements.length > 0 ? (
          <div className="space-y-2">
            {announcements.slice(0, 10).map((a) => (
              <div
                key={a.id}
                className={`border rounded-lg p-3 ${a.active ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200 opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {a.createdByName} · {a.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAnnouncement(a.id, !a.active)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      a.active ? 'text-purple-600 hover:bg-purple-100' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title={a.active ? 'Hide' : 'Show'}
                  >
                    {a.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No announcements yet</p>
        )}
      </div>
    </div>
  );
};

export default StaffCanteenPage;
