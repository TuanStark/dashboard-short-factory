import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { Plus, Tv, CheckCircle2, ShieldAlert, Tag } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ConfigureChannelModal } from '../components/ConfigureChannelModal';
import { Channel } from '@short-factory/contracts';

export const ChannelsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => api.getChannels(),
  });

  const channels = data?.data || [];

  const handleEdit = (ch: Channel) => {
    setSelectedChannel(ch);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedChannel(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Channel Network</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your autonomous multi-tenant YouTube channels and Google OAuth credentials.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleNew}
        >
          Add Channel
        </Button>
      </div>

      {/* Channel Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500">Loading configured channels...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {channels.map((channel) => (
            <Card key={channel.id} hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white">{channel.name}</h3>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{channel.id}</p>
                    </div>
                  </div>
                  <Badge variant={channel.has_credentials ? 'success' : 'warning'}>
                    {channel.has_credentials ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        OAuth OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        No Auth
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Genre DNA:</span>
                    <span className="font-mono text-indigo-300 font-medium">
                      {channel.genre_name || channel.genre_key}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Default Privacy:</span>
                    <span className="font-mono uppercase text-slate-300">
                      {channel.default_privacy}
                    </span>
                  </div>

                  {channel.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">
                      "{channel.description}"
                    </p>
                  )}

                  {channel.default_tags && channel.default_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {channel.default_tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-500" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {channel.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <Button variant="outline" size="sm" onClick={() => handleEdit(channel)}>
                  Configure
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfigureChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        channel={selectedChannel}
      />
    </div>
  );
};
