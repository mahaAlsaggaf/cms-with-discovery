import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SeriesService } from './series.service';
import { Series } from './entities/series.entity';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

describe('SeriesService', () => {
  let service: SeriesService;
  let repository: Repository<Series>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: getRepositoryToken(Series),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SeriesService>(SeriesService);
    repository = module.get<Repository<Series>>(getRepositoryToken(Series));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new series', async () => {
      const createSeriesDto: CreateSeriesDto = {
        title: 'Test Podcast',
        description: 'A test podcast description',
        type: 'podcast',
        category: 'Technology',
        language: 'en',
        isPublished: true,
      };

      mockRepository.create.mockReturnValue(mockSeries);
      mockRepository.save.mockResolvedValue(mockSeries);

      const result = await service.create(createSeriesDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createSeriesDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockSeries);
      expect(result).toEqual(mockSeries);
    });
  });

  describe('findAll', () => {
    it('should return an array of series', async () => {
      const mockSeriesArray = [mockSeries];
      mockRepository.find.mockResolvedValue(mockSeriesArray);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['episodes'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockSeriesArray);
    });
  });

  describe('findOne', () => {
    it('should return a series when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockSeries);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['episodes'],
      });
      expect(result).toEqual(mockSeries);
    });

    it('should throw NotFoundException when series not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Series with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the series and return confirmation', async () => {
      mockRepository.findOne.mockResolvedValue(mockSeries);
      mockRepository.remove.mockResolvedValue(mockSeries);

      const result = await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['episodes'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockSeries);
      expect(result).toEqual({
        deleted: true,
        message: `Series 'Test Podcast' has been deleted successfully`,
      });
    });

    it('should throw NotFoundException when series to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Series with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update and return the series', async () => {
      const updateSeriesDto: UpdateSeriesDto = {
        title: 'Updated Podcast Title',
      };
      const updatedSeries = { ...mockSeries, ...updateSeriesDto };

      mockRepository.findOne.mockResolvedValue(mockSeries);
      mockRepository.save.mockResolvedValue(updatedSeries);

      const result = await service.update(1, updateSeriesDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['episodes'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedSeries);
      expect(result).toEqual(updatedSeries);
    });

    it('should throw NotFoundException when series to update not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { title: 'Updated Title' }),
      ).rejects.toThrow(new NotFoundException('Series with ID 999 not found'));
    });
  });

  describe('findByType', () => {
    it('should return series filtered by type', async () => {
      const podcastSeries = [{ ...mockSeries, type: 'podcast' }];
      mockRepository.find.mockResolvedValue(podcastSeries);

      const result = await service.findByType('podcast');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { type: 'podcast' },
        relations: ['episodes'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(podcastSeries);
    });
  });

  describe('findPublished', () => {
    it('should return only published series', async () => {
      const publishedSeries = [{ ...mockSeries, isPublished: true }];
      mockRepository.find.mockResolvedValue(publishedSeries);

      const result = await service.findPublished();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isPublished: true },
        relations: ['episodes'],
        order: { datePublished: 'DESC' },
      });
      expect(result).toEqual(publishedSeries);
    });
  });
});
