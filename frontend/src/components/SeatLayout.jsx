import React from 'react';
import { Armchair } from 'lucide-react';

const SeatLayout = ({ seats = [], bookedSeatIds = [], selectedSeats = [], onSeatClick, isReadOnly = false }) => {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b);

  return (
    <div className="w-full max-w-xs bg-slate-50 p-5 rounded-3xl border border-slate-200">
      {/* Driver Cabin */}
      <div className="flex justify-between items-center border-b pb-3 mb-4 text-xs font-semibold text-slate-500">
        <span>Entry Door</span>
        <span className="px-2.5 py-1 bg-slate-200 rounded-lg text-slate-700 font-mono text-[10px]">Driver 💺</span>
      </div>

      {/* Seat Grid (2x2 Layout) */}
      <div className="space-y-3">
        {rows.map((rowNum) => {
          const rowSeats = seats
            .filter((s) => s.row === rowNum)
            .sort((a, b) => a.column - b.column);

          const leftSeats = rowSeats.filter((s) => s.column <= 2);
          const rightSeats = rowSeats.filter((s) => s.column > 2);

          return (
            <div key={rowNum} className="flex justify-between items-center">
              {/* Left 2 seats */}
              <div className="flex gap-2">
                {leftSeats.map((seat) => {
                  const isBooked = bookedSeatIds.includes(seat.id);
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);

                  let btnCls = 'bg-white border-emerald-400 text-emerald-800 hover:bg-emerald-50';
                  if (isBooked) {
                    btnCls = 'bg-rose-100 border-rose-300 text-rose-500 cursor-not-allowed opacity-80';
                  } else if (isSelected) {
                    btnCls = 'bg-amber-400 border-amber-500 text-amber-950 font-bold shadow-md';
                  }

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isBooked || isReadOnly}
                      onClick={() => onSeatClick && onSeatClick(seat)}
                      className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center text-[10px] transition ${btnCls} ${
                        isReadOnly && !isBooked ? 'cursor-default' : ''
                      }`}
                    >
                      <Armchair className="w-3.5 h-3.5 mb-0.5" />
                      <span>{seat.seat_number}</span>
                    </button>
                  );
                })}
              </div>

              {/* Aisle */}
              <div className="w-5 text-center text-[9px] text-slate-300">|</div>

              {/* Right 2 seats */}
              <div className="flex gap-2">
                {rightSeats.map((seat) => {
                  const isBooked = bookedSeatIds.includes(seat.id);
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);

                  let btnCls = 'bg-white border-emerald-400 text-emerald-800 hover:bg-emerald-50';
                  if (isBooked) {
                    btnCls = 'bg-rose-100 border-rose-300 text-rose-500 cursor-not-allowed opacity-80';
                  } else if (isSelected) {
                    btnCls = 'bg-amber-400 border-amber-500 text-amber-950 font-bold shadow-md';
                  }

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isBooked || isReadOnly}
                      onClick={() => onSeatClick && onSeatClick(seat)}
                      className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center text-[10px] transition ${btnCls} ${
                        isReadOnly && !isBooked ? 'cursor-default' : ''
                      }`}
                    >
                      <Armchair className="w-3.5 h-3.5 mb-0.5" />
                      <span>{seat.seat_number}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="mt-5 pt-3 border-t border-slate-200 flex justify-around text-[10px] text-slate-600">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border border-emerald-400" /> Free
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" /> Full / Booked
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500" /> Selected
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;