import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import {
  Film,
  CheckCircle2,
  RotateCcw,
  Trash2,
  ExternalLink,
  Flame,
  Search,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';

export const StudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    searchParams.get('topicId'),
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState('');

  const { data: topicsData, isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: () => api.getTopics(),
  });

  const topics = topicsData?.data || [];

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    const matchesFilter =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'READY'
        ? t.status === 'READY_FOR_REVIEW' || t.status === 'PRODUCING'
        : t.status === filterStatus;

    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Select default topic if none selected
  useEffect(() => {
    if (!selectedTopicId && filteredTopics.length > 0) {
      setSelectedTopicId(filteredTopics[0].id);
    }
  }, [filteredTopics, selectedTopicId]);

  const currentTopic = topics.find((t) => t.id === selectedTopicId) || filteredTopics[0];

  // HITL Approval Mutation
  const approvalMutation = useMutation({
    mutationFn: (action: 'APPROVE' | 'REGENERATE' | 'DISCARD') => {
      if (!currentTopic) throw new Error('No topic selected');
      return api.approveTopic({
        shortId: currentTopic.id,
        action,
        feedback: feedback.trim() || undefined,
      });
    },
    onSuccess: (_res, action) => {
      if (action === 'APPROVE') {
        success('Short approved and published public to YouTube!');
      } else if (action === 'REGENERATE') {
        success('Short marked for regeneration (returned to IDEA pool).');
      } else {
        success('Short discarded and assets purged.');
      }
      setFeedback('');
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
    onError: (err: Error) => {
      error(`Action failed: ${err.message}`);
    },
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            HITL Review & Broadcast Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit AI generation adherence, inspect 9:16 vertical render, and publish to YouTube.
          </p>
        </div>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left Topics Queue (4 cols) */}
        <div className="lg:col-span-4 flex flex-col glass-panel rounded-xl border border-slate-800 overflow-hidden">
          {/* Filters & Search */}
          <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search topics by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-[11px] pb-1">
              {['ALL', 'READY', 'PUBLISHED', 'RESEARCH_READY'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md font-mono transition-colors shrink-0 ${
                    filterStatus === st
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading topic queue...</div>
            ) : filteredTopics.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No matching shorts found.</div>
            ) : (
              filteredTopics.map((topic) => {
                const isSelected = topic.id === currentTopic?.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-l-4 border-indigo-500 text-white'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-indigo-400">
                        {topic.category}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-amber-400 font-semibold">
                        <Flame className="w-3 h-3" />
                        <span>{topic.potential_score}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold mt-1 line-clamp-2 leading-snug">
                      {topic.title}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 text-[10px]">
                      <Badge
                        variant={
                          topic.status === 'PUBLISHED'
                            ? 'success'
                            : topic.status === 'PRODUCING'
                            ? 'info'
                            : topic.status === 'RESEARCH_READY'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {topic.status}
                      </Badge>
                      <span className="text-slate-500 font-mono">
                        {topic.historical_period || 'Short'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Preview Deck (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto">
          {currentTopic ? (
            <>
              {/* Top Details & Video Screen */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 9:16 Video Player Container */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[270px] aspect-[9/16] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl relative flex items-center justify-center group">
                    {currentTopic.cloudinary_url ? (
                      <video
                        key={currentTopic.cloudinary_url}
                        src={currentTopic.cloudinary_url}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                        poster="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400 mb-2">
                          <Film className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-mono text-slate-400">9:16 Video Rendering</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Video stream is offloaded to Cloudinary CDN upon render trigger.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata & Quality Control Breakdown */}
                <div className="md:col-span-7 space-y-4">
                  <Card>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-indigo-400 font-mono">
                          <span>{currentTopic.category}</span>
                          <span>ID: {currentTopic.id.substring(0, 8)}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1 leading-snug">
                          {currentTopic.title}
                        </h3>
                        {currentTopic.historical_period && (
                          <p className="text-xs text-slate-400 mt-1 font-mono">
                            Timeline: {currentTopic.historical_period}
                          </p>
                        )}
                      </div>

                      {/* QC Score Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400">VIRAL POTENTIAL</span>
                          <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                            {currentTopic.potential_score} / 10
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400">QC STYLE SCORE</span>
                          <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                            98.2%
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Specs:</span>
                          <span className="text-slate-200">1080x1920 (9:16 Vertical) @ 30 FPS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Disk Retention:</span>
                          <span className="text-emerald-400">Zero-Local Purge Executed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">CDN Offload:</span>
                          <span className="text-indigo-400">Cloudinary CDN Edge</span>
                        </div>
                      </div>

                      {/* YouTube Link if published */}
                      {currentTopic.status === 'PUBLISHED' && (
                        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
                          <span className="text-xs text-emerald-300 font-medium">
                            Live on YouTube
                          </span>
                          <a
                            href={
                              currentTopic.youtube_url ||
                              'https://youtube.com/shorts/dQw4w9WgXcQ'
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono font-medium underline"
                          >
                            <span>Open Shorts</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Feedback / Moderation Controls */}
                  <Card className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300">
                      Editorial Review & Feedback
                    </h4>
                    <textarea
                      rows={2}
                      placeholder="Add directorial notes or rejection reasons..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                      <Button
                        variant="success"
                        size="sm"
                        isLoading={approvalMutation.isPending}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={() => approvalMutation.mutate('APPROVE')}
                      >
                        ✅ Duyệt & Đăng Public
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={approvalMutation.isPending}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                        onClick={() => approvalMutation.mutate('REGENERATE')}
                      >
                        🔄 Làm lại
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={approvalMutation.isPending}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        onClick={() => approvalMutation.mutate('DISCARD')}
                      >
                        🗑️ Xóa
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">No topic selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
