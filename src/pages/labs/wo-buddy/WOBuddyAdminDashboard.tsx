import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Activity, Settings, Shield, Search, ChevronDown, MoreVertical, BarChart3, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WOBuddyAuthProvider, useWOBuddyAuth } from '@/hooks/useWOBuddyAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface WBUser {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_active: boolean;
  fitness_level: string | null;
  last_active_at: string | null;
  created_at: string;
}

type AdminTab = 'users' | 'analytics' | 'settings';

const WOBuddyAdminDashboard = () => {
  const { isAdmin, wobuddyUser } = useWOBuddyAuth();
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<WBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wobuddy_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setUsers(data as WBUser[]);
    if (error) toast.error('Failed to load users');
    setLoading(false);
  };

  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('wobuddy_users')
      .update({ is_active: !currentActive })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success(currentActive ? 'User deactivated' : 'User reactivated');
      fetchUsers();
    }
    setOpenMenu(null);
  };

  const toggleUserAdmin = async (userId: string, currentAdmin: boolean) => {
    const { error } = await supabase
      .from('wobuddy_users')
      .update({ is_admin: !currentAdmin })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success(currentAdmin ? 'Admin role removed' : 'Admin role granted');
      fetchUsers();
    }
    setOpenMenu(null);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-stone-900/20 mx-auto mb-4" />
          <p className="text-stone-900/40">You don't have admin access.</p>
          <Link to="/labs/wo-buddy" className="text-emerald-400 text-sm mt-2 inline-block hover:underline">
            Back to W.O.Buddy
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    (u.display_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const activeCount = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.is_admin).length;
  const recentCount = users.filter(u => {
    if (!u.last_active_at) return false;
    const diff = Date.now() - new Date(u.last_active_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-xl border-b border-stone-900/10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/labs/wo-buddy" className="flex items-center gap-2 text-stone-900/60 hover:text-stone-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Back to App</span>
          </Link>
          <h1 className="text-base font-bold tracking-tight">
            W.O.<span className="text-emerald-400">Buddy</span> <span className="text-stone-900/40 font-normal">Admin</span>
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Users', value: users.length, icon: <Users className="w-4 h-4" />, color: 'emerald' },
            { label: 'Active', value: activeCount, icon: <UserCheck className="w-4 h-4" />, color: 'blue' },
            { label: 'This Week', value: recentCount, icon: <TrendingUp className="w-4 h-4" />, color: 'amber' },
            { label: 'Admins', value: adminCount, icon: <Shield className="w-4 h-4" />, color: 'violet' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br from-${stat.color}-500/10 to-transparent rounded-xl p-4 border border-${stat.color}-500/10`}>
              <div className={`flex items-center gap-2 text-${stat.color}-400 mb-2`}>
                {stat.icon}
                <span className="text-[10px] uppercase tracking-wider font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-900/[0.04] rounded-xl p-1 border border-stone-900/10">
          {([
            { id: 'users' as const, label: 'Users', icon: <Users className="w-4 h-4" /> },
            { id: 'analytics' as const, label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'settings' as const, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'text-stone-900/40 hover:text-stone-900/60'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-900/30" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-stone-900/[0.06] border border-stone-900/10 text-sm placeholder:text-stone-900/30 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 bg-stone-900/[0.04] rounded-xl p-3 border border-stone-900/10 hover:bg-stone-900/[0.05] transition-colors">
                    {/* Avatar */}
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {(u.display_name || u.email || '?')[0].toUpperCase()}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{u.display_name || 'Unnamed'}</p>
                        {u.is_admin && (
                          <span className="text-[9px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20">Admin</span>
                        )}
                        {!u.is_active && (
                          <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-900/30 truncate">{u.email}</p>
                    </div>

                    {/* Meta */}
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-stone-900/30">
                        Joined {format(new Date(u.created_at), 'MMM d, yyyy')}
                      </p>
                      {u.last_active_at && (
                        <p className="text-[10px] text-stone-900/20">
                          Active {format(new Date(u.last_active_at), 'MMM d')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                        className="p-2 rounded-lg hover:bg-stone-900/[0.06] text-stone-900/30 hover:text-stone-900/60 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === u.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-[#1a1a24] rounded-xl border border-stone-900/10 shadow-xl py-1">
                            <button
                              onClick={() => toggleUserActive(u.id, u.is_active)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-900/60 hover:bg-stone-900/[0.06] hover:text-stone-900 transition-colors"
                            >
                              {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              {u.is_active ? 'Deactivate User' : 'Reactivate User'}
                            </button>
                            {u.user_id !== wobuddyUser?.user_id && (
                              <button
                                onClick={() => toggleUserAdmin(u.id, u.is_admin)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-900/60 hover:bg-stone-900/[0.06] hover:text-stone-900 transition-colors"
                              >
                                <Shield className="w-4 h-4" />
                                {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-stone-900/30 text-sm">
                    {search ? 'No users match your search' : 'No users yet'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div className="space-y-4">
            <div className="bg-stone-900/[0.04] rounded-xl p-6 border border-stone-900/10 text-center">
              <BarChart3 className="w-10 h-10 text-stone-900/20 mx-auto mb-3" />
              <p className="text-sm text-stone-900/40 mb-1">Analytics Dashboard</p>
              <p className="text-xs text-stone-900/20">
                Workout completions, active users over time, and engagement metrics will appear here as users begin training.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl p-4 border border-emerald-500/10">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium mb-2">Signups This Month</p>
                <p className="text-3xl font-bold">
                  {users.filter(u => {
                    const d = new Date(u.created_at);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl p-4 border border-blue-500/10">
                <p className="text-[10px] uppercase tracking-wider text-blue-400 font-medium mb-2">Active This Week</p>
                <p className="text-3xl font-bold">{recentCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-stone-900/[0.04] rounded-xl p-6 border border-stone-900/10">
              <h3 className="text-sm font-medium mb-4">App Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Allow New Signups</p>
                    <p className="text-xs text-stone-900/30">Enable or disable new user registrations</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-emerald-500/30 flex items-center p-0.5 cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-emerald-400 ml-auto" />
                  </div>
                </div>
                <div className="h-px bg-stone-900/[0.06]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Require Email Verification</p>
                    <p className="text-xs text-stone-900/30">Users must verify email before accessing the app</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-emerald-500/30 flex items-center p-0.5 cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-emerald-400 ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-900/[0.04] rounded-xl p-6 border border-stone-900/10">
              <h3 className="text-sm font-medium mb-2">Portability</h3>
              <p className="text-xs text-stone-900/30 mb-4">
                This admin dashboard is designed to be portable. All WO.Buddy data lives in its own namespace (wobuddy_users, wobuddy_* tables)
                and can be migrated independently from the main Asentio platform.
              </p>
              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/10">
                <p className="text-xs text-emerald-400">✓ Separate user table • ✓ Isolated auth context • ✓ Portable schema</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const WOBuddyAdminDashboardWrapper = () => (
  <WOBuddyAuthProvider>
    <WOBuddyAdminDashboard />
  </WOBuddyAuthProvider>
);

export default WOBuddyAdminDashboardWrapper;
