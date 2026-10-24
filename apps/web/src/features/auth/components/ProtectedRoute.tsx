import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Zap, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-base font-semibold tracking-tight text-white">
            Đang Xác Thực Phiên Làm Việc
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Đang kiểm tra chứng chỉ bảo mật và quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
