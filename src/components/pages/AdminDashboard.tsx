import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Users, Search, Mail, ShieldCheck, MailWarning, Gift, Trash2, Ban, CheckCircle2, TrendingUp, BarChart, Star, MessageSquare } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'wishes' | 'reviews'>('analytics');
  const { toast } = useToast();

  const fetchAdminData = async () => {
    try {
      const [usersRes, wishesRes, metricsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/wishes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/metrics', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/reviews', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      console.log('Reviews Response Status:', reviewsRes.status, reviewsRes.ok);
      
      if (usersRes.ok && wishesRes.ok && metricsRes.ok && reviewsRes.ok) {
        const usersData = await usersRes.json();
        const wishesData = await wishesRes.json();
        const metricsData = await metricsRes.json();
        const reviewsData = await reviewsRes.json();
        
        console.log('Reviews Data:', reviewsData);
        
        setUsers(usersData);
        setWishes(wishesData);
        setMetrics(metricsData);
        setReviews(reviewsData);
      } else {
        console.error('One or more requests failed:', {
          users: usersRes.status,
          wishes: wishesRes.status,
          metrics: metricsRes.status,
          reviews: reviewsRes.status
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleToggleSuspend = async (id: string) => {
    if (!confirm("Toggle suspend status for this user?")) return;
    try {
      await fetch(`/api/admin/users/${id}/toggle-suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminData();
      toast('User suspension status toggled', 'success');
    } catch (e) {
      toast('Failed to toggle status', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to completely DELETE this user?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminData();
      toast('User deleted forever', 'success');
    } catch (e) {
      toast('Failed to delete user', 'error');
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wish/card?")) return;
    try {
      await fetch(`/api/wishes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminData();
      toast('Card deleted successfully', 'success');
    } catch (e) {
      toast('Failed to delete card', 'error');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await fetch(`/api/admin/reviews/${id}/toggle-featured`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminData();
      toast('Review featured status toggled', 'success');
    } catch (e) {
      toast('Failed to toggle featured status', 'error');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminData();
      toast('Review deleted successfully', 'success');
    } catch (e) {
      toast('Failed to delete review', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-pink-500 font-bold max-w-7xl mx-auto">Loading admin data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 font-medium">Manage platform users and view statistics</p>
      </div>

      <div className="flex gap-4 mb-6 sticky top-0 bg-gray-50 z-10 py-4 w-full overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          <BarChart className="w-4 h-4" /> Analytics Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${activeTab === 'users' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          <Users className="w-4 h-4" /> Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('wishes')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${activeTab === 'wishes' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          <Gift className="w-4 h-4" /> Manage Cards
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          <Star className="w-4 h-4" /> Manage Reviews
        </button>
      </div>

      {activeTab === 'analytics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
                <p className="text-3xl font-black text-gray-800">{metrics.totalUsers}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-500"><Users className="w-6 h-6" /></div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Verified %</p>
                <p className="text-3xl font-black text-gray-800">
                  {metrics.totalUsers > 0 ? Math.round((metrics.verifiedUsers / metrics.totalUsers) * 100) : 0}%
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl text-green-500"><ShieldCheck className="w-6 h-6" /></div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Cards Created</p>
                <p className="text-3xl font-black text-gray-800">{metrics.totalCards}</p>
              </div>
              <div className="bg-pink-50 p-3 rounded-xl text-pink-500"><Gift className="w-6 h-6" /></div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Admins Access</p>
                <p className="text-3xl font-black text-gray-800">{metrics.adminUsers}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl text-purple-500"><ShieldCheck className="w-6 h-6" /></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full font-sans">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Platform Growth
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '14px' }}
                    labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="cardsCreated" name="Cards Created" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorCards)" />
                  <Area type="monotone" dataKey="signups" name="New Users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSignups)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {metrics.trendData.length === 0 && (
              <div className="flex h-full items-center justify-center -mt-40 text-gray-400 font-medium pb-20">
                Not enough historical data to display trends.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                        {u.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-500 font-medium flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {u.verified ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600"><ShieldCheck className="w-3.5 h-3.5"/> Verified</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500"><MailWarning className="w-3.5 h-3.5"/> Pending</span>
                      )}
                      {u.suspended && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-500"><Ban className="w-3.5 h-3.5"/> Suspended</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={() => handleToggleSuspend(u.id)} className="text-amber-600 font-bold hover:text-amber-800 text-sm p-2">
                          {u.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 font-bold hover:text-red-700 text-sm p-2">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'wishes' && (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-gray-800">All Magic Cards</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Card Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Author</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {wishes.map(w => (
                <tr key={w.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-pink-600 mb-1">To: {w.recipient}</div>
                    <div className="text-sm text-gray-500 font-medium line-clamp-2 italic w-64">"{w.message}"</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{w.authorName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/card?id=${w.id}`} target="_blank" className="inline-block text-blue-600 font-bold hover:text-blue-800 text-sm p-2">View</a>
                    <button onClick={() => handleDeleteWish(w.id)} className="text-red-500 font-bold hover:text-red-700 text-sm p-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'reviews' && (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-gray-800">User Reviews & Ratings</h2>
           <p className="text-sm text-gray-500 font-medium mt-1">Manage user feedback and feature reviews on the landing page</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Review</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No reviews submitted yet</p>
                  </td>
                </tr>
              ) : (
                reviews.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                          {r.userName ? r.userName.substring(0,2).toUpperCase() : 'AN'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{r.userName || 'Anonymous'}</div>
                          <div className="text-sm text-gray-500 font-medium">{r.userEmail || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {Array(parseInt(r.rating) || 5).fill(0).map((_, idx) => (
                          <Star key={idx} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        ))}
                        <span className="ml-1 text-sm font-bold text-gray-600">({r.rating})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 font-medium line-clamp-2 max-w-md italic">"{r.comment}"</div>
                    </td>
                    <td className="px-6 py-4">
                      {r.featured ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest bg-amber-100 text-amber-700">
                          <Star className="w-3 h-3" fill="currentColor" /> Featured
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest bg-gray-100 text-gray-600">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleFeatured(r.id)} 
                        className={`font-bold hover:opacity-70 text-sm p-2 ${r.featured ? 'text-gray-600' : 'text-amber-600'}`}
                      >
                        {r.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button onClick={() => handleDeleteReview(r.id)} className="text-red-500 font-bold hover:text-red-700 text-sm p-2">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
