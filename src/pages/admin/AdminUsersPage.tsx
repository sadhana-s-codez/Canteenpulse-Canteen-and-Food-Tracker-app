import React, { useEffect, useState } from 'react';
import { subscribeUsers, updateUserRole } from '../../services/realtimeService';
import { Users as UsersIcon, Shield, ChefHat, GraduationCap, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const roleIcons: Record<string, React.ReactNode> = {
  student: <GraduationCap className="w-4 h-4 text-blue-600" />,
  staff: <ChefHat className="w-4 h-4 text-purple-600" />,
  admin: <Shield className="w-4 h-4 text-slate-600" />,
};

const roleColors: Record<string, string> = {
  student: 'bg-blue-50 text-blue-700',
  staff: 'bg-purple-50 text-purple-700',
  admin: 'bg-slate-100 text-slate-700',
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; studentId: string; role: string; createdAt: Date }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeUsers((u) => { setUsers(u); setLoading(false); });
    return () => unsub();
  }, []);

  const filtered = search
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, role);
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Users ({users.length})</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">User</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Student ID</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Joined</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">{u.studentId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {roleIcons[u.role]}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleColors[u.role]}`}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {u.createdAt?.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {updatingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
