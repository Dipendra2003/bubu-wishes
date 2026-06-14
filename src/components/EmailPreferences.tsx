import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { useToast } from './ui/ToastProvider';
import { Bell, BellOff, Clock, Calendar, Mail, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { fetchWithCsrf } from '../hooks/useCsrf';

interface Preferences {
  emailReminders: boolean;
  reminderDays: string;
  reminderTime: string;
  birthdayWishEmail: boolean;
  timezone: string;
}

export default function EmailPreferences() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    emailReminders: true,
    reminderDays: '1,3,7',
    reminderTime: '08:00',
    birthdayWishEmail: true,
    timezone: 'UTC'
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch preferences');

      const data = await res.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast('Failed to load preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithCsrf('/api/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save preferences');
      }

      const data = await res.json();
      setPreferences(data);
      toast('Preferences saved successfully!', 'success');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast(error.message || 'Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all preferences to defaults?')) return;

    setSaving(true);
    try {
      const res = await fetchWithCsrf('/api/preferences/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to reset preferences');

      const data = await res.json();
      setPreferences(data);
      toast('Preferences reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting preferences:', error);
      toast('Failed to reset preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReminderDaysChange = (day: number, checked: boolean) => {
    const days = preferences.reminderDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    
    if (checked && !days.includes(day)) {
      days.push(day);
    } else if (!checked && days.includes(day)) {
      const index = days.indexOf(day);
      days.splice(index, 1);
    }

    days.sort((a, b) => a - b);
    setPreferences({ ...preferences, reminderDays: days.join(',') });
  };

  const isReminderDaySelected = (day: number): boolean => {
    const days = preferences.reminderDays.split(',').map(d => parseInt(d.trim()));
    return days.includes(day);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-pink-500 font-semibold">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Email Preferences</h2>
              <p className="text-pink-100 text-sm mt-1">Manage your birthday reminder settings</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Reminders Toggle */}
          <div className="flex items-start justify-between p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
            <div className="flex items-start gap-3 flex-1">
              {preferences.emailReminders ? (
                <Bell className="w-6 h-6 text-pink-500 mt-0.5 flex-shrink-0" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Birthday Reminders</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get email notifications before your contacts' birthdays
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, emailReminders: !preferences.emailReminders })}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                preferences.emailReminders ? 'bg-pink-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.emailReminders ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reminder Days Selection */}
          {preferences.emailReminders && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-gray-900">Remind me before birthday:</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {[1, 3, 7, 14].map((day) => (
                  <label
                    key={day}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isReminderDaySelected(day)
                        ? 'bg-pink-100 border-pink-500 text-pink-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isReminderDaySelected(day)}
                      onChange={(e) => handleReminderDaysChange(day, e.target.checked)}
                      className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="font-semibold">
                      {day === 1 ? '1 day' : `${day} days`}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Select multiple days to get reminders at different intervals
              </p>
            </div>
          )}

          {/* Reminder Time */}
          {preferences.emailReminders && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-gray-900">Preferred reminder time:</h3>
              </div>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={(e) => setPreferences({ ...preferences, reminderTime: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all font-semibold text-lg"
              />
              <p className="text-sm text-gray-500">
                Reminders will be sent around this time in your timezone
              </p>
            </div>
          )}

          {/* Birthday Wish Email Toggle */}
          <div className="flex items-start justify-between p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-start gap-3 flex-1">
              <Mail className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Birthday Wish Emails</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically send birthday wishes to your contacts on their special day
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, birthdayWishEmail: !preferences.birthdayWishEmail })}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                preferences.birthdayWishEmail ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.birthdayWishEmail ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-blue-500 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-blue-900">How Birthday Reminders Work</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• You'll receive reminder emails before your contacts' birthdays</li>
              <li>• Reminders are only sent if you haven't created a card yet</li>
              <li>• Birthday wish emails are sent to contacts who have email addresses</li>
              <li>• All emails respect your timezone settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
