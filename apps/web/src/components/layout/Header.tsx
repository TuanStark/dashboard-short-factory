import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Sparkles, Database, Server, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/AuthContext';

interface HeaderProps {
  onOpenRenderModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRenderModal }) => {
  const { user, logout } = useAuth();
  const { data: health, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
  });

  const isHealthy = health?.status === 'ok';

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'OPERATOR':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'VIEWER':
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

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

        {user && (
          <>
            <span className="text-slate-800">|</span>
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-200 leading-tight">
                    {user.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${getRoleBadgeClass(
                        user.role,
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out of Control Plane"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-all ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

