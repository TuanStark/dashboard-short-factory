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
      success(res.message || 'Cấu hình kênh thành công');
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      onClose();
    },
    onError: (err: Error) => {
      error(`Cấu hình thất bại: ${err.message}`);
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={channel ? `Chỉnh Sửa Kênh: ${channel.name}` : 'Cấu Hình Kênh Mới'}
      description="Kết nối nhận diện thương hiệu YouTube, phong cách thể loại DNA và chứng chỉ Google OAuth."
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
              Mã Định Danh Kênh (ID)
            </label>
            <input
              type="text"
              required
              disabled={Boolean(channel)}
              placeholder="Ví dụ: channel_04_mystery"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Phong Cách Thể Loại DNA
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
            Tên Hiển Thị Kênh
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Midnight Paradox (Khoa Học Kỳ Bí)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Mô Tả Kênh
          </label>
          <textarea
            rows={2}
            placeholder="Mô tả ngắn gọn về định hướng kênh và đối tượng khán giả..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Chế Độ Hiển Thị Mặc Định
            </label>
            <select
              value={defaultPrivacy}
              onChange={(e: any) => setDefaultPrivacy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="unlisted">Không công khai (Cần kiểm duyệt)</option>
              <option value="public">Công khai (Tự động đăng ngay)</option>
              <option value="private">Riêng tư</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Thẻ Mặc Định (phân tách bằng dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="lich-su, shorts, huyen-bi"
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
              Chứng Chỉ Google OAuth2 (Mã hóa AES-256)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Tùy chọn cho chế độ chỉ render
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Google Client ID (ví dụ: 449942607582-xxxx.apps.googleusercontent.com)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Google Client Secret (ví dụ: GOCSPX-xxxx)"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Google OAuth2 Refresh Token (ví dụ: 1//0gte8cYX6xxxx)"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={mutation.isPending}
          >
            Lưu Kênh
          </Button>
        </div>
      </form>
    </Modal>
  );
};
