import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { ProduceResponse } from '@short-factory/contracts';

interface QuickRenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickRenderModal: React.FC<QuickRenderModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [channelId, setChannelId] = useState('channel_03_stoic');
  const [title, setTitle] = useState('');
  const [targetDurationSec, setTargetDurationSec] = useState(45);
  const [publishYouTube, setPublishYouTube] = useState(false);
  const [lastResult, setLastResult] = useState<ProduceResponse['data'] | null>(null);

  const { data: channelsData } = useQuery({
    queryKey: ['channels'],
    queryFn: () => api.getChannels(),
  });

  const produceMutation = useMutation({
    mutationFn: () =>
      api.produceVideo({
        channelId,
        content: {
          title,
          targetDurationSec,
        },
        options: {
          publishYouTube,
          uploadCloudinary: true,
          purgeLocalAfterUpload: true,
        },
      }),
    onSuccess: (res) => {
      success('Video đã được khởi tạo và render thành công!');
      setLastResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (err: Error) => {
      error(`Tạo video thất bại: ${err.message}`);
    },
  });

  const handleReset = () => {
    setLastResult(null);
    setTitle('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={lastResult ? 'Quá Trình Sản Xuất Hoàn Tất' : 'Khởi Chạy Sản Xuất Video'}
      description={
        lastResult
          ? 'Video đã được ghép nối khung hình và tải lên Cloudinary CDN an toàn.'
          : 'Thiết lập định hướng kịch bản, giọng đọc lồng tiếng và bộ tạo hình ảnh AI.'
      }
      maxWidth="lg"
    >
      {lastResult ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-300">
                Tiến Trình Render Hoàn Tất (Đã giải phóng ổ cứng nội bộ)
              </h4>
              <p className="text-xs text-slate-300 mt-1">{lastResult.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Thời lượng</span>
              <p className="font-mono text-sm font-semibold text-white mt-0.5">
                {lastResult.durationSec} giây
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Độ chuẩn phong cách (QC)</span>
              <p className="font-mono text-sm font-semibold text-emerald-400 mt-0.5">
                {Math.round(lastResult.qcResult.styleAdherenceScore * 100)}%
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <span className="text-[11px] font-mono text-slate-400">LUỒNG PHÁT CLOUDINARY CDN</span>
            <a
              href={lastResult.cloudinaryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 block truncate mt-1 underline"
            >
              {lastResult.cloudinaryUrl}
            </a>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Tạo Thêm Video
            </Button>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Hoàn Tất
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            produceMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Chọn Kênh YouTube
            </label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {channelsData?.data.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} ({ch.genre_name || ch.genre_key})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tiêu Đề Video / Prompt Câu Mở Đầu (Hook)
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bí quyết làm chủ cảm xúc của Marcus Aurelius"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Thời Lượng Mục Tiêu
              </label>
              <select
                value={targetDurationSec}
                onChange={(e) => setTargetDurationSec(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={30}>30 giây (Tỷ lệ giữ chân cao)</option>
                <option value={45}>45 giây (Chuẩn YouTube Shorts)</option>
                <option value={60}>60 giây (Kể chuyện chi tiết)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Chính Sách Đăng Tải
              </label>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={publishYouTube}
                  onChange={(e) => setPublishYouTube(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Tự Động Đăng Lên YouTube Shorts</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={produceMutation.isPending}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
            >
              Bắt Đầu Render
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
