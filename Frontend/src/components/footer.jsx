import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    /* bg-white/30 + backdrop-blur makes it look like frosted glass.
       The border-t adds a subtle separation from the main content.
    */
    <footer className="w-full bg-blue-50/40 backdrop-blur-md text-slate-700 font-sans border-t border-blue-200/50">
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Left: Branding */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-blue-900 tracking-tight">
            VMS<span className="text-blue-600">.io</span>
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 max-w-xs font-medium">
            Secure Visitor Tracking. <br />
            Modernizing campus safety with MERN.
          </p>
          
          {/* Status Pill - Light Version */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            System Operational
          </div>
        </div>

        {/* Center: Links */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-blue-800/60 font-bold">Platform</h4>
          <nav className="flex flex-col space-y-2 text-[15px] font-medium">
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Dashboard</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Visitor Logs</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Reports</a>
          </nav>
        </div>

        {/* Right: Live Data */}
        <div className="flex flex-col space-y-3 md:items-end">
          <h4 className="text-xs uppercase tracking-[0.2em] text-blue-800/60 font-bold">Local Time</h4>
          <p className="text-3xl font-mono font-semibold text-blue-900 tabular-nums">
            {time}
          </p>
          <div className="text-[13px] text-slate-500 md:text-right">
            <p>© 2026 Visitor Management System</p>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Bar */}
      <div className="bg-blue-100/30 py-4 px-8 border-t border-blue-200/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[10px] uppercase tracking-widest text-blue-900/40 font-bold">
            v1.2.4-stable
          </p>
          <div className="flex gap-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;