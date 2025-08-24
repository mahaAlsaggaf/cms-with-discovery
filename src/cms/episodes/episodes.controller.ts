import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@ApiTags('episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new episode', description: 'Create a new video episode for a series' })
  @ApiResponse({ status: 201, description: 'Episode created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createEpisodeDto: CreateEpisodeDto) {
    return this.episodesService.create(createEpisodeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all episodes', description: 'Retrieve all published episodes' })
  @ApiResponse({ status: 200, description: 'List of all episodes' })
  findAll() {
    return this.episodesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get episode by ID', description: 'Retrieve a specific episode by its ID' })
  @ApiParam({ name: 'id', description: 'Episode UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Episode found' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  findOne(@Param('id') id: string) {
    return this.episodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update episode', description: 'Update an existing episode' })
  @ApiParam({ name: 'id', description: 'Episode UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Episode updated successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  update(@Param('id') id: string, @Body() updateEpisodeDto: UpdateEpisodeDto) {
    return this.episodesService.update(id, updateEpisodeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete episode', description: 'Delete an episode by ID' })
  @ApiParam({ name: 'id', description: 'Episode UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Episode deleted successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  remove(@Param('id') id: string) {
    return this.episodesService.remove(id);
  }
}
