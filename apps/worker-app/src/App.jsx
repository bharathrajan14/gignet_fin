import React, { useState, useEffect } from 'react';
import { WorkerAuthProvider, useWorkerAuth } from './context/WorkerAuthContext';
import { WorkerSocketProvider, useWorkerSocket } from './context/WorkerSocketContext';
import { WorkerLanguageProvider } from './context/WorkerLanguageContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfferModal } from './components/OfferModal';
import { DutyDashboard } from './pages/DutyDashboard';
import { ActiveJobPage } from './pages/ActiveJobPage';
import { EarningsPage } from './pages/EarningsPage';
import { KYCPage } from './pages/KYCPage';
import { api } from './services/api';

function WorkerAppMain() {
  const [activeTab, setActiveTab] = useState('duty');
  const [pendingOffer, setPendingOffer] = useState(null);
  const [hasActiveJob, setHasActiveJob] = useState(false);
  const { workerProfile } = useWorkerAuth();
  const socket = useWorkerSocket();

  useEffect(() => {
    if (workerProfile?._id) {
      checkActiveJob();
      checkPendingOffer();
    }
  }, [workerProfile?._id]);

  useEffect(() => {
    if (!socket) return;

    // Real-time offer dispatched from allocation engine
    socket.on('worker:new_offer', (data) => {
      console.log('[WorkerApp] Real-time offer received!', data);
      setPendingOffer(data);
    });

    // Offer expired/cascaded
    socket.on('worker:offer_expired', () => {
      setPendingOffer(null);
    });

    return () => {
      socket.off('worker:new_offer');
      socket.off('worker:offer_expired');
    };
  }, [socket]);

  const checkActiveJob = async () => {
    try {
      const res = await api.get('/worker/jobs/current');
      if (res.data.success && res.data.data) {
        setHasActiveJob(true);
      } else {
        setHasActiveJob(false);
      }
    } catch (err) {
      console.error('[WorkerApp] Check active job error:', err);
    }
  };

  const checkPendingOffer = async () => {
    try {
      const res = await api.get('/worker/offers/pending');
      if (res.data.success && res.data.data) {
        setPendingOffer(res.data.data.offer);
      }
    } catch (err) {
      console.error('[WorkerApp] Check pending offer error:', err);
    }
  };

  const handleOfferAccepted = (booking) => {
    setPendingOffer(null);
    setHasActiveJob(true);
    setActiveTab('job');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen shadow-2xl flex flex-col relative border-x border-slate-800">
        <Navbar pendingOffer={pendingOffer} />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'duty' && <DutyDashboard pendingOffer={pendingOffer} />}
          {activeTab === 'job' && (
            <ActiveJobPage
              onJobFinished={() => {
                setHasActiveJob(false);
                setActiveTab('earnings');
              }}
            />
          )}
          {activeTab === 'earnings' && <EarningsPage />}
          {activeTab === 'kyc' && <KYCPage />}
        </main>

        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasActiveJob={hasActiveJob}
          hasPendingOffer={!!pendingOffer}
        />

        {/* Global Live Offer Modal (45-second countdown) */}
        {pendingOffer && (
          <OfferModal
            offer={pendingOffer}
            onAccepted={handleOfferAccepted}
            onDeclined={() => setPendingOffer(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WorkerLanguageProvider>
      <WorkerAuthProvider>
        <WorkerSocketProvider>
          <WorkerAppMain />
        </WorkerSocketProvider>
      </WorkerAuthProvider>
    </WorkerLanguageProvider>
  );
}

