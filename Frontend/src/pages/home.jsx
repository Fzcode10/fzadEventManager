import React, { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import VisitorDahsboard from '../components/visitor/visitorDashboard';
import QRScanner from './../components/security/scanQr';
import HostDashboard from '../components/host/hostDashboard';
import AdminDashBoard from '../components/admin/adminDashboard';
// Import other roles as needed

const Home = () => {
    const { user } = useContext(AuthContext);

    // 1. Handle the "Loading" or "Not Logged In" state
    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <p className="animate-pulse">Authenticating...</p>
            </div>
        );
    }

    // 2. Separate views based on role
    // Using a simple return pattern
    if (user.role === 'visitor') {
        return <VisitorDahsboard />;
    }

    if (user.role === 'security') {
        return <QRScanner />;
    }

    if (user.role === 'host') {
        return <HostDashboard/>; 
    }

    if( user.role === 'admin'){
        return <AdminDashBoard/>
    }

    // 3. Fallback for undefined roles
    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-red-500">Access Error</h1>
            <p>Role {user.role} is not recognized by the system.</p>
        </div>
    );
};

export default Home;