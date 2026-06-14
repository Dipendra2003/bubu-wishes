import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Shield, Activity, Monitor, LogOut, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../ui/ToastProvider';
import { fetchWithCsrf } from '../../hooks/useCsrf';

interface ActivityLog {
  id: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  metadata: string | null;
  createdAt: string;
}

export default function SecurityPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const res = await fetch('/api/auth/activity', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to logout from all devices? You will need to login again on all your devices.')) {
      return;
    }

    setLogoutLoading(true);
    try {
      const res = await fetchWithCsrf('/api/auth/logout-all', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.ok) {
        toast('✅ Logged out from all devices', 'success');
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        throw new Error('Failed to logout');
      }
    } catch (error) {
      toast('Failed to logout from all devices', 'error');
    } finally {
      setLogoutLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <Monitor className="w-5 h-5 text-green-600" />;
      case 'logout':
        return <LogOut className="w-5 h-5 text-gray-600" />;
      case 'failed_login':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'account_locked':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'password_change':
      case 'password_reset':
        return <Shield className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'login': return 'Login';
      case 'logout': return 'Logout';
      case 'failed_login': return 'Failed Login Attempt';
      case 'account_locked': return 'Account Locked';
      case 'password_change': return 'Password Changed';
      case 'password_reset': return 'Password Reset';
      case 'email_change': return 'Email Changed';
      default: return action;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const parseUserAgent = (ua: string) => {
    if (!ua || ua === 'unknown') return 'Unknown Device';
    
    // Simple user agent parsing
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    if (ua.includes('Mobile')) return 'Mobile Device';
    return 'Desktop Browser';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-black text-gray-900">Security & Activity</h1>
                <p className="text-sm text-gray-600">Monitor your account activity and manage sessions</p>
              </div>
            </div>

            {/* Logout All Devices */}
            <button
              onClick={handleLogoutAllDevices}
              disabled={logoutLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              {logoutLoading ? 'Logging out...' : 'Logout from All Devices'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will sign you out everywhere and you'll need to login again
            </p>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-pink-500" />
              Recent Activity
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading activity...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No activity to display</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {getActionLabel(log.action)}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="font-mono">{log.ipAddress || 'Unknown IP'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Monitor className="w-3 h-3" />
                          <span>{parseUserAgent(log.userAgent)}</span>
                        </div>
                        
                        {log.metadata && (() => {
                          try {
                            const metadata = JSON.parse(log.metadata);
                            if (metadata.allDevices) {
                              return (
                                <div className="text-xs text-pink-600 font-medium">
                                  Logged out from all devices
                                </div>
                              );
                            }
                            if (metadata.method) {
                              return (
                                <div className="text-xs text-blue-600 font-medium">
                                  Method: {metadata.method}
                                </div>
                              );
                            }
                          } catch (e) {
                            return null;
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
