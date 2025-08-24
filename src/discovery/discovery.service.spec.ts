import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DiscoveryService } from './discovery.service';
import { Series } from '../cms/series/entities/series.entity';
import { Episode } from '../cms/episodes/entities/episode.entity';

describe('DiscoveryService', () => {
  let service: DiscoveryService;
  let seriesRepository: Repository<Series>;
  let episodeRepository: Repository<Episode>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
  };

  const mockSeriesRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    find: jest.fn(),
  };

  const mockEpisodeRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    find: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null), // Default to cache miss
    set: jest.fn().mockResolvedValue(undefined),
  };

  const mockSeries: Series = {
    id: 1,
    title: 'Test Podcast',
    description: 'A test podcast description',
    type: 'podcast',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    category: 'Technology',
    language: 'en',
    isPublished: true,
    datePublished: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    episodes: [],
    updateTimestamp: jest.fn(),
  };

  const mockEpisode: Episode = {
    id: 'episode-uuid-1',
    title: 'Test Episode',
    description: 'A test episode description',
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    duration: 1800,
    episodeNumber: 1,
    seasonNumber: 1,
    isPublished: true,
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    series: mockSeries,
    updateTimestamp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoveryService,
        {
          provide: getRepositoryToken(Series),
          useValue: mockSeriesRepository,
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockEpisodeRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<DiscoveryService>(DiscoveryService);
    seriesRepository = module.get<Repository<Series>>(getRepositoryToken(Series));
    episodeRepository = module.get<Repository<Episode>>(getRepositoryToken(Episode));
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockQueryBuilder.getMany.mockReset();
    mockQueryBuilder.getCount.mockReset();
    mockQueryBuilder.getRawMany.mockReset();
  });

  describe('search', () => {
    it('should perform universal search with default parameters', async () => {
      const searchParams = { query: '', from: 0, size: 20, type: 'all' };
      const mockResults = {
        data: [mockSeries, mockEpisode],
        total: 2,
        from: 0,
        size: 20,
      };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockSeries]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockEpisode]);

      const result = await service.search(searchParams);

      expect(mockSeriesRepository.createQueryBuilder).toHaveBeenCalledWith('series');
      expect(mockEpisodeRepository.createQueryBuilder).toHaveBeenCalledWith('episode');
      expect(result).toEqual(mockResults);
    });

    it('should search with specific query term', async () => {
      const searchParams = { query: 'technology', from: 0, size: 10, type: 'all' };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockSeries]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockEpisode]);

      await service.search(searchParams);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(series.title ILIKE :query OR series.description ILIKE :query OR series.category ILIKE :query)',
        { query: '%technology%' }
      );
    });

    it('should apply pagination parameters', async () => {
      const searchParams = { query: '', from: 10, size: 5, type: 'all' };

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.search(searchParams);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(3); // Half of size for each query
    });

    it('should filter by type when specified', async () => {
      const searchParams = { query: '', from: 0, size: 20, type: 'podcast' };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValueOnce([mockSeries]);
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      await service.search(searchParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('series.type = :seriesType', { seriesType: 'podcast' });
    });
  });

  describe('searchEpisodes', () => {
    it('should search episodes with default parameters', async () => {
      const searchParams = { query: '', from: 0, size: 20, type: 'episode' };
      const mockResults = {
        data: [mockEpisode],
        total: 1,
        from: 0,
        size: 20,
      };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockEpisode]);

      const result = await service.searchEpisodes(searchParams);

      expect(mockEpisodeRepository.createQueryBuilder).toHaveBeenCalledWith('episode');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('episode.series', 'series');
      expect(result).toEqual(mockResults);
    });

    it('should search episodes with query term', async () => {
      const searchParams = { query: 'test', from: 0, size: 20, type: 'episode' };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockEpisode]);

      await service.searchEpisodes(searchParams);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(episode.title ILIKE :query OR episode.description ILIKE :query OR series.title ILIKE :query)',
        { query: '%test%' }
      );
    });

    it('should filter episodes by series type', async () => {
      const searchParams = { query: '', from: 0, size: 20, type: 'podcast' };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockEpisode]);

      await service.searchEpisodes(searchParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('series.type = :seriesType', { seriesType: 'podcast' });
    });
  });

  describe('searchSeries', () => {
    it('should search series with default parameters', async () => {
      const searchParams = { query: '', from: 0, size: 20, type: 'series' };
      const mockResults = {
        data: [mockSeries],
        total: 1,
        from: 0,
        size: 20,
      };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSeries]);

      const result = await service.searchSeries(searchParams);

      expect(mockSeriesRepository.createQueryBuilder).toHaveBeenCalledWith('series');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('series.episodes', 'episodes', 'episodes.isPublished = :episodePublished', { episodePublished: true });
      expect(result).toEqual(mockResults);
    });

    it('should search series with query term', async () => {
      const searchParams = { query: 'podcast', from: 0, size: 20, type: 'series' };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSeries]);

      await service.searchSeries(searchParams);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(series.title ILIKE :query OR series.description ILIKE :query OR series.category ILIKE :query)',
        { query: '%podcast%' }
      );
    });

    it('should filter series by type', async () => {
      const searchParams = { query: '', from: 0, size: 20, type: 'documentary' };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSeries]);

      await service.searchSeries(searchParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('series.type = :seriesType', { seriesType: 'documentary' });
    });
  });

  describe('getFeatured', () => {
    it('should get featured content without type filter', async () => {
      const mockFeaturedSeries = [mockSeries];
      const mockRecentEpisodes = [mockEpisode];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockFeaturedSeries);
      mockQueryBuilder.getMany.mockResolvedValueOnce(mockRecentEpisodes);

      const result = await service.getFeatured();

      expect(mockSeriesRepository.createQueryBuilder).toHaveBeenCalledWith('series');
      expect(mockEpisodeRepository.createQueryBuilder).toHaveBeenCalledWith('episode');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('series.episodes', 'episodes', 'episodes.isPublished = :episodePublished', { episodePublished: true });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('episode.series', 'series');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('series.isPublished = :published', { published: true });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('episode.isPublished = :published', { published: true });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('series.datePublished', 'DESC');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('episode.publishedAt', 'DESC');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);

      expect(result).toEqual({
        featuredSeries: mockFeaturedSeries,
        recentEpisodes: mockRecentEpisodes,
      });
    });

    it('should get featured content with type filter', async () => {
      const mockFeaturedSeries = [mockSeries];
      const mockRecentEpisodes = [mockEpisode];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockFeaturedSeries);
      mockQueryBuilder.getMany.mockResolvedValueOnce(mockRecentEpisodes);

      await service.getFeatured('podcast');

      expect(mockSeriesRepository.createQueryBuilder).toHaveBeenCalledWith('series');
      expect(mockEpisodeRepository.createQueryBuilder).toHaveBeenCalledWith('episode');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('series.type = :type', { type: 'podcast' });
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockCategories = [
        { category: 'Technology' },
        { category: 'Science' },
        { category: 'Business' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockCategories);

      const result = await service.getCategories();

      expect(mockSeriesRepository.createQueryBuilder).toHaveBeenCalledWith('series');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('DISTINCT series.category', 'category');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('series.isPublished = :published', { published: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('series.category IS NOT NULL');

      expect(result).toEqual({
        categories: ['Technology', 'Science', 'Business'],
      });
    });

    it('should filter out null/empty categories', async () => {
      const mockCategories = [
        { category: 'Technology' },
        { category: null },
        { category: '' },
        { category: 'Science' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockCategories);

      const result = await service.getCategories();

      expect(result).toEqual({
        categories: ['Technology', 'Science'],
      });
    });
  });
});
