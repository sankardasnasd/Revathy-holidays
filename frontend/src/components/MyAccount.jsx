import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Save, Star, Trash2 } from 'lucide-react';
import API from '../api';

const MyAccount = ({ currentUser }) => {
  const [profile, setProfile] = useState({ username: currentUser, email: '', phone_number: '', address: '' });
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [reviews, setReviews] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch Profile Details
    API.get('auth/me/')
      .then((res) => {
        setProfile({
          username: res.data.username,
          email: res.data.email || '',
          phone_number: res.data.profile?.phone_number || '',
          address: res.data.profile?.address || '',
        });
      })
      .catch(() => {});

    // 2. Fetch User's Reviews
    API.get('reviews/')
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatusMsg({ error: '', success: '' });

    if (passwords.new_password !== passwords.confirm_password) {
      setStatusMsg({ error: 'New password and confirm password do not match.', success: '' });
      return;
    }

    setLoading(true);
    try {
      await API.post('auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      setStatusMsg({ error: '', success: 'Password updated successfully!' });
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setStatusMsg({
        error: err.response?.data?.detail || 'Failed to update password.',
        success: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Do you want to delete this review?")) return;
    try {
      await API.delete(`reviews/${id}/`);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 font-display">My Account</h2>
        <p className="text-xs text-slate-500 mt-1">Manage profile information, password security, and submitted reviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b pb-3">Devotee Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Username</label>
              <div className="p-2.5 bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> {profile.username}
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Phone Number</label>
              <div className="p-2.5 bg-slate-50 rounded-xl font-semibold text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> {profile.phone_number || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Address</label>
              <div className="p-2.5 bg-slate-50 rounded-xl font-semibold text-slate-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" /> {profile.address || 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base border-b pb-3">Change Password</h3>

          {statusMsg.error && (
            <div className="mt-3 p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {statusMsg.error}
            </div>
          )}
          {statusMsg.success && (
            <div className="mt-3 p-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
              {statusMsg.success}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.old_password}
                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-xl outline-none focus:border-amber-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-xl outline-none focus:border-amber-500"
                placeholder="New password (min 6 chars)"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-xl outline-none focus:border-amber-500"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-200"
            >
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Embedded My Reviews Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-base border-b pb-3">My Submitted Reviews</h3>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
            You haven't submitted any reviews yet. Complete a pilgrimage journey to review it.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-start">
                <div>
                  <div className="flex gap-1 text-amber-500 mb-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{r.comment}</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={() => handleDeleteReview(r.id)}
                  className="text-slate-400 hover:text-rose-600 p-2 transition cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;