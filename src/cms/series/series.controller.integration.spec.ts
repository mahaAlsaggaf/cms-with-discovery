import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeriesModule } from './series.module';
import { EpisodesModule } from '../episodes/episodes.module';
import { Series } from './entities/series.entity';
import { Episode } from '../episodes/entities/episode.entity';
import databaseConfig from '../../config/database.config';

describe('SeriesController (Integration)', () => {
  let app: INestApplication;
  let createdSeriesId: number;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /series', () => {
    it('should create a new series', async () => {
      const createSeriesDto = {
        title: 'Test Podcast Integration',
        description: 'A test podcast for integration testing',
        type: 'podcast',
        category: 'Technology',
        language: 'en',
        isPublished: true,
      };

      const response = await request(app.getHttpServer())
        .post('/series')
        .send(createSeriesDto)
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Test Podcast Integration',
        type: 'podcast',
        category: 'Technology',
        language: 'en',
        isPublished: true,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      createdSeriesId = response.body.id;
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        description: 'Missing required fields',
      };

      await request(app.getHttpServer())
        .post('/series')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate enum values', async () => {
      const invalidDto = {
        title: 'Test Series',
        type: 'invalid-type', // Should be 'podcast' or 'documentary'
        category: 'Technology',
        language: 'en',
      };

      await request(app.getHttpServer())
        .post('/series')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /series', () => {
    it('should return all series', async () => {
      const response = await request(app.getHttpServer())
        .get('/series')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('episodes');
    });
  });

  describe('GET /series/:id', () => {
    it('should return a specific series', async () => {
      const response = await request(app.getHttpServer())
        .get(`/series/${createdSeriesId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdSeriesId,
        title: 'Test Podcast Integration',
        type: 'podcast',
      });
      expect(response.body.episodes).toBeDefined();
    });

    it('should return 404 for non-existent series', async () => {
      await request(app.getHttpServer())
        .get('/series/999999')
        .expect(404);
    });
  });

  describe('PATCH /series/:id', () => {
    it('should update a series', async () => {
      const updateDto = {
        title: 'Updated Podcast Title',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/series/${createdSeriesId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdSeriesId,
        title: 'Updated Podcast Title',
        description: 'Updated description',
      });
    });

    it('should return 404 when updating non-existent series', async () => {
      await request(app.getHttpServer())
        .patch('/series/999999')
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /series/:id', () => {
    it('should delete a series', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/series/${createdSeriesId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        deleted: true,
        message: expect.stringContaining('Updated Podcast Title'),
      });

      // Verify series is actually deleted
      await request(app.getHttpServer())
        .get(`/series/${createdSeriesId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent series', async () => {
      await request(app.getHttpServer())
        .delete('/series/999999')
        .expect(404);
    });
  });
});
