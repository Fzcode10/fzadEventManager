import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from '../Context/AuthContext';
import { Menu, X, LogOut, User, Compass, HelpCircle } from "lucide-react";
import { useLogout } from "../hooks/useLogout";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-accent p-2 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-all">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            FzAd<span className="text-gradient">Events</span>
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6 text-sm font-semibold text-slate-400">
            <li>
              <Link to="/" className="hover:text-white transition-colors relative group py-1">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-accent transition-all group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-white transition-colors relative group py-1">
                System Guide
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-accent transition-all group-hover:w-full"></span>
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-accent text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-cyan-500/20 hover:-translate-y-0.5 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white leading-none">
                      {user.name || user.fullName || "User"}
                    </p>
                    <p className="text-[10px] text-slate-500 group-hover:text-cyan-400 transition-colors mt-0.5">
                      View Profile
                    </p>
                  </div>
                  <div className="relative h-10 w-10 p-0.5 rounded-full border border-slate-700 group-hover:border-violet-500 transition-colors overflow-hidden">
                    <img
                      src={user.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt="profile"
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-slate-900 rounded-xl"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-300 hover:text-white transition-colors p-1"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-slate-950 border-b border-slate-800 py-6 px-6 z-50 flex flex-col gap-6 animate-slideUp">
          <ul className="flex flex-col gap-4 text-base font-semibold text-slate-300">
            <li>
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 hover:text-white py-2 transition-colors border-b border-slate-900"
              >
                <Compass size={18} className="text-violet-500" />
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/features" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 hover:text-white py-2 transition-colors border-b border-slate-900"
              >
                <HelpCircle size={18} className="text-cyan-500" />
                System Guide
              </Link>
            </li>
          </ul>

          <div className="flex flex-col gap-4 pt-2">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="text-center text-sm font-bold text-slate-300 hover:text-white py-3 border border-slate-800 rounded-xl hover:bg-slate-900 transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsOpen(false)}
                  className="text-center bg-gradient-accent text-white text-sm font-bold py-3.5 rounded-xl shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition-all"
                >
                  <div className="h-10 w-10 p-0.5 rounded-full border border-slate-700 overflow-hidden">
                    <img
                      src={user.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt="profile"
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name || user.fullName || "User"}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <User size={10} /> View Profile
                    </p>
                  </div>
                </Link>
                
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/30 rounded-xl font-bold transition-all text-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;