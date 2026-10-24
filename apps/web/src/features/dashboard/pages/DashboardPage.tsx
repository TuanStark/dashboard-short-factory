import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import {
  Tv,
  Film,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import { QuickRenderModal } from '../components/QuickRenderModal';

export const DashboardPage: React.FC = () => {
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);

  const { data: channelsData, isLoading: loadingChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: () => api.getChannels(),
  });

  const { data: topicsData, isLoading: loadingTopics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => api.getTopics(),
  });

  const { data: scheduleData } = useQuery({
    queryKey: ['schedule'],
    queryFn: () => api.getSchedule(),
  });

  const channels = channelsData?.data || [];
  const topics = topicsData?.data || [];

  const publishedCount = topics.filter((t) => t.status === 'PUBLISHED').length;
  const pendingReviewCount = topics.filter(
    (t) => t.status === 'READY_FOR_REVIEW' || t.status === 'RESEARCH_READY' || t.status === 'PRODUCING',
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Factory Control Deck</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline analytics, quota monitoring, and autonomous generation matrix.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/studio">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Open Review Studio
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
            onClick={() => setIsRenderModalOpen(true)}
          >
            Produce Short
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Configured Channels</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-white">
              {loadingChannels ? '...' : channels.length}
            </p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{channels.filter((c) => c.has_credentials).length} OAuth Linked</span>
            </p>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Video Topics</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-white">
              {loadingTopics ? '...' : topics.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Matrix AI Topic Queue</p>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Published Public</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-emerald-400">
              {loadingTopics ? '...' : publishedCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Live on YouTube Shorts</p>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Review & Pipeline</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-amber-400">
              {loadingTopics ? '...' : pendingReviewCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting approval or rendering</p>
          </div>
        </Card>
      </div>

      {/* Grid: Production Activity & Auto-Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Topic Pipeline Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recent Content Pipeline</h3>
            <Link to="/studio" className="text-xs text-indigo-400 hover:text-indigo-300">
              View All Topics ({topics.length}) &rarr;
            </Link>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Title / Hook</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Viral Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {loadingTopics ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Loading content pipeline...
                      </td>
                    </tr>
                  ) : topics.slice(0, 7).map((topic) => (
                    <tr key={topic.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">
                        {topic.title}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {topic.category}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-amber-400 font-semibold">{topic.potential_score}</span>
                      </td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/studio?topicId=${topic.id}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Channels & Automation Widget */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Active Channels</h3>
              <Link to="/channels" className="text-xs text-indigo-400 hover:text-indigo-300">
                Manage &rarr;
              </Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-200 truncate">{ch.name}</p>
                    <p className="text-[10px] font-mono text-indigo-400 mt-0.5">
                      {ch.genre_name || ch.genre_key}
                    </p>
                  </div>
                  <Badge variant={ch.has_credentials ? 'success' : 'warning'}>
                    {ch.has_credentials ? 'OAuth OK' : 'No Auth'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Auto-Scheduler</h3>
              <Link to="/schedule" className="text-xs text-indigo-400 hover:text-indigo-300">
                Schedule &rarr;
              </Link>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>CRON MATRIX</span>
                <span className="text-indigo-300">{scheduleData?.schedule.cronExpression}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>TIMEZONE</span>
                <span className="text-slate-300">{scheduleData?.schedule.timezone}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>STATUS</span>
                <span className="text-emerald-400 font-semibold">
                  {scheduleData?.schedule.enabled ? 'Active / Automated' : 'Paused'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <QuickRenderModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
      />
    </div>
  );
};
