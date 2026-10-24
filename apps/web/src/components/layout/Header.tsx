import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Sparkles, Database, Server, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenRenderModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRenderModal }) => {
  const { data: health, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
  });

  const isHealthy = health?.status === 'ok';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHealthy ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="text-xs font-mono font-medium text-slate-300">
            {isLoading ? 'Checking...' : isHealthy ? 'SYSTEM OPERATIONAL' : 'DEGRADED'}
          </span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>worker:4100</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>postgres:{health?.database || 'connected'}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => refetch()}
          title="Refresh health status"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
          onClick={onOpenRenderModal}
        >
          New Production
        </Button>
      </div>
    </header>
  );
};
