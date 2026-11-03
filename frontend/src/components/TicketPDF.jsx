import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Calendar, MapPin } from 'lucide-react';

const TicketPDF = ({ booking }) => {
  const downloadPDF = async () => {
    const ticketElement = document.getElementById(`ticket-${booking.id}`);
    if (!ticketElement) return;

    ticketElement.style.display = 'block';

    const canvas = await html2canvas(ticketElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`Revathy_Holidays_Ticket_${booking.id}.pdf`);

    ticketElement.style.display = 'none';
  };

  return (
    <>
      <button
        onClick={downloadPDF}
        className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" /> Download Ticket
      </button>

      {/* Printable Ticket Container */}
      <div
        id={`ticket-${booking.id}`}
        style={{ display: 'none', width: '700px', backgroundColor: '#ffffff' }}
        className="p-8 border-2 border-amber-500 rounded-3xl font-sans text-slate-800"
      >
        <div className="flex justify-between items-center border-b-2 border-amber-500 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🚌</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Revathy Holidays</h1>
              <p className="text-[10px] uppercase font-bold text-amber-700 tracking-widest mt-1">Kerala Tour & Pilgrim Travel Services</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Booking Reference</span>
            <span className="text-xl font-mono font-bold text-slate-900">#{booking.id}</span>
          </div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{booking.trip_details?.destination} Travel Service</h2>
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-700" /> {booking.trip_details?.source} → {booking.trip_details?.destination}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Departure</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1 justify-end">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              {new Date(booking.trip_details?.departure_datetime).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
          <div className="border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Bus Specifications</span>
            <p className="font-bold text-sm text-slate-800">{booking.trip_details?.bus?.name}</p>
            <p className="text-slate-600">{booking.trip_details?.bus?.bus_type} ({booking.trip_details?.bus?.bus_number})</p>
          </div>
          <div className="border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Boarding Stop</span>
            <p className="font-bold text-sm text-slate-800">{booking.boarding_point_name || 'Main Bus Stand'}</p>
            <p className="text-slate-600">Please report 15 mins prior to departure</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Reserved Passenger Details</h3>
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 border-b text-slate-600">
              <tr>
                <th className="p-2.5">Seat No</th>
                <th className="p-2.5">Passenger Name</th>
                <th className="p-2.5">Age</th>
                <th className="p-2.5">Gender</th>
              </tr>
            </thead>
            <tbody>
              {booking.passengers?.map((p, idx) => (
                <tr key={idx} className="border-b last:border-0 font-medium">
                  <td className="p-2.5 font-bold text-amber-800">{p.seat_number}</td>
                  <td className="p-2.5">{p.passenger_name}</td>
                  <td className="p-2.5">{p.passenger_age}</td>
                  <td className="p-2.5">{p.passenger_gender === 'M' ? 'Male' : p.passenger_gender === 'F' ? 'Female' : 'Other'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-dashed border-slate-200 pt-4 flex justify-between items-end">
          <div className="text-xs space-y-1">
            <p><span className="text-slate-500">Total Ticket Fare:</span> <span className="font-bold">₹{booking.total_fare}</span></p>
            <p><span className="text-slate-500">Paid Amount:</span> <span className="font-bold text-emerald-700">₹{booking.paid_amount}</span></p>
            <p><span className="text-slate-500">Balance Due:</span> <span className="font-bold text-rose-600">₹{booking.due_amount || 0}</span></p>
            <span className="inline-block mt-1 font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {booking.payment_status === 'FULL' ? 'Fully Paid' : 'Advance Paid'}
            </span>
          </div>

          <div className="text-right text-[10px] text-slate-500">
            <p className="font-bold text-slate-800">Revathy Holidays</p>
            <p className="mt-0.5">Helpline: +91 9961207239</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketPDF;