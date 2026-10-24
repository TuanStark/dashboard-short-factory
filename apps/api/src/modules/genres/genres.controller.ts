import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { GenresService } from './genres.service';
import { UpdateGenreDto } from './dto/genre.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Genres')
@ApiBearerAuth('JWT-auth')
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

  @Roles(UserRole.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update genre director prompt or aesthetic settings' })
  async updateGenre(@Param('id') id: string, @Body() dto: UpdateGenreDto) {
    return this.genresService.update(id, dto);
  }
}
