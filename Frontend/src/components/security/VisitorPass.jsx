import React, { forwardRef } from "react";

const VisitorPass = forwardRef(({ visitor, eventDetails }, ref) => {
  if (!visitor) return null;

  // Static or random pass number if not provided by backend
  const passNo = visitor.passNo || `VP-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="hidden">
      {/* Wrapper to handle page centering during print */}
      <div ref={ref} className="w-full flex justify-center py-6 font-sans">
        
        {/* The Card Container: designed to fit standard 85mm pass width */}
        <div className="w-[85mm] bg-white flex flex-col items-center text-center p-6 border-2 border-slate-900 rounded-2xl shadow-md relative overflow-hidden">
          {/* Subtle line decoration at the top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900"></div>

          {/* Guest Badge */}
          <div className="mt-4 mb-6">
            <span className="bg-slate-100 text-slate-900 px-5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border border-slate-200">
              {visitor.passType || "GUEST"}
            </span>
          </div>

          {/* Event Name Section */}
          <div className="mb-5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Event Title
            </p>
            <h4 className="text-lg font-black text-slate-800 uppercase leading-tight px-2">
              {visitor.eventName}
            </h4>
          </div>

          {/* Visitor Name Section */}
          <div className="mb-6">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Visitor Name
            </p>
            <h3 className="text-3xl font-black text-slate-900 leading-[1.0] uppercase wrap-break-word px-2">
              {visitor.name.split(' ').map((part, i) => (
                <React.Fragment key={i}>
                  {part} <br />
                </React.Fragment>
              ))}
            </h3>
          </div>

          {/* Organization Section */}
          <div className="mb-6">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">
              Institution / Organization
            </p>
            <h4 className="text-sm font-bold text-slate-650 uppercase leading-tight px-3">
              {visitor.organization || "Independent Attendee"}
            </h4>
          </div>

          {/* Dotted Divider */}
          <div className="w-full border-t border-dashed border-slate-300 mb-6"></div>

          {/* Logistics Grid */}
          <div className="w-full grid grid-cols-2 gap-y-4 text-left text-slate-800 px-2">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pass Serial</p>
              <p className="text-xs font-mono font-bold text-slate-900">{passNo}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
              <p className="text-xs font-bold text-slate-955">{new Date().toLocaleDateString("en-GB")}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Venue</p>
              <p className="text-xs font-bold text-slate-955 uppercase leading-tight">{eventDetails?.venue || "MAIN BLOCK"}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Entry Time</p>
              <p className="text-xs font-bold text-slate-955">{visitor.entryTime}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default VisitorPass;