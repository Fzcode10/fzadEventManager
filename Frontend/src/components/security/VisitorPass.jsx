import React, { forwardRef } from "react";

const VisitorPass = forwardRef(({ visitor, eventDetails }, ref) => {
  if (!visitor) return null;

  // Static or random pass number if not provided by backend
  const passNo = visitor.passNo || `VP-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="hidden">
      {/* Wrapper to handle page centering during print */}
      <div ref={ref} className="w-full flex justify-center py-10">
        
        {/* The Card Container */}
        <div className="w-[85mm] bg-white flex flex-col items-center text-center p-8 font-sans border border-gray-100 shadow-sm">
          
          {/* Guest Badge */}
          <div className="mb-8">
            <span className="bg-indigo-50 text-indigo-700 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
              {visitor.passType || "GUEST"}
            </span>
          </div>

          {/* Event Name Section (Added) */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
              Event Name
            </p>
            <h4 className="text-xl font-black text-gray-800 uppercase leading-tight">
              {visitor.eventName}
            </h4>
          </div>

          {/* Visitor Name Section */}
          <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
              Visitor Name
            </p>
            <h3 className="text-4xl font-black text-gray-900 leading-[0.9] uppercase wrap-break-word">
              {visitor.name.split(' ').map((part, i) => (
                <React.Fragment key={i}>
                  {part} <br />
                </React.Fragment>
              ))}
            </h3>
          </div>

          {/* Organization Section */}
          <div className="mb-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-center leading-relaxed">
              Organization / <br /> College
            </p>
            <h4 className="text-lg font-black text-gray-700 uppercase leading-tight">
              {visitor.organization || "Independent Participant"}
            </h4>
          </div>

          {/* Dotted Divider */}
          <div className="w-full border-t-2 border-dashed border-gray-200 mb-8"></div>

          {/* Logistics Grid */}
          <div className="w-full grid grid-cols-2 gap-y-6 text-left">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-none">Pass No</p>
              <p className="text-[13px] font-black text-indigo-500 uppercase">{passNo}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-none">Date</p>
              <p className="text-[13px] font-black text-gray-800">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-none">Venue</p>
              <p className="text-[13px] font-black text-gray-800 uppercase leading-tight">{eventDetails?.venue || "MAIN BLOCK"}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-none">Entry Time</p>
              <p className="text-[13px] font-black text-gray-800">{visitor.entryTime}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default VisitorPass;