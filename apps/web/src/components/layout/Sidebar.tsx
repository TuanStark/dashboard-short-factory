import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Tv,
  Film,
  Palette,
  CalendarClock,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Tổng quan', to: '/', icon: LayoutDashboard },
    { label: 'Mạng lưới kênh', to: '/channels', icon: Tv },
    { label: 'Studio & Duyệt video', to: '/studio', icon: Film },
    { label: 'Brand DNA / Thể loại', to: '/genres', icon: Palette },
    { label: 'Lịch trình tự động', to: '/schedule', icon: CalendarClock },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight leading-none">
            SHORTS FACTORY
          </h1>
          <p className="text-[10px] font-mono text-indigo-400 mt-1 uppercase tracking-wider">
            Trung Tâm Điều Khiển v2.0
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
          Quản lý hệ thống
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300',
                  )}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
        <div className="rounded-xl p-3 bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-slate-400">CƠ CHẾ LƯU TRỮ</span>
            <span className="text-emerald-400 font-bold">ZERO-LOCAL</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Tự động đẩy render lên Cloudinary CDN và dọn sạch ổ cứng nội bộ.
          </p>
        </div>
      </div>
    </aside>
  );
};
