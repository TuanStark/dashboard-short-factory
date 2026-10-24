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
      success('Video produced and rendered successfully!');
      setLastResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (err: Error) => {
      error(`Production failed: ${err.message}`);
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
      title={lastResult ? 'Production Completed' : 'Trigger Video Production'}
      description={
        lastResult
          ? 'Video has been composited and offloaded to Cloudinary CDN.'
          : 'Configure script direction, voiceover, and visual generator pipeline.'
      }
      maxWidth="lg"
    >
      {lastResult ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-300">
                Render Job Complete (Zero-Local Purged)
              </h4>
              <p className="text-xs text-slate-300 mt-1">{lastResult.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Duration</span>
              <p className="font-mono text-sm font-semibold text-white mt-0.5">
                {lastResult.durationSec}s
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Style Adherence QC</span>
              <p className="font-mono text-sm font-semibold text-emerald-400 mt-0.5">
                {Math.round(lastResult.qcResult.styleAdherenceScore * 100)}%
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <span className="text-[11px] font-mono text-slate-400">CLOUDINARY CDN STREAM</span>
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
              Produce Another
            </Button>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
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
              Select YouTube Channel
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
              Video Title / Hook Prompt
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bí quyết làm chủ cảm xúc của Marcus Aurelius"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Duration
              </label>
              <select
                value={targetDurationSec}
                onChange={(e) => setTargetDurationSec(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={30}>30 seconds (High Retention)</option>
                <option value={45}>45 seconds (Standard)</option>
                <option value={60}>60 seconds (Deep Narrative)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Publishing Policy
              </label>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={publishYouTube}
                  onChange={(e) => setPublishYouTube(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Auto-Publish to YouTube</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={produceMutation.isPending}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
            >
              Start Render
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
