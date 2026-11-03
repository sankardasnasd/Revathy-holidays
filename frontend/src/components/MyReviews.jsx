import React, { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import API from '../api';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    API.get('reviews/')
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this review?")) return;
    try {
      await API.delete(`reviews/${id}/`);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-display">My Reviews</h2>
        <p className="text-xs text-slate-500 mt-1">Submitted ratings and pilgrim journey experiences</p>
      </div>

      {reviews.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed rounded-3xl text-slate-400 text-xs">
          You haven't submitted any reviews yet. Complete a pilgrimage trip to write a review.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start">
              <div>
                <div className="flex gap-1 text-amber-500 mb-1.5">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{r.comment}</p>
                <span className="text-[10px] text-slate-400 block mt-2">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => handleDelete(r.id)}
                className="text-slate-400 hover:text-rose-600 p-2 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;