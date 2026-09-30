import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/realtimeService';
import type { Notification } from '../../types';
import { Bell, Package, Megaphone, ShoppingBag, CheckCheck, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcons: Record<string, React.ReactNode> = {
  order: <Package className="w-4 h-4 text-blue-600" />,
  announcement: <Megaphone className="w-4 h-4 text-purple-600" />,
  stock: <ShoppingBag className="w-4 h-4 text-green-600" />,
  general: <Bell className="w-4 h-4 text-slate-600" />,
};

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.uid, (items) => {
      setNotifications(items);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead(user.uid);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${
                n.read ? 'border-slate-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{typeIcons[n.type] || typeIcons.general}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-medium ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {n.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <BellOff className="w-14 h-14 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No notifications yet</p>
          <p className="text-sm text-slate-400 mt-1">You'll be notified about your orders here</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
