import React from "react";
import { Star, Calendar, MessageSquare } from "lucide-react";

export default function CounselorCard({ counselor, onBook, onMessage }) {
  // Select color accent based on service type
  const getThemeColors = (type) => {
    switch (type) {
      case "Mental Health":
        return {
          bg: "bg-emerald-50 text-emerald-700",
          border: "border-emerald-100",
          accent: "indigo",
          tag: "bg-emerald-100 text-emerald-800"
        };
      case "Relationship Advice":
        return {
          bg: "bg-rose-50 text-rose-700",
          border: "border-rose-100",
          accent: "rose",
          tag: "bg-rose-100 text-rose-800"
        };
      case "Career Counseling":
        return {
          bg: "bg-sky-50 text-sky-700",
          border: "border-sky-100",
          accent: "sky",
          tag: "bg-sky-100 text-sky-800"
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700",
          border: "border-slate-100",
          accent: "indigo",
          tag: "bg-slate-100 text-slate-800"
        };
    }
  };

  const themeColors = getThemeColors(counselor.serviceType);

  return (
    <div
      id={`counselor-card-${counselor.id}`}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-bento hover:shadow-bento-hover hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full group"
    >
      {/* Upper Area with Avatar & Header Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={counselor.avatar}
                alt={counselor.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-3xs"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider font-mono ${themeColors.bg}`}>
                  {counselor.serviceType}
                </span>
              </div>
              <h3 className="text-xl font-bold font-display tracking-tight text-slate-900 mt-1.5 leading-snug group-hover:text-indigo-600 transition-colors">
                {counselor.name}
              </h3>
              <p className="text-xs font-semibold text-slate-400 font-mono tracking-wide">{counselor.role}</p>
            </div>
          </div>

          {/* Bio paragraph */}
          <p className="mt-4 text-xs text-slate-600 leading-relaxed line-clamp-3">
            {counselor.bio}
          </p>
        </div>

        {/* Specialties tags */}
        <div className="mt-5 pt-4 border-t border-slate-50 flex flex-wrap gap-1.5">
          {counselor.specialties.map((spec, index) => (
            <span
              key={index}
              className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-150"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Meta Bar */}
      <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <div className="flex items-center gap-1">
          <Star className="text-amber-500 fill-amber-400" size={13} />
          <span className="font-bold text-slate-800">{counselor.rating}</span>
          <span>({counselor.reviewsCount} reviews)</span>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-slate-400">Rate:</span>
          <span className="text-xs font-bold text-slate-900">₹{counselor.price}</span>
          <span className="text-[10px] text-slate-400">/hr</span>
        </div>
      </div>

      {/* Booking Action Bar */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 mt-auto">
        <button
          id={`msg-btn-${counselor.id}`}
          onClick={() => onMessage(counselor)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-100 text-xs font-bold transition-all"
        >
          <MessageSquare size={14} />
          <span>Quick Chat</span>
        </button>

        <button
          id={`book-btn-${counselor.id}`}
          onClick={() => onBook(counselor)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
        >
          <Calendar size={14} />
          <span>Book Session</span>
        </button>
      </div>
    </div>
  );
}
