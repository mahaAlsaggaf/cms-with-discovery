import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';

@ApiTags('discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  // Universal search endpoint - matches Thmanyah pattern
  @Get('search')
  @ApiOperation({ 
    summary: 'Universal content search',
    description: 'Search across both series and episodes with filtering and pagination support'
  })
  @ApiQuery({ name: 'query', required: false, description: 'Search query string', example: 'technology' })
  @ApiQuery({ name: 'from', required: false, description: 'Pagination offset', example: '0' })
  @ApiQuery({ name: 'size', required: false, description: 'Number of results to return', example: '20' })
  @ApiQuery({ name: 'type', required: false, description: 'Content type filter', enum: ['all', 'episode', 'series', 'podcast', 'documentary'], example: 'all' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results with pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          description: 'Array of series and/or episodes matching the search'
        },
        total: {
          type: 'number',
          description: 'Total number of matching results'
        },
        from: {
          type: 'number',
          description: 'Pagination offset'
        },
        size: {
          type: 'number',
          description: 'Number of results returned'
        }
      }
    }
  })
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

  // Episodes search endpoint
  @Get('episodes/search')
  @ApiOperation({ 
    summary: 'Search episodes only',
    description: 'Search specifically within episodes (videos) with series type filtering'
  })
  @ApiQuery({ name: 'query', required: false, description: 'Search query for episode titles/descriptions', example: 'AI technology' })
  @ApiQuery({ name: 'from', required: false, description: 'Pagination offset', example: '0' })
  @ApiQuery({ name: 'size', required: false, description: 'Number of episodes to return', example: '20' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by series type', enum: ['podcast', 'documentary'], example: 'podcast' })
  @ApiResponse({ 
    status: 200, 
    description: 'Episodes search results',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          description: 'Array of episodes matching the search'
        },
        total: { type: 'number' },
        from: { type: 'number' },
        size: { type: 'number' }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Search series only',
    description: 'Search specifically within series (podcasts/documentaries)'
  })
  @ApiQuery({ name: 'query', required: false, description: 'Search query for series titles/descriptions', example: 'tech podcast' })
  @ApiQuery({ name: 'from', required: false, description: 'Pagination offset', example: '0' })
  @ApiQuery({ name: 'size', required: false, description: 'Number of series to return', example: '20' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by series type', enum: ['podcast', 'documentary'], example: 'podcast' })
  @ApiResponse({ status: 200, description: 'Series search results with same structure as episodes search' })
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

  // Featured content endpoint
  @Get('featured')
  @ApiOperation({ 
    summary: 'Get featured content',
    description: 'Retrieve featured series and recent episodes, optionally filtered by type'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter featured content by type', enum: ['all', 'podcast', 'documentary'], example: 'all' })
  @ApiResponse({ 
    status: 200, 
    description: 'Featured content including series and recent episodes',
    schema: {
      type: 'object',
      properties: {
        featuredSeries: {
          type: 'array',
          description: 'Array of featured series'
        },
        recentEpisodes: {
          type: 'array',
          description: 'Array of recent episodes'
        }
      }
    }
  })
  getFeatured(@Query('type') type?: string) {
    return this.discoveryService.getFeatured(type);
  }

  // Categories endpoint
  @Get('categories')
  @ApiOperation({ 
    summary: 'Get all categories',
    description: 'Retrieve all available content categories for filtering'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available categories',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of category names',
          example: ['Technology', 'Science', 'Business']
        }
      }
    }
  })
  getCategories() {
    return this.discoveryService.getCategories();
  }

  // Recent episodes endpoint
  @Get('episodes/recent')
  @ApiOperation({ 
    summary: 'Get recent episodes',
    description: 'Retrieve recently published episodes with pagination and type filtering'
  })
  @ApiQuery({ name: 'from', required: false, description: 'Pagination offset', example: '0' })
  @ApiQuery({ name: 'size', required: false, description: 'Number of episodes to return', example: '20' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by series type', enum: ['podcast', 'documentary'], example: 'podcast' })
  @ApiResponse({ status: 200, description: 'Recent episodes with pagination' })
  getRecentEpisodes(
    @Query('from') from?: string,
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

  // Series by type endpoint
  @Get('series/by-type')
  @ApiOperation({ 
    summary: 'Get series by type',
    description: 'Retrieve series filtered by type (podcast or documentary) with pagination'
  })
  @ApiQuery({ name: 'type', required: true, description: 'Series type to filter by', enum: ['podcast', 'documentary'], example: 'podcast' })
  @ApiQuery({ name: 'from', required: false, description: 'Pagination offset', example: '0' })
  @ApiQuery({ name: 'size', required: false, description: 'Number of series to return', example: '20' })
  @ApiResponse({ status: 200, description: 'Series filtered by type with pagination' })
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
