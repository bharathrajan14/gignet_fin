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

    // Real-time offer dispatched from allocation engine (only if THIS worker is the assignee)
    socket.on('worker:new_offer', (data) => {
      console.log('[WorkerApp] Real-time offer received!', data);
      setPendingOffer(data);
    });

    // DEMO BROADCAST: fired for ALL clients so the persona switcher
    // highlights the assigned worker even when a different persona is active
    socket.on('demo:job_dispatched', (data) => {
      console.log('[WorkerApp] Demo broadcast — job dispatched to:', data.assignedWorkerBadge);
      // Only set pendingOffer if we don't already have a real offer for this worker
      setPendingOffer((prev) => {
        // If the current worker IS the assigned one, the worker:new_offer already set it
        // For other personas we still set it so the highlight + switcher shows
        if (prev) return prev; // already have a real offer, don't overwrite
        return data;
      });
    });

    // Offer expired/cascaded
    socket.on('worker:offer_expired', () => {
      setPendingOffer(null);
    });

    return () => {
      socket.off('worker:new_offer');
      socket.off('demo:job_dispatched');
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

        {/* Global Live Offer Modal (45-second countdown) — only shown when
            the CURRENT persona is the assigned worker.
            If a different persona is active, only the Navbar highlight fires. */}
        {pendingOffer && workerProfile?.badgeNumber === pendingOffer.assignedWorkerBadge && (
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

