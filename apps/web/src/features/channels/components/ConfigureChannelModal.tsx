import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { Channel } from '@short-factory/contracts';

interface ConfigureChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel?: Channel | null;
}

export const ConfigureChannelModal: React.FC<ConfigureChannelModalProps> = ({
  isOpen,
  onClose,
  channel,
}) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [id, setId] = useState(channel?.id || '');
  const [name, setName] = useState(channel?.name || '');
  const [genreKey, setGenreKey] = useState(channel?.genre_key || 'dark_stoic');
  const [description, setDescription] = useState(channel?.description || '');
  const [defaultPrivacy, setDefaultPrivacy] = useState<'unlisted' | 'public' | 'private'>(
    channel?.default_privacy || 'unlisted',
  );
  const [tags, setTags] = useState(channel?.default_tags?.join(', ') || 'shorts, viral, ai');

  // Google OAuth Credentials
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => api.getGenres(),
  });

  const mutation = useMutation({
    mutationFn: () => {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: any = {
        id: id.trim(),
        name: name.trim(),
        genreKey,
        description: description.trim(),
        defaultPrivacy,
        defaultTags: parsedTags,
      };

      if (clientId.trim() && clientSecret.trim() && refreshToken.trim()) {
        payload.credentials = {
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          refreshToken: refreshToken.trim(),
        };
      }

      return api.configureChannel(payload);
    },
    onSuccess: (res) => {
      success(res.message || 'Channel configured successfully');
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      onClose();
    },
    onError: (err: Error) => {
      error(`Configuration failed: ${err.message}`);
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={channel ? `Edit Channel: ${channel.name}` : 'Configure New Channel'}
      description="Connect a YouTube brand identity, genre DNA preset, and Google OAuth credentials."
      maxWidth="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Channel Identifier (ID)
            </label>
            <input
              type="text"
              required
              disabled={Boolean(channel)}
              placeholder="e.g. channel_04_mystery"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Genre DNA Style
            </label>
            <select
              value={genreKey}
              onChange={(e) => setGenreKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {genresData?.data.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Midnight Paradox (Science Mystery)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief channel purpose & audience profile..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Default Video Privacy
            </label>
            <select
              value={defaultPrivacy}
              onChange={(e: any) => setDefaultPrivacy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="unlisted">Unlisted (HITL Moderation)</option>
              <option value="public">Public (Immediate Direct Release)</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Default Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="history, shorts, paradox"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Google OAuth Credentials Section */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-400">
              Google OAuth2 Credentials (AES-256 Encrypted)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Optional for render-only
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Google Client ID (e.g. 449942607582-xxxx.apps.googleusercontent.com)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Google Client Secret (e.g. GOCSPX-xxxx)"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Google OAuth2 Refresh Token (e.g. 1//0gte8cYX6xxxx)"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={mutation.isPending}
          >
            Save Channel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
