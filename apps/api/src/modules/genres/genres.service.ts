import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UpdateGenreDto } from './dto/genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const genres = await this.prisma.genreProfile.findMany({
      orderBy: { id: 'asc' },
    });

    return {
      success: true,
      count: genres.length,
      data: genres.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        system_prompt_scriptwriter: g.systemPromptScriptwriter,
        visual_style_prompt: g.visualStylePrompt,
        visual_negative_prompt: g.visualNegativePrompt,
        tts_provider: g.ttsProvider,
        tts_voice_id: g.ttsVoiceId,
        soundscape_preset: g.soundscapePreset,
        motion_engine_preset: g.motionEnginePreset,
        created_at: g.createdAt.toISOString(),
        updated_at: g.updatedAt.toISOString(),
      })),
    };
  }

  async findOne(id: string) {
    const g = await this.prisma.genreProfile.findUnique({
      where: { id },
    });

    if (!g) {
      throw new NotFoundException(`Genre profile ${id} not found`);
    }

    return {
      id: g.id,
      name: g.name,
      description: g.description,
      system_prompt_scriptwriter: g.systemPromptScriptwriter,
      visual_style_prompt: g.visualStylePrompt,
      visual_negative_prompt: g.visualNegativePrompt,
      tts_provider: g.ttsProvider,
      tts_voice_id: g.ttsVoiceId,
      soundscape_preset: g.soundscapePreset,
      motion_engine_preset: g.motionEnginePreset,
      created_at: g.createdAt.toISOString(),
      updated_at: g.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateGenreDto) {
    const existing = await this.prisma.genreProfile.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Genre profile ${id} not found`);
    }

    const updated = await this.prisma.genreProfile.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        systemPromptScriptwriter: dto.systemPromptScriptwriter,
        visualStylePrompt: dto.visualStylePrompt,
        visualNegativePrompt: dto.visualNegativePrompt,
        ttsProvider: dto.ttsProvider,
        ttsVoiceId: dto.ttsVoiceId,
        soundscapePreset: dto.soundscapePreset,
        motionEnginePreset: dto.motionEnginePreset,
      },
    });

    return {
      success: true,
      message: `Genre profile ${id} updated successfully.`,
      data: updated,
    };
  }
}
