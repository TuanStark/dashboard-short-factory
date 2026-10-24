import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenresService } from './genres.service';
import { UpdateGenreDto } from './dto/genre.dto';

@ApiTags('Genres')
@Controller('api/v2/genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @ApiOperation({ summary: 'List all artistic genre profiles (Brand DNA)' })
  @ApiResponse({ status: 200, description: 'Genres returned' })
  async getGenres() {
    return this.genresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a specific genre profile' })
  async getGenre(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update genre director prompt or aesthetic settings' })
  async updateGenre(@Param('id') id: string, @Body() dto: UpdateGenreDto) {
    return this.genresService.update(id, dto);
  }
}
