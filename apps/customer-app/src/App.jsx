import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { ActiveBookingPage } from './pages/ActiveBookingPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { api } from './services/api';

function MainApp() {
  const [activeTab, setActiveTab] = useState('book');
  const [activeBooking, setActiveBooking] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      checkActiveBooking();
    }
  }, [user]);

  const checkActiveBooking = async () => {
    try {
      const res = await api.get('/customer/bookings/active');
      if (res.data.success && res.data.data) {
        setActiveBooking(res.data.data);
      }
    } catch (err) {
      console.error('[CustomerApp] Check active booking error:', err);
    }
  };

  const handleBookingCreated = (newBooking) => {
    setActiveBooking(newBooking);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile-first Constrained Container */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative border-x border-slate-200">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'book' && <HomePage onBookingCreated={handleBookingCreated} />}
          {activeTab === 'track' && (
            <ActiveBookingPage
              booking={activeBooking}
              onBookingCompleted={() => {
                setActiveBooking(null);
                setActiveTab('history');
              }}
            />
          )}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </main>

        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasActiveBooking={!!activeBooking}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
