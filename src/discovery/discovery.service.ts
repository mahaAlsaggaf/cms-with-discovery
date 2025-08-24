import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Series } from '../cms/series/entities/series.entity';
import { Episode } from '../cms/episodes/entities/episode.entity';

export interface SearchParams {
  query: string;
  from: number;
  size: number;
  type: string;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  from: number;
  size: number;
}

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(Series)
    private seriesRepository: Repository<Series>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
  ) {}

  // Universal search endpoint - searches both series and episodes
  async search(params: SearchParams): Promise<SearchResult<Series | Episode>> {
    const { query, from, size, type } = params;

    if (type === 'episode') {
      return this.searchEpisodes(params);
    } else if (type === 'series' || type === 'podcast' || type === 'documentary') {
      return this.searchSeries(params);
    } else {
      // Search both and combine results
      return this.searchAll(params);
    }
  }

  // Search episodes only
  async searchEpisodes(params: SearchParams): Promise<SearchResult<Episode>> {
    const { query, from, size, type } = params;

    const queryBuilder = this.episodeRepository
      .createQueryBuilder('episode')
      .leftJoinAndSelect('episode.series', 'series');

    // Add text search if query provided
    if (query && query.trim()) {
      queryBuilder.where(
        '(episode.title ILIKE :query OR episode.description ILIKE :query OR series.title ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    // Filter by series type if specified
    if (type && type !== 'episode' && type !== 'all') {
      queryBuilder.andWhere('series.type = :seriesType', { seriesType: type });
    }

    // Only show published content
    queryBuilder.andWhere('episode.isPublished = :published', { published: true });
    queryBuilder.andWhere('series.isPublished = :seriesPublished', { seriesPublished: true });

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const episodes = await queryBuilder
      .orderBy('episode.publishedAt', 'DESC')
      .skip(from)
      .take(size)
      .getMany();

    return {
      data: episodes,
      total,
      from,
      size,
    };
  }

  // Search series only
  async searchSeries(params: SearchParams): Promise<SearchResult<Series>> {
    const { query, from, size, type } = params;

    const queryBuilder = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.episodes', 'episodes', 'episodes.isPublished = :episodePublished', { episodePublished: true });

    // Add text search if query provided
    if (query && query.trim()) {
      queryBuilder.where(
        '(series.title ILIKE :query OR series.description ILIKE :query OR series.category ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    // Filter by type if specified (podcast/documentary)
    if (type && type !== 'series' && type !== 'all') {
      queryBuilder.andWhere('series.type = :seriesType', { seriesType: type });
    }

    // Only show published content
    queryBuilder.andWhere('series.isPublished = :published', { published: true });

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const series = await queryBuilder
      .orderBy('series.datePublished', 'DESC')
      .skip(from)
      .take(size)
      .getMany();

    return {
      data: series,
      total,
      from,
      size,
    };
  }

  // Search both series and episodes (combined results)
  async searchAll(params: SearchParams): Promise<SearchResult<Series | Episode>> {
    const { query, from, size } = params;

    // For combined search, we'll search both and merge results
    // This is a simplified approach - in production you might want more sophisticated ranking
    
    const halfSize = Math.ceil(size / 2);
    
    const [seriesResults, episodeResults] = await Promise.all([
      this.searchSeries({ ...params, size: halfSize }),
      this.searchEpisodes({ ...params, size: halfSize }),
    ]);

    // Combine and sort by relevance/date
    const combinedData = [...seriesResults.data, ...episodeResults.data];
    const totalResults = seriesResults.total + episodeResults.total;

    // Apply pagination to combined results
    const paginatedData = combinedData.slice(from, from + size);

    return {
      data: paginatedData,
      total: totalResults,
      from,
      size,
    };
  }

  // Get featured/trending content
  async getFeatured(type?: string): Promise<{
    featuredSeries: Series[];
    recentEpisodes: Episode[];
  }> {
    const seriesQuery = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.episodes', 'episodes', 'episodes.isPublished = :episodePublished', { episodePublished: true })
      .where('series.isPublished = :published', { published: true });

    if (type && type !== 'all') {
      seriesQuery.andWhere('series.type = :type', { type });
    }

    const featuredSeries = await seriesQuery
      .orderBy('series.datePublished', 'DESC')
      .take(10)
      .getMany();

    const episodeQuery = this.episodeRepository
      .createQueryBuilder('episode')
      .leftJoinAndSelect('episode.series', 'series')
      .where('episode.isPublished = :published', { published: true })
      .andWhere('series.isPublished = :seriesPublished', { seriesPublished: true });

    if (type && type !== 'all') {
      episodeQuery.andWhere('series.type = :type', { type });
    }

    const recentEpisodes = await episodeQuery
      .orderBy('episode.publishedAt', 'DESC')
      .take(20)
      .getMany();

    return {
      featuredSeries,
      recentEpisodes,
    };
  }

  // Get categories for filtering
  async getCategories(): Promise<{ categories: string[] }> {
    const categories = await this.seriesRepository
      .createQueryBuilder('series')
      .select('DISTINCT series.category', 'category')
      .where('series.isPublished = :published', { published: true })
      .andWhere('series.category IS NOT NULL')
      .getRawMany();

    return {
      categories: categories.map(c => c.category).filter(Boolean),
    };
  }
}
