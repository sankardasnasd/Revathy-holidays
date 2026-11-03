import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, IndianRupee, CheckCircle2, AlertCircle, Ban } from 'lucide-react';
import API from '../api';
import TicketPDF from './TicketPDF';

const MyBookings = () => {
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    API.get('bookings/')
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayDue = async (id, due) => {
    if (!window.confirm(`Confirm paying the remaining balance of ₹${due}?`)) return;

    setPayingId(id);
    try {
      await API.post(`bookings/${id}/pay_due/`);
      alert(`Payment Successful! Your remaining balance of ₹${due} is cleared.`);
      fetchBookings();
    } catch {
      alert('Balance payment failed. Please try again.');
    } finally {
      setPayingId(null);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Reserved seats will be released.")) return;

    setCancellingId(id);
    try {
      await API.post(`bookings/${id}/cancel_booking/`);
      alert("Booking has been cancelled successfully!");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const displayed = bookings.filter((b) => {
    const tripDate = new Date(b.trip_details?.departure_datetime);
    if (filter === 'future') return tripDate >= now && b.booking_status !== 'CANCELLED';
    if (filter === 'completed') return tripDate < now && b.booking_status !== 'CANCELLED';
    if (filter === 'cancelled') return b.booking_status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">My Bookings</h2>
          <p className="text-xs text-slate-500 mt-1">Track pilgrimage schedules, download tickets, pay dues, or cancel bookings</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'future', 'completed', 'cancelled'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                filter === type
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-white border text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type === 'future' ? 'Upcoming Journeys' : type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading bookings...</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
          No bookings found in this category.
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {displayed.map((b) => {
            const tripDate = new Date(b.trip_details?.departure_datetime);
            const isCompleted = tripDate < now;
            const isCancelled = b.booking_status === 'CANCELLED';
            const due = parseFloat(b.due_amount || 0);

            return (
              <div 
                key={b.id} 
                className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition ${
                  isCancelled ? 'border-rose-200 opacity-75 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{b.id}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isCancelled 
                        ? 'bg-rose-100 text-rose-800' 
                        : isCompleted 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isCancelled ? 'Booking Cancelled' : isCompleted ? 'Journey Completed' : 'Upcoming Journey'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{b.trip_details?.destination} Pilgrimage</h3>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" /> {b.trip_details?.source} → {b.trip_details?.destination}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" /> {tripDate.toLocaleDateString()}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <p><span className="text-slate-500">Bus:</span> <span className="font-semibold">{b.trip_details?.bus?.name}</span></p>
                    <p><span className="text-slate-500">Boarding Point:</span> <span className="font-semibold">{b.boarding_point_name || 'Main Stand'}</span></p>
                    <p><span className="text-slate-500">Reserved Seats:</span> <span className="font-bold text-amber-800">{b.passengers?.map((p) => p.seat_number).join(', ') || (isCancelled ? 'Released' : 'None')}</span></p>
                  </div>
                </div>

                <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Ticket Fare:</span>
                      <span className="font-bold">₹{b.total_fare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paid Amount:</span>
                      <span className="font-bold text-emerald-700">₹{b.paid_amount}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-700 font-bold">Balance Due:</span>
                      <span className="font-bold text-rose-600 text-sm">₹{due}</span>
                    </div>

                    <div className="mt-2">
                      {isCancelled ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 p-2 rounded-xl">
                          <Ban className="w-4 h-4" /> Cancelled
                        </span>
                      ) : due === 0 || b.payment_status === 'FULL' ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" /> Fully Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 p-2 rounded-xl">
                          <AlertCircle className="w-4 h-4" /> Advance Paid (₹{due} Due)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS (DOWNLOAD, PAY DUE, CANCEL) */}
                  <div className="mt-4 flex flex-col gap-2">
                    {!isCancelled && <TicketPDF booking={b} />}

                    {!isCancelled && due > 0 && (
                      <button
                        disabled={payingId === b.id}
                        onClick={() => handlePayDue(b.id, due)}
                        className="w-full bg-slate-900 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <IndianRupee className="w-3.5 h-3.5" /> 
                        {payingId === b.id ? 'Clearing Due...' : `Pay Remaining ₹${due}`}
                      </button>
                    )}

                    {!isCancelled && !isCompleted && (
                      <button
                        disabled={cancellingId === b.id}
                        onClick={() => handleCancelBooking(b.id)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;