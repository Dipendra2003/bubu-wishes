import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Shield, Activity, Monitor, LogOut, AlertTriangle, Clock, MapPin, Smartphone, CheckCircle, XCircle } from 'lucide-react';
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

interface SessionInfo {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  isCurrent?: boolean;
}

export default function SecurityPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityLogs();
    fetchSessions();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const res = await fetch('/api/auth/activity?limit=50', {
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

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setSessionsLoading(false);
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

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetchWithCsrf(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.ok) {
        toast('Session revoked successfully', 'success');
        setSessions(sessions.filter(s => s.id !== sessionId));
        fetchActivityLogs(); // Refresh logs to show revocation
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to revoke session');
      }
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'google_login':
        return <Monitor className="w-5 h-5 text-green-600" />;
      case 'google_signup':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'google_account_linked':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'logout':
        return <LogOut className="w-5 h-5 text-gray-600" />;
      case 'failed_login':
      case 'google_login_failed':
      case 'google_auth_failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'suspicious_login':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'account_locked':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'session_revoked':
        return <XCircle className="w-5 h-5 text-orange-600" />;
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
      case 'suspicious_login': return 'Suspicious Login Detected';
      case 'session_revoked': return 'Session Revoked';
      case 'google_login': return 'Google Login';
      case 'google_signup': return 'Google Signup';
      case 'google_account_linked': return 'Google Account Linked';
      case 'google_link_failed': return 'Google Link Failed';
      case 'google_auth_failed': return 'Google Auth Failed';
      case 'google_login_failed': return 'Google Login Failed';
      default: return action;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
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

  const getDeviceIcon = (deviceInfo: string | null) => {
    if (!deviceInfo) return <Monitor className="w-5 h-5 text-gray-500" />;
    const info = deviceInfo.toLowerCase();
    if (info.includes('ios') || info.includes('android') || info.includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-gray-500" />;
    }
    return <Monitor className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-black text-gray-900">Security & Activity</h1>
                <p className="text-sm text-gray-600">Monitor your account activity and manage sessions</p>
              </div>
            </div>

            {/* Security Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl border-2 border-green-100 bg-green-50 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-900">Account Secured</div>
                  <div className="text-xs text-green-700">Email verified and active</div>
                </div>
              </div>
              {user?.oauthProvider === 'google' ? (
                <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-bold text-blue-900">Google Connected</div>
                    <div className="text-xs text-blue-700">Using Google Authentication</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-gray-600" />
                  <div>
                    <div className="font-bold text-gray-900">Password Authentication</div>
                    <div className="text-xs text-gray-600">Using standard password</div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogoutAllDevices}
              disabled={logoutLoading}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              {logoutLoading ? 'Logging out...' : 'Logout from All Other Devices'}
            </button>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Monitor className="w-6 h-6 text-blue-500" />
              Active Sessions
            </h2>

            {sessionsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No active sessions found</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getDeviceIcon(session.deviceInfo)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {session.deviceInfo || 'Unknown Device'}
                          {session.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] uppercase font-black tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.ipAddress || 'Unknown IP'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last active: {formatDate(session.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokingId === session.id}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                      >
                        {revokingId === session.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${log.action === 'suspicious_login' ? 'text-orange-600' : 'text-gray-900'}`}>
                          {getActionLabel(log.action)}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
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
                          <span>{log.userAgent || 'Unknown Device'}</span>
                        </div>
                        
                        {log.metadata && (() => {
                          try {
                            const metadata = JSON.parse(log.metadata);
                            if (metadata.message) {
                              return (
                                <div className="text-xs text-orange-600 font-bold mt-1 bg-orange-50 p-2 rounded-lg">
                                  Alert: {metadata.message}
                                </div>
                              );
                            }
                            if (metadata.allDevices) {
                              return (
                                <div className="text-xs text-pink-600 font-bold mt-1">
                                  Logged out from all devices
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
