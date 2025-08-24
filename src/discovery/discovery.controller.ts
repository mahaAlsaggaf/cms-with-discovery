import { Controller, Get, Query } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  // Universal search endpoint - matches Thmanyah pattern
  @Get('search')
  search(
    @Query('query') query?: string,
    @Query('from') from?: string,
    @Query('size') size?: string,
    @Query('type') type?: string,
  ) {
    const searchParams = {
      query: query || '',
      from: parseInt(from || '0') || 0,
      size: parseInt(size || '20') || 20,
      type: type || 'all',
    };
    return this.discoveryService.search(searchParams);
  }

  // Episodes-specific search endpoint
  @Get('episodes/search')
  searchEpisodes(
    @Query('query') query?: string,
    @Query('from') from?: string,
    @Query('size') size?: string,
    @Query('type') type?: string,
  ) {
    const searchParams = {
      query: query || '',
      from: parseInt(from || '0') || 0,
      size: parseInt(size || '20') || 20,
      type: type || 'episode',
    };
    return this.discoveryService.searchEpisodes(searchParams);
  }

  // Series-specific search endpoint
  @Get('series/search')
  searchSeries(
    @Query('query') query?: string,
    @Query('from') from?: string,
    @Query('size') size?: string,
    @Query('type') type?: string,
  ) {
    const searchParams = {
      query: query || '',
      from: parseInt(from || '0') || 0,
      size: parseInt(size || '20') || 20,
      type: type || 'series',
    };
    return this.discoveryService.searchSeries(searchParams);
  }

  // Get featured/trending content
  @Get('featured')
  getFeatured(@Query('type') type?: string) {
    return this.discoveryService.getFeatured(type);
  }

  // Get available categories for filtering
  @Get('categories')
  getCategories() {
    return this.discoveryService.getCategories();
  }

  // Get recent episodes
  @Get('episodes/recent')
  getRecentEpisodes(
    @Query('size') size?: string,
    @Query('type') type?: string,
  ) {
    const searchParams = {
      query: '',
      from: 0,
      size: parseInt(size || '20') || 20,
      type: type || 'episode',
    };
    return this.discoveryService.searchEpisodes(searchParams);
  }

  // Get series by type (podcasts or documentaries)
  @Get('series/by-type')
  getSeriesByType(
    @Query('type') type: string,
    @Query('from') from?: string,
    @Query('size') size?: string,
  ) {
    const searchParams = {
      query: '',
      from: parseInt(from || '0') || 0,
      size: parseInt(size || '20') || 20,
      type: type || 'podcast',
    };
    return this.discoveryService.searchSeries(searchParams);
  }
}
