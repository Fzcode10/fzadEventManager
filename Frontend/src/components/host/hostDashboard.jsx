import React, { useState, useEffect } from "react";
import OrganizeEventModal from "./OrganizeEventModal";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Sparkles, AlertCircle, Clock, ShieldCheck, Ticket, Users, Settings } from "lucide-react";

const HostDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user");

      if (!token) {
        Navigate("/");
        return;
      }

      const response = await fetch("/api/host/upcomingevents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-slate-100">
      {/* Glowing mesh background */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- Header Section --- */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative py-8 px-6 bg-slate-900/40 border border-slate-850/60 rounded-3xl backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
          
          <div>
            <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-widest uppercase rounded-full w-fit flex items-center gap-1.5 mb-4">
              <Sparkles size={10} /> Host Portal
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Event <span className="text-gradient">Management</span>
            </h1>
            <p className="text-slate-400 mt-2.5 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
              Monitor your visit requests, manage attendee approvals, and organize new schedules.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-accent text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider text-sm"
          >
            <span className="text-xl leading-none">+</span> Organize Event
          </button>
        </header>

        {/* --- Main Content Area --- */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
              <p className="text-slate-450 font-bold text-sm tracking-widest uppercase">
                Loading your events...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="glass-panel border border-dashed border-slate-700/50 rounded-3xl p-20 text-center flex flex-col items-center justify-center">
              <div className="bg-slate-900/50 p-5 rounded-full mb-5 border border-slate-800">
                <Calendar className="w-10 h-10 text-slate-500" />
              </div>
              <p className="text-slate-300 font-bold text-lg mb-2">
                No events scheduled yet.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-slate-900 border border-slate-700 text-white font-bold rounded-xl hover:bg-gradient-accent hover:border-transparent transition-all text-sm uppercase tracking-wider mt-4"
              >
                Create your first event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="glass-panel border border-slate-800/80 rounded-3xl p-6 shadow-sm hover-glow transition-all duration-300 flex flex-col group relative"
                >
                  {/* Top Header: Category & Status */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-cyan-400 tracking-[0.15em] uppercase px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-full w-fit">
                        {event.category || "General"}
                      </span>
                      <h2 className="text-xl font-extrabold text-white leading-tight">
                        {event.title}
                      </h2>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex items-center gap-2">
                      {event.status === "pending" && (
                        <span className="flex items-center gap-1.5 bg-amber-950/40 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-900/30 uppercase tracking-wider">
                          <Clock size={10} /> PENDING
                        </span>
                      )}

                      {event.status === "rejected" && (
                        <span className="flex items-center gap-1.5 bg-red-950/40 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-red-900/30 uppercase tracking-wider">
                          <AlertCircle size={10} /> REJECTED
                        </span>
                      )}

                      {event.status === "approved" && (
                        <span className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-900/30 uppercase tracking-wider badge-glow-success">
                          <ShieldCheck size={10} /> APPROVED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6">
                    {event.description}
                  </p>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-slate-850 mt-auto">
                    {/* Location */}
                    <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-900/60">
                      <div className="flex items-center justify-center w-8 h-8 bg-cyan-950/50 rounded-xl text-cyan-400 shrink-0 border border-cyan-900/30">
                        <MapPin size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-wider leading-none mb-1">
                          Location
                        </span>
                        <span className="text-[11px] font-bold text-slate-300 truncate">
                          {event.location || "TBD"}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-900/60">
                      <div className="flex items-center justify-center w-8 h-8 bg-violet-950/50 rounded-xl text-violet-400 shrink-0 border border-violet-900/30">
                        <Calendar size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-wider leading-none mb-1">
                          Date
                        </span>
                        <span className="text-[11px] font-bold text-slate-300">
                          {new Date(event.dateOFEvent).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short" },
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Slots */}
                    <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-900/60">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-950/50 rounded-xl text-orange-400 shrink-0 border border-orange-900/30">
                        <Users size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-wider leading-none mb-1">
                          {event.status === "approved" ? "Remaining Slots" : "Total Slots"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300">
                          {event.remaningSlots === 0 ? "Fully Booked" : `${event.remaningSlots} Slots`}
                        </span>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-900/60">
                      <div className="flex items-center justify-center w-8 h-8 bg-rose-950/50 rounded-xl text-rose-400 shrink-0 border border-rose-900/30">
                        <Ticket size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-wider leading-none mb-1">
                          Host
                        </span>
                        <span className="text-[11px] font-bold text-slate-300 truncate">
                          {event.eventOrganizer}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {event.status === "approved" && (
                    <button
                      onClick={() => Navigate(`/host/manage/${event.eventId}`)}
                      className="mt-6 w-full py-3.5 bg-slate-900 border border-slate-700 text-white font-bold rounded-xl hover:bg-gradient-accent hover:border-transparent transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Settings size={14} /> Manage Event Details
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <OrganizeEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchEvents}
      />
    </div>
  );
};

export default HostDashboard;
