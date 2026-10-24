import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import {
  CalendarClock,
  Play,
  Globe,
  RotateCw,
  Zap,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';

export const SchedulePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [selectedChannelId, setSelectedChannelId] = useState<string>('channel_02_tech');

  const { data: scheduleData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['schedule'],
    queryFn: () => api.getSchedule(),
  });

  const { data: channelsData } = useQuery({
    queryKey: ['channels'],
    queryFn: () => api.getChannels(),
  });

  const triggerMutation = useMutation({
    mutationFn: () => api.triggerSchedule({ channelId: selectedChannelId }),
    onSuccess: (res) => {
      success(res.message || 'Đã kích hoạt luân chuyển kênh theo lịch trình thành công!');
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
    onError: (err: Error) => {
      error(`Kích hoạt thất bại: ${err.message}`);
    },
  });

  const schedule = scheduleData?.schedule;
  const channels = channelsData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Lịch Trình Sản Xuất Tự Động
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ma trận cron tự động đa kênh được tối ưu hóa cho khung giờ lướt di động cao điểm của khán giả Tier-1.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
          >
            Làm Mới Trạng Thái
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500">Đang tải ma trận lịch trình...</div>
      ) : schedule ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cron Overview Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Ma Trận Lịch Trình Cron</h3>
                </div>
                <Badge variant={schedule.enabled ? 'success' : 'warning'}>
                  {schedule.enabled ? 'ĐANG CHẠY TỰ ĐỘNG' : 'TẠM DỪNG'}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">CHU KỲ CRON</span>
                  <p className="font-mono text-base font-bold text-indigo-300 mt-1">
                    {schedule.cronExpression}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">MÚI GIỜ HỆ THỐNG</span>
                  <p className="font-mono text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{schedule.timezone}</span>
                  </p>
                </div>
              </div>

              {/* Target Broadcast Slots */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-semibold text-slate-300">
                  Khung Giờ Đăng Tải Khán Giả Tier-1 Hàng Ngày
                </span>
                <div className="space-y-2">
                  {(schedule.slots || [
                    {
                      name: 'Giờ Nghỉ Trưa Mỹ',
                      timeEST: '11:30 AM EST',
                      timeVN: '22:30 PM ICT',
                      target: 'Lướt mạng giờ trưa khán giả Tier-1',
                    },
                    {
                      name: 'Giờ Vàng Buổi Tối Mỹ',
                      timeEST: '06:30 PM EST',
                      timeVN: '05:30 AM ICT (+1)',
                      target: 'Giải trí & thư giãn buổi tối Tier-1',
                    },
                  ]).map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{slot.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{slot.target}</p>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-indigo-400 font-semibold">{slot.timeEST}</span>
                        <span className="text-slate-500 block text-[10px]">{slot.timeVN}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Manual Trigger & Rotation Control (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Kích Hoạt Luân Chuyển Thủ Công</h3>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Gửi lệnh sản xuất ngay lập tức cho kênh đã chọn hoặc kích hoạt kênh tiếp theo trong hàng đợi mà không cần chờ đến giờ hẹn cron.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Chọn Kênh Cần Sản Xuất Ngay Lập Tức
                  </label>
                  <select
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name} ({ch.id})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={triggerMutation.isPending}
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
                  onClick={() => triggerMutation.mutate()}
                >
                  Kích Hoạt Lượt Chạy Ngay
                </Button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Lần chạy gần nhất:</span>
                  <span className="text-slate-200">
                    {schedule.lastExecutedChannel || 'channel_01_paper'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hàng đợi Worker:</span>
                  <span className="text-emerald-400">Sẵn Sàng / Chờ Lệnh</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};
