import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { Episode } from './entities/episode.entity';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

describe('EpisodesService', () => {
  let service: EpisodesService;
  let repository: Repository<Episode>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockEpisode: Episode = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Episode',
    description: 'A test episode description',
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    duration: 3600,
    episodeNumber: 1,
    seasonNumber: 1,
    isPublished: true,
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    updateTimestamp: jest.fn(),
    series: {
      id: 1,
      title: 'Test Series',
    } as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpisodesService,
        {
          provide: getRepositoryToken(Episode),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EpisodesService>(EpisodesService);
    repository = module.get<Repository<Episode>>(getRepositoryToken(Episode));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new episode', async () => {
      const createEpisodeDto: CreateEpisodeDto = {
        title: 'Test Episode',
        description: 'A test episode description',
        videoUrl: 'https://example.com/video.mp4',
        episodeNumber: 1,
        seriesId: 1,
      };

      mockRepository.create.mockReturnValue(mockEpisode);
      mockRepository.save.mockResolvedValue(mockEpisode);

      const result = await service.create(createEpisodeDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'Test Episode',
        description: 'A test episode description',
        videoUrl: 'https://example.com/video.mp4',
        episodeNumber: 1,
        series: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockEpisode);
      expect(result).toEqual(mockEpisode);
    });
  });

  describe('findAll', () => {
    it('should return an array of episodes', async () => {
      const mockEpisodeArray = [mockEpisode];
      mockRepository.find.mockResolvedValue(mockEpisodeArray);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['series'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockEpisodeArray);
    });
  });

  describe('findOne', () => {
    it('should return an episode when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockEpisode);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['series'],
      });
      expect(result).toEqual(mockEpisode);
    });

    it('should throw NotFoundException when episode not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Episode with ID non-existent-id not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the episode and return confirmation', async () => {
      mockRepository.findOne.mockResolvedValue(mockEpisode);
      mockRepository.remove.mockResolvedValue(mockEpisode);

      const result = await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['series'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockEpisode);
      expect(result).toEqual({
        deleted: true,
        message: `Episode 'Test Episode' has been deleted successfully`,
      });
    });

    it('should throw NotFoundException when episode to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        new NotFoundException('Episode with ID non-existent-id not found'),
      );
    });
  });

  describe('update', () => {
    it('should update and return the episode', async () => {
      const updateEpisodeDto: UpdateEpisodeDto = {
        title: 'Updated Episode Title',
      };
      const updatedEpisode = { ...mockEpisode, ...updateEpisodeDto };

      mockRepository.findOne.mockResolvedValue(mockEpisode);
      mockRepository.save.mockResolvedValue(updatedEpisode);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateEpisodeDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['series'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedEpisode);
      expect(result).toEqual(updatedEpisode);
    });

    it('should throw NotFoundException when episode to update not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { title: 'Updated Title' }),
      ).rejects.toThrow(new NotFoundException('Episode with ID non-existent-id not found'));
    });
  });

  describe('findBySeries', () => {
    it('should return episodes filtered by series', async () => {
      const seriesEpisodes = [mockEpisode];
      mockRepository.find.mockResolvedValue(seriesEpisodes);

      const result = await service.findBySeries(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { series: { id: 1 } },
        relations: ['series'],
        order: { episodeNumber: 'ASC' },
      });
      expect(result).toEqual(seriesEpisodes);
    });
  });

  describe('findBySeasonAndSeries', () => {
    it('should return episodes filtered by series and season', async () => {
      const seasonEpisodes = [mockEpisode];
      mockRepository.find.mockResolvedValue(seasonEpisodes);

      const result = await service.findBySeasonAndSeries(1, 1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { 
          series: { id: 1 },
          seasonNumber: 1 
        },
        relations: ['series'],
        order: { episodeNumber: 'ASC' },
      });
      expect(result).toEqual(seasonEpisodes);
    });
  });

  describe('findPublished', () => {
    it('should return only published episodes', async () => {
      const publishedEpisodes = [mockEpisode];
      mockRepository.find.mockResolvedValue(publishedEpisodes);

      const result = await service.findPublished();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isPublished: true },
        relations: ['series'],
        order: { publishedAt: 'DESC' },
      });
      expect(result).toEqual(publishedEpisodes);
    });
  });
});
