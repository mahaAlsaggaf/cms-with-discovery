import { Test, TestingModule } from '@nestjs/testing';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entity';

describe('EpisodesController', () => {
  let controller: EpisodesController;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EpisodesController],
      providers: [
        EpisodesService,
        {
          provide: getRepositoryToken(Episode),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<EpisodesController>(EpisodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
