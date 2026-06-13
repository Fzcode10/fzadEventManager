import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full bg-slate-950 text-slate-400 font-sans border-t border-slate-900/80 relative">
      {/* Top Border Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-violet-500/20 via-cyan-500/30 to-violet-500/20"></div>

      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Left: Branding */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white tracking-tight">
            FzAd<span className="text-gradient">Events</span>
          </h3>
          <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
            Secure visitor tracking and campus event management. Modernizing safety and engagement.
          </p>
          
          {/* Status Pill - Dark Version */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/30 w-fit px-3 py-1.5 rounded-full border border-emerald-900/40 badge-glow-success">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Operational
          </div>
        </div>

        {/* Center: Links */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Platform</h4>
          <nav className="flex flex-col space-y-2 text-[14px] font-medium">
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Dashboard</a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Visitor Logs</a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Reports</a>
          </nav>
        </div>

        {/* Right: Live Data */}
        <div className="flex flex-col space-y-3 md:items-end">
          <h4 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Local Time</h4>
          <p className="text-3xl font-mono font-semibold text-white tracking-wider">
            {time}
          </p>
          <div className="text-[12px] text-slate-500 md:text-right">
            <p>© 2026 FzAdEvents Campus System</p>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Bar */}
      <div className="bg-slate-950/40 py-4 px-8 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">
            v1.2.4-stable
          </p>
          <div className="flex gap-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;