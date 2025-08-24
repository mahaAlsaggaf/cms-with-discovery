import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeriesModule } from '../series/series.module';
import { EpisodesModule } from './episodes.module';
import { Series } from '../series/entities/series.entity';
import { Episode } from './entities/episode.entity';
import databaseConfig from '../config/database.config';

describe('EpisodesController (Integration)', () => {
  let app: INestApplication;
  let createdSeriesId: number;
  let createdEpisodeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'postgres' as const,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'thmanyah_db_test', // Use test database
            entities: [Series, Episode],
            synchronize: true, // OK for tests
            dropSchema: true, // Clean slate for each test run
          }),
        }),
        SeriesModule,
        EpisodesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();

    // Create a series first (episodes need a series to belong to)
    const seriesResponse = await request(app.getHttpServer())
      .post('/series')
      .send({
        title: 'Test Series for Episodes',
        description: 'A test series for episode integration testing',
        type: 'podcast',
        category: 'Technology',
        language: 'en',
        isPublished: true,
      });

    createdSeriesId = seriesResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /episodes', () => {
    it('should create a new episode', async () => {
      const createEpisodeDto = {
        title: 'Test Episode Integration',
        description: 'A test episode for integration testing',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        duration: 3600,
        episodeNumber: 1,
        seasonNumber: 1,
        isPublished: true,
        seriesId: createdSeriesId,
      };

      const response = await request(app.getHttpServer())
        .post('/episodes')
        .send(createEpisodeDto)
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Test Episode Integration',
        videoUrl: 'https://example.com/video.mp4',
        duration: 3600,
        episodeNumber: 1,
        seasonNumber: 1,
        isPublished: true,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.series).toBeDefined();
      expect(response.body.series.id).toBe(createdSeriesId);
      expect(response.body.createdAt).toBeDefined();

      createdEpisodeId = response.body.id;
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        description: 'Missing required fields',
      };

      await request(app.getHttpServer())
        .post('/episodes')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate URL format', async () => {
      const invalidDto = {
        title: 'Test Episode',
        videoUrl: 'not-a-valid-url',
        episodeNumber: 1,
        seriesId: createdSeriesId,
      };

      await request(app.getHttpServer())
        .post('/episodes')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with non-existent series', async () => {
      const invalidDto = {
        title: 'Test Episode',
        videoUrl: 'https://example.com/video.mp4',
        episodeNumber: 1,
        seriesId: 999999, // Non-existent series
      };

      await request(app.getHttpServer())
        .post('/episodes')
        .send(invalidDto)
        .expect(500); // Should fail due to foreign key constraint
    });
  });

  describe('GET /episodes', () => {
    it('should return all episodes', async () => {
      const response = await request(app.getHttpServer())
        .get('/episodes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('series');
      expect(response.body[0].series).toHaveProperty('id');
      expect(response.body[0].series).toHaveProperty('title');
    });
  });

  describe('GET /episodes/:id', () => {
    it('should return a specific episode', async () => {
      const response = await request(app.getHttpServer())
        .get(`/episodes/${createdEpisodeId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdEpisodeId,
        title: 'Test Episode Integration',
        episodeNumber: 1,
        seasonNumber: 1,
      });
      expect(response.body.series).toBeDefined();
      expect(response.body.series.id).toBe(createdSeriesId);
    });

    it('should return 404 for non-existent episode', async () => {
      await request(app.getHttpServer())
        .get('/episodes/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
    });
  });

  describe('PATCH /episodes/:id', () => {
    it('should update an episode', async () => {
      const updateDto = {
        title: 'Updated Episode Title',
        description: 'Updated description',
        duration: 7200,
      };

      const response = await request(app.getHttpServer())
        .patch(`/episodes/${createdEpisodeId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdEpisodeId,
        title: 'Updated Episode Title',
        description: 'Updated description',
        duration: 7200,
      });
    });

    it('should return 404 when updating non-existent episode', async () => {
      await request(app.getHttpServer())
        .patch('/episodes/123e4567-e89b-12d3-a456-426614174000')
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('Series-Episode Relationship Tests', () => {
    it('should show episodes in series when fetching series', async () => {
      const response = await request(app.getHttpServer())
        .get(`/series/${createdSeriesId}`)
        .expect(200);

      expect(response.body.episodes).toBeDefined();
      expect(Array.isArray(response.body.episodes)).toBe(true);
      expect(response.body.episodes.length).toBeGreaterThan(0);
      expect(response.body.episodes[0].id).toBe(createdEpisodeId);
    });

    it('should create multiple episodes for the same series', async () => {
      const episode2Dto = {
        title: 'Second Episode',
        videoUrl: 'https://example.com/video2.mp4',
        episodeNumber: 2,
        seasonNumber: 1,
        seriesId: createdSeriesId,
      };

      const response = await request(app.getHttpServer())
        .post('/episodes')
        .send(episode2Dto)
        .expect(201);

      expect(response.body.series.id).toBe(createdSeriesId);

      // Verify series now has 2 episodes
      const seriesResponse = await request(app.getHttpServer())
        .get(`/series/${createdSeriesId}`)
        .expect(200);

      expect(seriesResponse.body.episodes.length).toBe(2);
    });
  });

  describe('DELETE /episodes/:id', () => {
    it('should delete an episode', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/episodes/${createdEpisodeId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        deleted: true,
        message: expect.stringContaining('Updated Episode Title'),
      });

      // Verify episode is actually deleted
      await request(app.getHttpServer())
        .get(`/episodes/${createdEpisodeId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent episode', async () => {
      await request(app.getHttpServer())
        .delete('/episodes/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
    });
  });
});
