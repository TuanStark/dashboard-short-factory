import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { Palette, Save } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { GenreProfile } from '@short-factory/contracts';

export const GenresPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: () => api.getGenres(),
  });

  const genres = data?.data || [];
  const [selectedGenreId, setSelectedGenreId] = useState<string>('dark_stoic');

  // Form State for Editing
  const currentGenre = genres.find((g) => g.id === selectedGenreId) || genres[0];

  const [formState, setFormState] = useState<Partial<GenreProfile>>({});

  React.useEffect(() => {
    if (currentGenre) {
      setFormState({
        system_prompt_scriptwriter: currentGenre.system_prompt_scriptwriter,
        visual_style_prompt: currentGenre.visual_style_prompt,
        visual_negative_prompt: currentGenre.visual_negative_prompt,
        tts_provider: currentGenre.tts_provider,
        tts_voice_id: currentGenre.tts_voice_id,
        soundscape_preset: currentGenre.soundscape_preset,
        motion_engine_preset: currentGenre.motion_engine_preset,
      });
    }
  }, [currentGenre?.id]);

  const updateMutation = useMutation({
    mutationFn: () => api.updateGenre(currentGenre.id, formState),
    onSuccess: () => {
      success('Brand DNA profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
    onError: (err: Error) => {
      error(`Update failed: ${err.message}`);
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Brand DNA & Artistic Profiles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Director prompt directives, visual generation rules, and audio presets for each channel aesthetic.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500">Loading genre profiles...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Genre Tabs (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider">
              Profile DNA Catalog
            </h3>
            <div className="space-y-2">
              {genres.map((g) => {
                const isSelected = g.id === (currentGenre?.id || selectedGenreId);
                return (
                  <Card
                    key={g.id}
                    hoverEffect
                    onClick={() => setSelectedGenreId(g.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-white">{g.name}</h4>
                        <p className="text-[10px] font-mono text-indigo-400 mt-0.5">{g.id}</p>
                      </div>
                      <Badge variant="purple">
                        <Palette className="w-3 h-3" />
                        DNA
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{g.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>TTS: {g.tts_voice_id}</span>
                      <span>Motion: {g.motion_engine_preset}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Editor (8 cols) */}
          <div className="lg:col-span-8">
            {currentGenre ? (
              <Card className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{currentGenre.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{currentGenre.description}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={updateMutation.isPending}
                    leftIcon={<Save className="w-4 h-4" />}
                    onClick={() => updateMutation.mutate()}
                  >
                    Save DNA Changes
                  </Button>
                </div>

                {/* AGY Scriptwriter Director Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-indigo-300">
                      AGY CLI Scriptwriter Director Prompt
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      System instruction for Gemini/AGY
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={formState.system_prompt_scriptwriter || ''}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        system_prompt_scriptwriter: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Visual Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Visual Style Prompt (Positive)
                    </label>
                    <textarea
                      rows={4}
                      value={formState.visual_style_prompt || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          visual_style_prompt: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Visual Negative Prompt (Avoidances)
                    </label>
                    <textarea
                      rows={4}
                      value={formState.visual_negative_prompt || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          visual_negative_prompt: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Audio & Motion Engine Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      TTS Voice Identifier
                    </label>
                    <input
                      type="text"
                      value={formState.tts_voice_id || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          tts_voice_id: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Soundscape Preset
                    </label>
                    <input
                      type="text"
                      value={formState.soundscape_preset || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          soundscape_preset: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Motion Preset
                    </label>
                    <input
                      type="text"
                      value={formState.motion_engine_preset || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          motion_engine_preset: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
