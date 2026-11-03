import React, { useState } from 'react';
import { 
  Compass, 
  CalendarCheck, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Info,
  Menu,
  X
} from 'lucide-react';

const Navbar = ({ currentUser, activeTab, setActiveTab, onAuthOpen, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = activeTab === 'trips';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`w-full z-40 transition-all duration-300 ${
        isHome 
          ? 'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/85 via-black/50 to-transparent text-white' 
          : 'sticky top-0 bg-[#1b1a10]/95 backdrop-blur-md text-white border-b border-amber-900/40 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          onClick={() => handleTabSwitch('trips')} 
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <span className="text-3xl filter drop-shadow">🚌</span>
          <div>
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white block leading-none drop-shadow-sm">
              Revathy Holidays
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-400 font-bold block mt-0.5">
              Tour & Travels Kerala
            </span>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-xs lg:text-sm font-semibold">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => handleTabSwitch('trips')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === 'trips'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold backdrop-blur-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-400" /> Trips
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('bookings')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold backdrop-blur-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-amber-400" /> My Bookings
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('account')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === 'account'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold backdrop-blur-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4 text-amber-400" /> My Account
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition ml-2 cursor-pointer font-bold border border-transparent hover:border-rose-500/20"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  handleTabSwitch('trips');
                  document.getElementById('trips')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 text-white/90 hover:text-amber-300 transition py-1 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-400" /> Trips
              </button>

              <a
                href="#about"
                className="flex items-center gap-1.5 text-white/90 hover:text-amber-300 transition py-1"
              >
                <Info className="w-4 h-4 text-amber-400" /> About
              </a>

              <button
                type="button"
                onClick={() => onAuthOpen(false)}
                className="flex items-center gap-1.5 text-white hover:text-amber-300 px-3 py-2 rounded-xl hover:bg-white/10 transition cursor-pointer font-semibold ml-1"
              >
                <LogIn className="w-4 h-4 text-amber-400" /> Login
              </button>

              <button
                type="button"
                onClick={() => onAuthOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </>
          )}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/90 hover:text-amber-400 rounded-xl transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1b1a10]/98 backdrop-blur-xl border-b border-amber-900/40 px-6 py-5 space-y-3">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => handleTabSwitch('trips')}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-sm font-semibold transition ${
                  activeTab === 'trips' ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-white/80'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-400" /> Trips
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('bookings')}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-sm font-semibold transition ${
                  activeTab === 'bookings' ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-white/80'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-amber-400" /> My Bookings
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('account')}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-sm font-semibold transition ${
                  activeTab === 'account' ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-white/80'
                }`}
              >
                <User className="w-4 h-4 text-amber-400" /> My Account
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-sm font-bold text-rose-400 bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  handleTabSwitch('trips');
                  document.getElementById('trips')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-sm font-semibold text-white/90"
              >
                <Compass className="w-4 h-4 text-amber-400" /> Trips
              </button>

              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-sm font-semibold text-white/90"
              >
                <Info className="w-4 h-4 text-amber-400" /> About
              </a>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAuthOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-amber-400" /> Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAuthOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <UserPlus className="w-4 h-4" /> Register
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;