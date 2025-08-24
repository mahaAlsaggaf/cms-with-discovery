import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

describe('DiscoveryController', () => {
  let controller: DiscoveryController;
  let service: DiscoveryService;

  const mockDiscoveryService = {
    search: jest.fn(),
    searchEpisodes: jest.fn(),
    searchSeries: jest.fn(),
    getFeatured: jest.fn(),
    getCategories: jest.fn(),
  };

  const mockSeries = {
    id: 1,
    title: 'Test Podcast',
    description: 'A test podcast description',
    type: 'podcast',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    category: 'Technology',
    language: 'en',
    isPublished: true,
    datePublished: new Date('2024-01-01'),
    episodes: [],
  };

  const mockEpisode = {
    id: 1,
    title: 'Test Episode',
    description: 'A test episode description',
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    duration: 1800,
    isPublished: true,
    datePublished: new Date('2024-01-01'),
    series: mockSeries,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscoveryController],
      providers: [
        {
          provide: DiscoveryService,
          useValue: mockDiscoveryService,
        },
      ],
    }).compile();

    controller = module.get<DiscoveryController>(DiscoveryController);
    service = module.get<DiscoveryService>(DiscoveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should perform universal search with default parameters', async () => {
      const mockResult = {
        series: [mockSeries],
        episodes: [mockEpisode],
        total: 2,
      };

      mockDiscoveryService.search.mockResolvedValue(mockResult);

      const result = await controller.search();

      expect(mockDiscoveryService.search).toHaveBeenCalledWith({
        query: '',
        from: 0,
        size: 20,
        type: 'all',
      });
      expect(result).toEqual(mockResult);
    });

    it('should perform search with custom parameters', async () => {
      const mockResult = {
        series: [mockSeries],
        episodes: [],
        total: 1,
      };

      mockDiscoveryService.search.mockResolvedValue(mockResult);

      const result = await controller.search('technology', '10', '5', 'podcast');

      expect(mockDiscoveryService.search).toHaveBeenCalledWith({
        query: 'technology',
        from: 10,
        size: 5,
        type: 'podcast',
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle invalid numeric parameters gracefully', async () => {
      const mockResult = {
        series: [],
        episodes: [],
        total: 0,
      };

      mockDiscoveryService.search.mockResolvedValue(mockResult);

      await controller.search('test', 'invalid', 'invalid', 'all');

      expect(mockDiscoveryService.search).toHaveBeenCalledWith({
        query: 'test',
        from: 0, // parseInt('invalid') returns NaN, fallback to 0
        size: 20, // parseInt('invalid') returns NaN, fallback to 20
        type: 'all',
      });
    });
  });

  describe('searchEpisodes', () => {
    it('should search episodes with default parameters', async () => {
      const mockResult = {
        episodes: [mockEpisode],
        total: 1,
      };

      mockDiscoveryService.searchEpisodes.mockResolvedValue(mockResult);

      const result = await controller.searchEpisodes();

      expect(mockDiscoveryService.searchEpisodes).toHaveBeenCalledWith({
        query: '',
        from: 0,
        size: 20,
        type: 'episode',
      });
      expect(result).toEqual(mockResult);
    });

    it('should search episodes with custom parameters', async () => {
      const mockResult = {
        episodes: [mockEpisode],
        total: 1,
      };

      mockDiscoveryService.searchEpisodes.mockResolvedValue(mockResult);

      const result = await controller.searchEpisodes('test episode', '5', '10', 'podcast');

      expect(mockDiscoveryService.searchEpisodes).toHaveBeenCalledWith({
        query: 'test episode',
        from: 5,
        size: 10,
        type: 'podcast',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('searchSeries', () => {
    it('should search series with default parameters', async () => {
      const mockResult = {
        series: [mockSeries],
        total: 1,
      };

      mockDiscoveryService.searchSeries.mockResolvedValue(mockResult);

      const result = await controller.searchSeries();

      expect(mockDiscoveryService.searchSeries).toHaveBeenCalledWith({
        query: '',
        from: 0,
        size: 20,
        type: 'series',
      });
      expect(result).toEqual(mockResult);
    });

    it('should search series with custom parameters', async () => {
      const mockResult = {
        series: [mockSeries],
        total: 1,
      };

      mockDiscoveryService.searchSeries.mockResolvedValue(mockResult);

      const result = await controller.searchSeries('podcast', '0', '15', 'documentary');

      expect(mockDiscoveryService.searchSeries).toHaveBeenCalledWith({
        query: 'podcast',
        from: 0,
        size: 15,
        type: 'documentary',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getFeatured', () => {
    it('should get featured content without type filter', async () => {
      const mockResult = {
        featuredSeries: [mockSeries],
        recentEpisodes: [mockEpisode],
      };

      mockDiscoveryService.getFeatured.mockResolvedValue(mockResult);

      const result = await controller.getFeatured();

      expect(mockDiscoveryService.getFeatured).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResult);
    });

    it('should get featured content with type filter', async () => {
      const mockResult = {
        featuredSeries: [mockSeries],
        recentEpisodes: [mockEpisode],
      };

      mockDiscoveryService.getFeatured.mockResolvedValue(mockResult);

      const result = await controller.getFeatured('podcast');

      expect(mockDiscoveryService.getFeatured).toHaveBeenCalledWith('podcast');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getCategories', () => {
    it('should return available categories', async () => {
      const mockResult = {
        categories: ['Technology', 'Science', 'Business'],
      };

      mockDiscoveryService.getCategories.mockResolvedValue(mockResult);

      const result = await controller.getCategories();

      expect(mockDiscoveryService.getCategories).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getRecentEpisodes', () => {
    it('should get recent episodes with default parameters', async () => {
      const mockResult = {
        episodes: [mockEpisode],
        total: 1,
      };

      mockDiscoveryService.searchEpisodes.mockResolvedValue(mockResult);

      const result = await controller.getRecentEpisodes();

      expect(mockDiscoveryService.searchEpisodes).toHaveBeenCalledWith({
        query: '',
        from: 0,
        size: 20,
        type: 'episode',
      });
      expect(result).toEqual(mockResult);
    });

    it('should get recent episodes with custom parameters', async () => {
      const mockResult = {
        episodes: [mockEpisode],
        total: 1,
      };

      mockDiscoveryService.searchEpisodes.mockResolvedValue(mockResult);

      const result = await controller.getRecentEpisodes('0', '10', 'podcast');

      expect(mockDiscoveryService.searchEpisodes).toHaveBeenCalledWith({
        query: '',
        from: 0,
        size: 10,
        type: 'podcast',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getSeriesByType', () => {
    it('should get series by type with default parameters', async () => {
      const mockResult = {
        series: [mockSeries],
        total: 1,
      };

      mockDiscoveryService.searchSeries.mockResolvedValue(mockResult);

      const result = await controller.getSeriesByType('podcast');

      expect(mockDiscoveryService.searchSeries).toHaveBeenCalledWith({
        query: '',
        from: 0,
        size: 20,
        type: 'podcast',
      });
      expect(result).toEqual(mockResult);
    });

    it('should get series by type with custom parameters', async () => {
      const mockResult = {
        series: [mockSeries],
        total: 1,
      };

      mockDiscoveryService.searchSeries.mockResolvedValue(mockResult);

      const result = await controller.getSeriesByType('documentary', '5', '15');

      expect(mockDiscoveryService.searchSeries).toHaveBeenCalledWith({
        query: '',
        from: 5,
        size: 15,
        type: 'documentary',
      });
      expect(result).toEqual(mockResult);
    });
  });
});
