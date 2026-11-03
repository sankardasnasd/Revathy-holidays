import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin } from 'lucide-react';
import API from '../api';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    phone_number: '',
    address: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await API.post('auth/register/', {
          username: form.username,
          email: form.email,
          password: form.password,
          phone_number: form.phone_number,
          address: form.address,
        });
        alert('Account registered successfully! Please log in now.');
        setIsRegister(false);
        setForm({ username: form.username, email: '', password: '', phone_number: '', address: '' });
      } else {
        const res = await API.post('auth/login/', {
          username: form.username,
          password: form.password,
        });
        localStorage.setItem('token', res.data.access);
        localStorage.setItem('refreshToken', res.data.refresh);
        localStorage.setItem('username', form.username);
        onAuthSuccess(form.username);
        onClose();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.detail ||
        'Authentication failed. Please verify your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-amber-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-2xl font-bold text-slate-900 mb-1">
          {isRegister ? 'Pilgrim Registration' : 'Theertham Login'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {isRegister ? 'Create an account to reserve your pilgrimage seats' : 'Please log in to continue booking seats'}
        </p>

        {error && (
          <div className="mb-3 p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 gap-2 bg-slate-50 focus-within:border-amber-500 bg-white">
              <User className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full text-xs outline-none bg-transparent text-slate-800"
                placeholder="Username"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 gap-2 bg-slate-50 focus-within:border-amber-500 bg-white">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                    className="w-full text-xs outline-none bg-transparent text-slate-800"
                    placeholder="Phone Number (WhatsApp)"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Address</label>
                <div className="flex items-start border border-slate-200 rounded-xl px-3 py-2 gap-2 bg-slate-50 focus-within:border-amber-500 bg-white">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full text-xs outline-none bg-transparent text-slate-800 resize-none"
                    placeholder="Full residential address"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email (Optional)</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 gap-2 bg-slate-50 focus-within:border-amber-500 bg-white">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-xs outline-none bg-transparent text-slate-800"
                    placeholder="Email address"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 gap-2 bg-slate-50 focus-within:border-amber-500 bg-white">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full text-xs outline-none bg-transparent text-slate-800"
                placeholder="Password (minimum 6 characters)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md mt-2 cursor-pointer disabled:bg-slate-200"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-3">
          {isRegister ? 'Already have an account?' : 'New pilgrim?'}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-amber-700 font-bold hover:underline cursor-pointer"
          >
            {isRegister ? 'Log in here' : 'Register now'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;