import React, { useState, useEffect } from 'react';
import RegistrationForm from './registration';


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

    if (loading) return <div className="p-10 text-center font-bold text-blue-600">Loading Events...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
            
            {/* TOAST NOTIFICATION */}
            {notification.message && (
                <div className={`fixed top-5 right-5 z-100 p-4 rounded-lg shadow-2xl border-l-4 animate-bounce transition-all ${notification.type === 'success' ? 'bg-green-100 border-green-600 text-green-800' : 'bg-red-100 border-red-600 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                        <span>{notification.type === 'success' ? '✅' : '❌'}</span>
                        <span className="font-bold">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Upcoming Events</h1>
                    <p className="text-gray-500 mt-2 text-lg">Explore and register for the latest campus activities.</p>
                </header>

                {/* EVENT GRID */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300 ${openRegister ? 'blur-sm scale-95 pointer-events-none' : 'opacity-100'}`}>
                    {events.map((event) => (
                        <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-xl hover:border-blue-300 transition-all">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">
                                        {event.category || 'General'}
                                    </span>
                                    <span className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded">
                                        🔥 {event.remaningSlots} left
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">{event.title}</h2>
                                <p className="text-gray-500 text-sm font-medium mb-4">by {event.eventOrganizer}</p>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-700 text-sm">
                                        <span className="text-lg mr-3">📅</span>
                                        {new Date(event.dateOFEvent).toLocaleDateString('en-IN', { 
                                            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
                                        })}
                                    </div>
                                    <div className="flex items-center text-gray-700 text-sm">
                                        <span className="text-lg mr-3">📍</span>
                                        {event.location}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm line-clamp-2 italic border-t pt-4">
                                    {event.description}
                                </p>
                            </div>

                            <button 
                                onClick={() => handleOpenRegister(event)}
                                className="w-full bg-blue-600 text-white py-4 font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                            >
                                Book My Spot <span>→</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL OVERLAY */}
            {openRegister && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/5 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-xl relative shadow-2xl overflow-hidden animate-slideUp">
                        {/* Close Button */}
                        <button 
                            onClick={() => setOpenRegister(false)}
                            className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all text-gray-500 font-bold"
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