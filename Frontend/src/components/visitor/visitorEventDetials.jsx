import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenerateQR from "./qrComponent";
import { Calendar, MapPin, Sparkles, Tag, Ticket, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export default function RegisteredEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      const token = localStorage.getItem("user");
      if (!token) {
        navigate("/");
        return;
      }

      const cleanToken = token.replace(/"/g, "");

      try {
        const response = await fetch("/api/visitor/allregistredevent", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
        <p className="text-slate-450 font-bold text-sm tracking-widest uppercase">Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-slate-100">
      {/* Glowing mesh background */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 text-center md:text-left relative py-8 px-6 bg-slate-900/40 border border-slate-850/60 rounded-3xl backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
          <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest uppercase rounded-full w-fit mx-auto md:mx-0 flex items-center gap-1.5 mb-4">
            <Ticket size={10} /> My Passes
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            My Registered <span className="text-gradient">Events</span>
          </h1>
          <p className="text-slate-400 mt-2.5 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
            Manage your bookings, review event details, and download your digital entry passes.
          </p>
        </header>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 glass-panel rounded-3xl border border-dashed border-slate-700/50 shadow-sm">
            <div className="bg-slate-900/50 p-5 rounded-full mb-5 border border-slate-800">
              <Calendar className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-slate-300 font-bold text-lg mb-2">
              No registrations found.
            </p>
            <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
              You haven't booked any passes yet. Explore upcoming events and reserve your spot!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gradient-accent text-white font-bold rounded-xl shadow-lg hover:shadow-violet-500/20 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              Browse upcoming events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div
                key={event._id || event.id || index}
                className="glass-panel rounded-3xl overflow-hidden flex flex-col hover-glow transition-all duration-300 border border-slate-800/80"
              >
                <div className="p-6 flex flex-col grow">
                  {/* Title & Category */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-cyan-400 text-[9px] font-black rounded-full uppercase tracking-wider">
                      {event.category || "Event"}
                    </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                      event.bookingStatus ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" : "bg-red-950/40 text-red-400 border border-red-900/30"
                    }`}>
                      {event.bookingStatus ? <ShieldCheck size={10} /> : <AlertCircle size={10} />}
                      {event.bookingStatus ? "Open" : "Closed"}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-white mb-2 leading-snug truncate-2-lines">
                    {event.title || "Untitled Event"}
                  </h2>

                  <p className="text-slate-450 text-xs font-semibold mb-5">
                    By <span className="text-slate-300">{event.eventOrganizer}</span>
                  </p>

                  <p className="text-slate-400 text-xs mb-5 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Info Box */}
                  <div className="space-y-3 mb-6 bg-slate-950/40 border border-slate-900/60 p-4 rounded-2xl">
                    <div className="flex items-center text-slate-300 text-xs font-medium">
                      <Calendar size={14} className="text-violet-500 mr-2.5 shrink-0" />
                      {formatDate(event.dateOFEvent)}
                    </div>
                    <div className="flex items-center text-slate-300 text-xs font-medium">
                      <MapPin size={14} className="text-cyan-500 mr-2.5 shrink-0" />
                      <span className="truncate">{event.location || "Online"}</span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-auto pt-4 border-t border-slate-850 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Payment Status</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          event.paymentStatus === "free"
                            ? "bg-slate-900 text-slate-300 border border-slate-700"
                            : event.paymentStatus === "success"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 badge-glow-success"
                              : event.paymentStatus === "rejected"
                                ? "bg-red-950/40 text-red-400 border border-red-900/30"
                              : "bg-amber-950/40 text-amber-400 border border-amber-900/30"
                        }`}
                      >
                        {event.paymentStatus === 'pending' && <Clock size={10} className="mr-1" />}
                        {event.paymentStatus === 'rejected' && <AlertCircle size={10} className="mr-1" />}
                        {event.paymentStatus || "pending"}
                      </span>
                    </div>

                    <button
                      disabled={event.paymentStatus !== "success"}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg flex justify-center items-center gap-2 uppercase tracking-wider ${
                        event.paymentStatus === "success"
                          ? "bg-slate-900 border border-slate-700 text-white hover:bg-gradient-accent hover:border-transparent hover:shadow-violet-500/20 active:scale-95"
                          : "bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed"
                      }`}
                    >
                      {event.paymentStatus === "success" ? (
                        <>Get Pass <Ticket size={14} /></>
                      ) : (
                        <>{event.paymentStatus === "rejected" ? "Rejected" : "Waiting..."} {event.paymentStatus === "rejected" ? <AlertCircle size={14} /> : <Clock size={14} />}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <GenerateQR
            event={selectedEvent}
            onBack={() => setSelectedEvent(null)}
          />
        </div>
      )}
    </div>
  );
}

