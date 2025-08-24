import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

@ApiTags('series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new series', description: 'Create a new podcast or documentary series' })
  @ApiResponse({ status: 201, description: 'Series created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createSeriesDto: CreateSeriesDto) {
    return this.seriesService.create(createSeriesDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all series', description: 'Retrieve all published series (podcasts and documentaries)' })
  @ApiResponse({ status: 200, description: 'List of all series' })
  findAll() {
    return this.seriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get series by ID', description: 'Retrieve a specific series by its ID' })
  @ApiParam({ name: 'id', description: 'Series ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Series found' })
  @ApiResponse({ status: 404, description: 'Series not found' })
  findOne(@Param('id') id: string) {
    return this.seriesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update series', description: 'Update an existing series' })
  @ApiParam({ name: 'id', description: 'Series ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Series updated successfully' })
  @ApiResponse({ status: 404, description: 'Series not found' })
  update(@Param('id') id: string, @Body() updateSeriesDto: UpdateSeriesDto) {
    return this.seriesService.update(+id, updateSeriesDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete series', description: 'Delete a series by ID' })
  @ApiParam({ name: 'id', description: 'Series ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Series deleted successfully' })
  @ApiResponse({ status: 404, description: 'Series not found' })
  remove(@Param('id') id: string) {
    return this.seriesService.remove(+id);
  }
}
