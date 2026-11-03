import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SeatLayout from './components/SeatLayout';
import AuthModal from './components/AuthModal';
import MyBookings from './components/MyBookings';
import MyAccount from './components/MyAccount';
import API from './api';
import {
  Calendar, Bus, Search, ChevronDown, ArrowRight, MapPin,
  Lock, Star, Headphones, X, Eye, CheckCircle2, MessageSquarePlus, Loader2
} from 'lucide-react';

const HERO_IMG = '/homeimage.png';

const trust = [
  { icon: Lock, a: 'Safe & Secure', b: 'Booking' },
  { icon: Bus, a: 'Comfortable', b: 'Travel' },
  { icon: Headphones, a: '24/7 Support', b: '' },
  { icon: Star, a: 'Trusted by', b: 'Thousands' },
];

const Field = ({ icon, label, chevron = true, className = '', children }) => (
  <label className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 flex-1 cursor-pointer ${className}`}>
    <span className="text-slate-800 shrink-0">{icon}</span>
    <span className="block w-full">
      <span className="block text-xs sm:text-[13px] font-semibold text-slate-800">{label}</span>
      <span className="relative block mt-0.5">
        {children}
        {chevron && <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />}
      </span>
    </span>
  </label>
);

const selectCls = 'w-full appearance-none bg-transparent text-xs sm:text-[13px] text-slate-700 pr-5 outline-none cursor-pointer font-medium';

function App() {
  const [tripsData, setTripsData] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [destOptions, setDestOptions] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [form, setForm] = useState({ dest: '', date: '', bus: 'All Buses' });

  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username') || '');
  const [activeTab, setActiveTab] = useState('trips');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialRegister, setAuthInitialRegister] = useState(false);

  const [activeTrip, setActiveTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState('');
  const [paymentType, setPaymentType] = useState('FULL');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reviewTrip, setReviewTrip] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // ബാക്കെൻഡിൽ നിന്ന് ഡാറ്റാബേസ് വഴി നേരിട്ട് ഫിൽട്ടർ ചെയ്തു ട്രിപ്പുകൾ കൊണ്ടുവരുന്നു
  const fetchTrips = (filters = {}) => {
    setLoadingTrips(true);

    const params = {};
    if (filters.dest) params.destination = filters.dest;
    if (filters.date) params.date = filters.date;

    API.get('trips/', { params })
      .then((res) => {
        if (res.data) {
          const now = new Date();
          let mapped = res.data.map((trip) => {
            const bookedList = trip.booked_seat_ids || [];
            const totalS = trip.bus?.total_seats || trip.bus?.seats?.length || 20;
            const arrivalDate = new Date(trip.arrival_datetime);

            return {
              id: trip.id,
              key: trip.destination,
              title: `${trip.destination} Special`,
              route: `${trip.source} → ${trip.destination}`,
              dates: new Date(trip.departure_datetime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              start: trip.departure_datetime ? trip.departure_datetime.split('T')[0] : '',
              bus: trip.bus?.bus_type?.toUpperCase().includes('AC') ? 'AC' : 'Non-AC',
              bus_name: trip.bus?.name || 'Revathy Bus',
              bus_number: trip.bus?.bus_number || 'KL Registered',
              seat_layout: '2x2 Layout',
              total_seats: totalS,
              booked_count: bookedList.length,
              price: parseFloat(trip.fare || 0),
              is_completed: arrivalDate < now,
              image: trip.bus?.image
                ? (trip.bus.image.startsWith('http') ? trip.bus.image : `http://127.0.0.1:8000${trip.bus.image}`)
                : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
              raw: trip,
            };
          });

          // Bus Type (AC / Non-AC) Filter
          if (filters.bus && filters.bus !== 'All Buses') {
            mapped = mapped.filter((t) => t.bus.toLowerCase() === filters.bus.toLowerCase());
          }

          setTripsData(mapped);

          // ഡ്രോപ്പ്ഡൗൺ ലിസ്റ്റിലേക്ക് എല്ലാ ഡെസ്റ്റിനേഷനുകളും സെറ്റ് ചെയ്യുന്നു (ആദ്യ ലോഡിൽ)
          if (!filters.dest && !filters.date) {
            const uniqueDests = Array.from(new Set(res.data.map((t) => t.destination).filter(Boolean)));
            setDestOptions(uniqueDests);
          }
        }
      })
      .catch(() => setTripsData([]))
      .finally(() => setLoadingTrips(false));
  };

  const fetchReviews = () => {
    API.get('reviews/')
      .then((res) => {
        if (res.data) {
          const fetched = res.data.map((r) => ({
            name: r.user?.username || r.username || 'Traveler',
            place: 'Verified Customer',
            text: r.comment,
            rating: r.rating || 5,
          }));
          setReviewsList(fetched);
        }
      })
      .catch(() => setReviewsList([]));
  };

  useEffect(() => {
    fetchTrips();
    fetchReviews();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSearch = (e) => {
    e.preventDefault();
    fetchTrips(form);
    document.getElementById('trips')?.scrollIntoView({ behavior: 'smooth' });
  };

  const reset = () => {
    const empty = { dest: '', date: '', bus: 'All Buses' };
    setForm(empty);
    fetchTrips();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    setCurrentUser('');
    setActiveTab('trips');
  };

  const handleOpenAuth = (isRegister = false) => {
    setAuthInitialRegister(isRegister);
    setIsAuthOpen(true);
  };

  const openSeatModal = (trip) => {
    const formattedTrip = trip.raw;
    setActiveTrip(formattedTrip);
    setSelectedSeats([]);
    setPassengers([]);
    setPaymentType('FULL');
    setSelectedBoardingPoint(formattedTrip.boarding_points?.[0]?.id || '');
  };

  const handleSeatClick = (seat) => {
    if (!currentUser) {
      setActiveTrip(null);
      handleOpenAuth(false);
      return;
    }

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
      setPassengers(passengers.filter((p) => p.seat !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
      setPassengers([
        ...passengers,
        { seat: seat.id, seat_number: seat.seat_number, passenger_name: '', passenger_age: '', passenger_gender: 'M' },
      ]);
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setActiveTrip(null);
      handleOpenAuth(false);
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    const hasIncompletePassenger = passengers.some(
      (p) => !p.passenger_name.trim() || !p.passenger_age
    );
    if (hasIncompletePassenger) {
      alert('Please fill name and age for all passengers.');
      return;
    }

    setBookingLoading(true);
    const payload = {
      trip: activeTrip.id,
      boarding_point: selectedBoardingPoint ? parseInt(selectedBoardingPoint, 10) : null,
      payment_type: paymentType,
      passenger_seats: passengers.map(({ seat, passenger_name, passenger_age, passenger_gender }) => ({
        seat,
        passenger_name: passenger_name.trim(),
        passenger_age: parseInt(passenger_age, 10),
        passenger_gender: passenger_gender || 'M',
      })),
    };

    try {
      const res = await API.post('bookings/', payload);
      const isAdv = res.data.payment_status === 'ADVANCE';
      alert(`Booking Successful with Revathy Holidays! ID: #${res.data.id}\n${isAdv ? `Advance Paid: ₹${res.data.paid_amount}. Remaining Balance: ₹${res.data.due_amount}` : `Total Paid: ₹${res.data.paid_amount}`}`);
      setActiveTrip(null);
      fetchTrips(form);
      setActiveTab('bookings');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Booking failed. Please try again.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      handleOpenAuth(false);
      return;
    }
    setReviewSubmitting(true);
    try {
      await API.post('reviews/', {
        trip: reviewTrip.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Thank you! Your review for Revathy Holidays has been submitted.');
      setReviewTrip(null);
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      const msg = err.response?.data?.[0] || err.response?.data?.detail || 'Could not submit review.';
      alert(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const totalAmount = activeTrip ? activeTrip.fare * selectedSeats.length : 0;
  const advanceAmount = Math.round(totalAmount * 0.30);
  const remainingDue = totalAmount - advanceAmount;

  return (
    <div id="top" className="min-h-screen bg-[#FBF9F4] text-slate-800 font-sans selection:bg-amber-400 selection:text-amber-950">
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAuthOpen={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* ================= TAB 1: TRIPS VIEW ================= */}
      {activeTab === 'trips' && (
        <>
          <section className="relative min-h-[580px] md:h-[640px] w-full flex items-center">
            <div className="absolute inset-0 overflow-hidden bg-[#1b1a10]">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMG}')` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pt-28 pb-32 md:pb-24">
              <div className="max-w-2xl">
                <h2 className="font-display text-white text-4xl sm:text-6xl md:text-7xl leading-[1.1]">
                  Your Journey
                  <span className="block text-amber-400 text-5xl sm:text-7xl md:text-8xl mt-1 font-script">Begins Here...</span>
                </h2>
                <p className="text-white/90 text-sm sm:text-base md:text-lg mt-5 max-w-md leading-relaxed">
                  Book holiday packages, pilgrimage tours, and luxury bus routes across Kerala with Revathy Holidays
                </p>
                <a
                  href="#trips"
                  className="inline-flex items-center gap-2.5 mt-6 sm:mt-8 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-sm sm:text-base px-6 py-3 sm:px-7 sm:py-3.5 rounded-2xl shadow-lg transition transform active:scale-95"
                >
                  Explore Trips <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 sm:-bottom-10 z-20 w-[calc(100%-2rem)] max-w-5xl">
              <form onSubmit={onSearch} className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2 border border-slate-100">
                <Field icon={<span className="text-xl sm:text-2xl">📍</span>} label="Destination" className="md:border-r border-slate-200">
                  <select className={selectCls} value={form.dest} onChange={set('dest')}>
                    <option value="">(All Destinations)</option>
                    {destOptions.map((dest) => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </Field>
                <Field icon={<Calendar className="w-5 h-5 text-amber-600" />} label="Journey Date" chevron={false} className="md:border-r border-slate-200">
                  <input type="date" className={selectCls} value={form.date} onChange={set('date')} />
                </Field>
                <Field icon={<Bus className="w-5 h-5 text-amber-600" />} label="Bus Type">
                  <select className={selectCls} value={form.bus} onChange={set('bus')}>
                    <option value="All Buses">All Buses</option>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>
                </Field>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm sm:text-base px-6 py-3.5 md:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition whitespace-nowrap shadow-md cursor-pointer"
                >
                  <Search className="w-5 h-5" /> Search
                </button>
              </form>
            </div>
          </section>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-24 pb-16">
            <div id="trips" className="text-center scroll-mt-24 mb-10">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Featured Tour & Travel Trips</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">Live departures and real-time seat availability by Revathy Holidays</p>
            </div>

            {loadingTrips ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <p className="text-xs font-semibold text-slate-500">Fetching live trips...</p>
              </div>
            ) : tripsData.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-600 font-medium">No trips currently scheduled matching your query.</p>
                <button onClick={reset} className="mt-4 px-6 py-2.5 rounded-xl bg-amber-400 text-amber-950 text-sm font-semibold cursor-pointer">
                  View All Available Trips
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tripsData.map((t) => {
                  const fullCount = t.booked_count || 0;
                  const freeCount = Math.max(0, (t.total_seats || 20) - fullCount);
                  return (
                    <article key={t.id} className="bg-white rounded-3xl overflow-hidden border border-amber-100/80 shadow-md flex flex-col justify-between hover:shadow-lg transition">
                      <div>
                        <div className="relative h-44 sm:h-48 bg-slate-200 overflow-hidden">
                          <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                          <span className="absolute top-3 right-3 bg-slate-900/80 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full">{t.bus}</span>
                          <div className="absolute bottom-3 left-4 right-4 text-white">
                            <h3 className="text-lg sm:text-xl font-bold drop-shadow">{t.title}</h3>
                            <p className="text-xs text-amber-200 flex items-center gap-1 drop-shadow-sm"><MapPin className="w-3.5 h-3.5" /> {t.route}</p>
                          </div>
                        </div>

                        <div className="p-4 sm:p-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border p-2.5 rounded-xl">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            <span>{t.dates}</span>
                          </div>

                          <div className="mt-3 p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/60 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-slate-800">{t.bus_name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{t.bus_number}</p>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-1 bg-white rounded-lg text-slate-700 shadow-xs">{t.seat_layout}</span>
                            </div>

                            <div className="pt-2 border-t border-amber-200/50 flex justify-between text-xs font-medium">
                              <span className="text-rose-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500" /> Booked: {fullCount}
                              </span>
                              <span className="text-emerald-700 flex items-center gap-1 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available: {freeCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Fare</span>
                          <span className="text-xl sm:text-2xl font-bold text-amber-700">₹{t.price}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {t.is_completed && (
                            <button
                              onClick={() => setReviewTrip(t)}
                              title="Write Review"
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 p-2.5 rounded-xl border border-amber-200 transition flex items-center cursor-pointer"
                            >
                              <MessageSquarePlus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openSeatModal(t)}
                            className="bg-slate-900 hover:bg-amber-600 text-white text-[11px] sm:text-xs font-bold px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> View Seats
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div id="about" className="mt-14 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 scroll-mt-24">
              <div className="bg-[#FDE9CF] rounded-3xl p-5 sm:p-7 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center border border-amber-200">
                {trust.map(({ icon: Icon, a, b }) => (
                  <div key={a} className="flex items-center gap-2.5 sm:gap-3">
                    <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </span>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                      {a}
                      {b && (
                        <>
                          <br />
                          {b}
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative rounded-3xl overflow-hidden min-h-[120px] flex items-center px-6 sm:px-8 py-6 bg-[#1f2a14] shadow-md">
                <div className="absolute inset-y-0 right-0 w-3/5 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMG}')` }} />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1f2a14] via-[#1f2a14]/90 to-transparent" />
                <p className="relative font-display text-white text-xl sm:text-2xl md:text-3xl leading-snug">
                  Experience The Best Travel<br />with <span className="text-amber-400">Revathy Holidays</span>
                </p>
              </div>
            </div>

            {reviewsList.length > 0 && (
              <>
                <div id="reviews" className="mt-16 flex items-center justify-between scroll-mt-24">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">What Our Travelers Say</h2>
                    <p className="text-xs text-slate-500 mt-1">Real reviews from passengers across Kerala</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {reviewsList.slice(0, 4).map((r, idx) => (
                    <figure key={idx} className="bg-white rounded-2xl p-5 shadow-xs border border-amber-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-xs">
                            {r.name?.[0] || 'R'}
                          </span>
                          <div>
                            <figcaption className="font-semibold text-xs sm:text-sm text-slate-900">{r.name}</figcaption>
                            <p className="text-[11px] text-slate-500">{r.place}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 mt-2.5 text-amber-500">
                          {[...Array(r.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <blockquote className="text-xs text-slate-600 mt-2 leading-relaxed italic">
                          "{r.text}"
                        </blockquote>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Customer
                      </div>
                    </figure>
                  ))}
                </div>
              </>
            )}
          </main>
        </>
      )}

      {/* ================= TAB 2: MY BOOKINGS ================= */}
      {activeTab === 'bookings' && <MyBookings />}

      {/* ================= TAB 3: MY ACCOUNT ================= */}
      {activeTab === 'account' && <MyAccount currentUser={currentUser} />}

      <footer id="contact" className="bg-[#1b1a10] text-white/80 text-sm text-center py-10 scroll-mt-24 border-t border-amber-900/40">
        <p className="font-display text-xl sm:text-2xl text-amber-400">Revathy Holidays</p>
        <p className="mt-1.5 text-xs text-slate-400">Comfortable Journeys, Lifelong Memories · Kerala Tour & Travels</p>
      </footer>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        initialRegister={authInitialRegister}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(name) => {
          setCurrentUser(name);
          setActiveTab('trips');
        }}
      />

      {/* REVIEW MODAL */}
      {reviewTrip && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-amber-100">
            <button
              onClick={() => setReviewTrip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-1">Trip Review & Feedback</h3>
            <p className="text-xs text-slate-500 mb-4">{reviewTrip.title} ({reviewTrip.route})</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`p-1 cursor-pointer ${star <= reviewRating ? 'text-amber-500' : 'text-slate-200'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Feedback / Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your travel experience with Revathy Holidays..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer disabled:bg-slate-200"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEATS PREVIEW & BOOKING MODAL */}
      {activeTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveTrip(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="border-b pb-4 mb-6">
              <span className="text-[11px] sm:text-xs font-bold text-amber-700 uppercase tracking-wide">{activeTrip.bus?.bus_type} • {activeTrip.bus?.bus_number}</span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{activeTrip.bus?.name}</h3>

              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] sm:text-xs font-semibold">
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                  🔴 Booked: {activeTrip.booked_seat_ids?.length || 0}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                  🟢 Free: {Math.max(0, (activeTrip.bus?.seats?.length || 20) - (activeTrip.booked_seat_ids?.length || 0))}
                </span>
                {!currentUser && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg">
                    🔒 Log in to reserve seats
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
              <div className="md:col-span-6 flex flex-col items-center justify-center overflow-x-auto pb-2">
                <SeatLayout
                  seats={activeTrip.bus?.seats}
                  bookedSeatIds={activeTrip.booked_seat_ids}
                  selectedSeats={selectedSeats}
                  onSeatClick={handleSeatClick}
                  isReadOnly={false}
                />
              </div>

              <div className="md:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Boarding Stop</label>
                    <select
                      value={selectedBoardingPoint}
                      onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-amber-300 bg-amber-50/70 rounded-xl outline-none"
                    >
                      {activeTrip.boarding_points?.map((bp) => (
                        <option key={bp.id} value={bp.id}>{bp.point_name} ({bp.formatted_time || bp.pickup_time})</option>
                      ))}
                    </select>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2">Passenger Information</h4>
                  {selectedSeats.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs text-slate-400">
                        {currentUser ? 'Tap green seats above to select' : 'Log in to select seats'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {passengers.map((passenger, idx) => (
                        <div key={passenger.seat} className="p-3 bg-slate-50 border rounded-xl space-y-2">
                          <span className="text-xs font-bold text-amber-800">Seat: {passenger.seat_number}</span>
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={passenger.passenger_name}
                            onChange={(e) => handlePassengerChange(idx, 'passenger_name', e.target.value)}
                            className="w-full text-xs p-2 border rounded-lg bg-white outline-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              required
                              placeholder="Age"
                              value={passenger.passenger_age}
                              onChange={(e) => handlePassengerChange(idx, 'passenger_age', e.target.value)}
                              className="w-full text-xs p-2 border rounded-lg bg-white outline-none"
                            />
                            <select
                              value={passenger.passenger_gender}
                              onChange={(e) => handlePassengerChange(idx, 'passenger_gender', e.target.value)}
                              className="w-full text-xs p-2 border rounded-lg bg-white outline-none"
                            >
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                              <option value="O">Other</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PAYMENT CHOICE: FULL vs ADVANCE */}
                  {selectedSeats.length > 0 && (
                    <div className="mt-4 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                      <label className="block text-xs font-bold text-amber-950 uppercase">Payment Option</label>

                      <div className="grid grid-cols-2 gap-2">
                        <label
                          onClick={() => setPaymentType('FULL')}
                          className={`p-2.5 rounded-xl border flex flex-col cursor-pointer transition ${
                            paymentType === 'FULL' ? 'bg-amber-400 text-amber-950 border-amber-500 font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-xs">Full Payment</span>
                          <span className="text-sm font-extrabold">₹{totalAmount}</span>
                        </label>

                        <label
                          onClick={() => setPaymentType('ADVANCE')}
                          className={`p-2.5 rounded-xl border flex flex-col cursor-pointer transition ${
                            paymentType === 'ADVANCE' ? 'bg-amber-400 text-amber-950 border-amber-500 font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-xs">Pay Advance (30%)</span>
                          <span className="text-sm font-extrabold text-amber-950">₹{advanceAmount}</span>
                          <span className="text-[10px] text-slate-600 font-normal">₹{remainingDue} due later</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-600">Selected Seats:</span>
                    <span className="font-bold text-slate-800">{selectedSeats.map((s) => s.seat_number).join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                    <span>Payable Now:</span>
                    <span className="text-amber-700 font-bold">
                      ₹{paymentType === 'ADVANCE' ? advanceAmount : totalAmount}
                    </span>
                  </div>

                  {!currentUser ? (
                    <button
                      onClick={() => {
                        setActiveTrip(null);
                        handleOpenAuth(false);
                      }}
                      className="w-full bg-slate-900 hover:bg-amber-600 text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <Lock className="w-4 h-4" /> Log In to Select & Reserve
                    </button>
                  ) : (
                    <button
                      disabled={selectedSeats.length === 0 || bookingLoading}
                      onClick={handleConfirmBooking}
                      className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 text-amber-950 font-bold py-3 sm:py-3.5 rounded-xl shadow-md cursor-pointer text-xs sm:text-sm"
                    >
                      {bookingLoading
                        ? 'Processing...'
                        : paymentType === 'ADVANCE'
                          ? `Pay Advance ₹${advanceAmount} & Reserve`
                          : `Pay Full ₹${totalAmount} & Reserve`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;