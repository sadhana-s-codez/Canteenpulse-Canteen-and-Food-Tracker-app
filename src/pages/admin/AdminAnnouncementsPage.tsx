import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeAllAnnouncements, createAnnouncement, toggleAnnouncement
} from '../../services/realtimeService';
import type { Announcement } from '../../types';
import { Megaphone, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAnnouncementsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const unsub = subscribeAllAnnouncements((a) => { setAnnouncements(a); setLoading(false); });
    return () => unsub();
  }, []);

  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) { toast.error('Fill in title and message'); return; }
    if (!user || !profile) return;
    setPublishing(true);
    try {
      await createAnnouncement(title.trim(), message.trim(), user.uid, profile.name);
      setTitle('');
      setMessage('');
      toast.success('Published!');
    } catch { toast.error('Failed'); }
    finally { setPublishing(false); }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Announcements</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">New Announcement</h2>
        <div className="space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Title" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..." rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handlePublish} disabled={publishing}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2">
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-20 animate-pulse" />
          ))
        ) : announcements.length > 0 ? (
          announcements.map((a) => (
            <div key={a.id} className={`bg-white rounded-xl border p-4 ${a.active ? 'border-slate-200' : 'border-slate-200 opacity-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-slate-800">{a.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{a.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{a.createdByName} · {a.createdAt.toLocaleString()}</p>
                </div>
                <button onClick={() => toggleAnnouncement(a.id, !a.active)}
                  className={`p-2 rounded-lg ${a.active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}>
                  {a.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncementsPage;
