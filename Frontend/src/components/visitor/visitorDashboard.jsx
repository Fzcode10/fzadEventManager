import React, { useState, useEffect } from 'react';
import RegistrationForm from './registration';
import { Calendar, MapPin, Sparkles, AlertCircle, ArrowRight, Hourglass } from "lucide-react";

const VisitorHome = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const [openRegister, setOpenRegister] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const showToast = (msg, type = 'error') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 10000);
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/visitor/events/all');
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to fetch");
                setEvents(data.events);
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleOpenRegister = (event) => {
        setSelectedEvent(event);
        setOpenRegister(true);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-slate-450 font-bold text-sm tracking-widest uppercase">Loading Events...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 relative overflow-hidden text-slate-100 font-sans">
            {/* Glowing mesh background */}
            <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* TOAST NOTIFICATION */}
            {notification.message && (
                <div className={`fixed top-24 right-5 z-100 p-4 rounded-2xl shadow-2xl border-l-4 animate-bounce transition-all ${
                    notification.type === 'success' 
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-350 badge-glow-success backdrop-blur-xl' 
                        : 'bg-red-950/80 border-red-500 text-red-350 badge-glow-danger backdrop-blur-xl'
                }`}>
                    <div className="flex items-center gap-3">
                        <span>{notification.type === 'success' ? '✅' : '❌'}</span>
                        <span className="font-bold text-sm">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-12 text-center md:text-left relative py-8 px-6 bg-slate-900/40 border border-slate-850/60 rounded-3xl backdrop-blur-md">
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
                    <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-widest uppercase rounded-full w-fit mx-auto md:mx-0 flex items-center gap-1.5 mb-4">
                        <Sparkles size={10} /> Active Showcases
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Upcoming Campus <span className="text-gradient">Events</span>
                    </h1>
                    <p className="text-slate-400 mt-2.5 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                        Explore, register, and download digital entry passes for the latest academic workshops, contests, and seminars.
                    </p>
                </header>

                {/* EVENT GRID */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500 ${
                    openRegister ? 'blur-md scale-95 pointer-events-none' : 'opacity-100'
                }`}>
                    {events.map((event) => (
                        <div key={event._id} className="glass-panel rounded-3xl overflow-hidden flex flex-col hover-glow transition-all duration-300">
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-5">
                                    <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                                        {event.category || 'General'}
                                    </span>
                                    <span className="text-orange-400 text-[10px] font-black tracking-wide bg-orange-950/40 border border-orange-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                        <Hourglass size={10} /> {event.remaningSlots} left
                                    </span>
                                </div>

                                <h2 className="text-xl font-extrabold text-white mb-2 leading-snug truncate-2-lines">{event.title}</h2>
                                <p className="text-slate-450 text-xs font-semibold mb-6">by {event.eventOrganizer}</p>
                                
                                <div className="space-y-3 mb-6 bg-slate-950/40 border border-slate-900/60 p-4 rounded-2xl mt-auto">
                                    <div className="flex items-center text-slate-300 text-xs font-medium">
                                        <Calendar size={14} className="text-violet-500 mr-2.5 shrink-0" />
                                        {new Date(event.dateOFEvent).toLocaleDateString('en-IN', { 
                                            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
                                        })}
                                    </div>
                                    <div className="flex items-center text-slate-300 text-xs font-medium">
                                        <MapPin size={14} className="text-cyan-500 mr-2.5 shrink-0" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-xs line-clamp-2 italic border-t border-slate-900 pt-4 leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            <button 
                                onClick={() => handleOpenRegister(event)}
                                className="w-full bg-slate-900 border-t border-slate-800/80 hover:bg-gradient-accent text-white py-4 font-bold text-xs uppercase tracking-wider transition-all duration-350 flex justify-center items-center gap-2 cursor-pointer"
                            >
                                Book My Spot <ArrowRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL OVERLAY */}
            {openRegister && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl relative shadow-2xl overflow-hidden animate-slideUp">
                        {/* Close Button */}
                        <button 
                            onClick={() => setOpenRegister(false)}
                            className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center bg-slate-950 border border-slate-800 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all text-slate-400 font-bold text-lg"
                        >
                            &times;
                        </button>
                        
                        <div className="max-h-[90vh] overflow-y-auto">
                            <RegistrationForm 
                                event={selectedEvent} 
                                onSuccess={() => {
                                    setOpenRegister(false);
                                    showToast("Registration Successful! See you there.", "success");
                                }}
                                onError={(msg) => showToast(msg, "error")}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorHome;