import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickRenderModal } from '../../features/dashboard/components/QuickRenderModal';

export const Shell: React.FC = () => {
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onOpenRenderModal={() => setIsRenderModalOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-950 to-slate-900/40">
          <Outlet />
        </main>
      </div>
      <QuickRenderModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
      />
    </div>
  );
};
