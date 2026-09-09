import React, { useState } from 'react';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LiveOperationsPage } from './pages/LiveOperationsPage';
import { AllocationAuditPage } from './pages/AllocationAuditPage';
import { FairnessPage } from './pages/FairnessPage';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { WorkerManagementPage } from './pages/WorkerManagementPage';
import { FinancePage } from './pages/FinancePage';

function AdminAppMain() {
  const [activeTab, setActiveTab] = useState('operations');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-65px)] bg-slate-950">
          {activeTab === 'operations' && <LiveOperationsPage />}
          {activeTab === 'allocation' && <AllocationAuditPage />}
          {activeTab === 'fairness' && <FairnessPage />}
          {activeTab === 'forecast' && <DemandForecastPage />}
          {activeTab === 'workers' && <WorkerManagementPage />}
          {activeTab === 'finance' && <FinancePage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminAppMain />
    </AdminAuthProvider>
  );
}
