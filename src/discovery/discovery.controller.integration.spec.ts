import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from './discovery.module';
import { CmsModule } from '../cms/cms.module';
import { Series } from '../cms/series/entities/series.entity';
import { Episode } from '../cms/episodes/entities/episode.entity';
import databaseConfig from '../config/database.config';

describe('DiscoveryController (Integration)', () => {
  let app: INestApplication;
  let createdSeriesId: number;
  let createdEpisodeId: number;

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
        DiscoveryModule,
        CmsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();

    // Create test data
    await createTestData();
  });

  afterAll(async () => {
    await app.close();
  });

  async function createTestData() {
    // Create a test series
    const seriesResponse = await request(app.getHttpServer())
      .post('/series')
      .send({
        title: 'Tech Talk Podcast',
        description: 'A podcast about technology and innovation',
        type: 'podcast',
        category: 'Technology',
        language: 'en',
        isPublished: true,
        thumbnailUrl: 'https://example.com/tech-podcast.jpg',
      });

    createdSeriesId = seriesResponse.body.id;

    // Create a test episode
    const episodeResponse = await request(app.getHttpServer())
      .post('/episodes')
      .send({
        title: 'AI and Machine Learning Trends',
        description: 'Discussion about the latest trends in AI and ML',
        videoUrl: 'https://example.com/ai-episode.mp4',
        thumbnailUrl: 'https://example.com/ai-thumb.jpg',
        duration: 3600,
        isPublished: true,
        seriesId: createdSeriesId,
      });

    createdEpisodeId = episodeResponse.body.id;

    // Create another series for documentary
    await request(app.getHttpServer())
      .post('/series')
      .send({
        title: 'Nature Documentary Series',
        description: 'Exploring the wonders of nature',
        type: 'documentary',
        category: 'Science',
        language: 'en',
        isPublished: true,
        thumbnailUrl: 'https://example.com/nature-doc.jpg',
      });
  }

  describe('/discovery/search (GET)', () => {
    it('should perform universal search without query', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/search')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search with query parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/search?query=tech')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });

    it('should apply pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/search?from=0&size=1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });

    it('should filter by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/search?type=podcast')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      
      // All series should be podcasts
      response.body.data.forEach((series: any) => {
        expect(series.type).toBe('podcast');
      });
    });
  });

  describe('/discovery/episodes/search (GET)', () => {
    it('should search episodes', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/episodes/search')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search episodes with query', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/episodes/search?query=AI')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should filter episodes by series type', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/episodes/search?type=podcast')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      
      // All episodes should belong to podcast series
      response.body.data.forEach((episode: any) => {
        expect(episode.series.type).toBe('podcast');
      });
    });
  });

  describe('/discovery/series/search (GET)', () => {
    it('should search series', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/series/search')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search series with query', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/series/search?query=tech')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should filter series by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/series/search?type=documentary')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      
      // All series should be documentaries
      response.body.data.forEach((series: any) => {
        expect(series.type).toBe('documentary');
      });
    });
  });

  describe('/discovery/featured (GET)', () => {
    it('should get featured content', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/featured')
        .expect(200);

      expect(response.body).toHaveProperty('featuredSeries');
      expect(response.body).toHaveProperty('recentEpisodes');
      expect(Array.isArray(response.body.featuredSeries)).toBe(true);
      expect(Array.isArray(response.body.recentEpisodes)).toBe(true);
    });

    it('should get featured content filtered by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/featured?type=podcast')
        .expect(200);

      expect(response.body).toHaveProperty('featuredSeries');
      expect(response.body).toHaveProperty('recentEpisodes');
      
      // All featured series should be podcasts
      response.body.featuredSeries.forEach((series: any) => {
        expect(series.type).toBe('podcast');
      });
    });
  });

  describe('/discovery/categories (GET)', () => {
    it('should get available categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/categories')
        .expect(200);

      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
      expect(response.body.categories).toContain('Technology');
      expect(response.body.categories).toContain('Science');
    });
  });

  describe('/discovery/episodes/recent (GET)', () => {
    it('should get recent episodes', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/episodes/recent')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should limit recent episodes by size', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/episodes/recent?size=1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });

    it('should filter recent episodes by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/episodes/recent?type=podcast')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      
      // All episodes should belong to podcast series
      response.body.data.forEach((episode: any) => {
        expect(episode.series.type).toBe('podcast');
      });
    });
  });

  describe('/discovery/series/by-type (GET)', () => {
    it('should get series by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/series/by-type?type=podcast')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All series should be podcasts
      response.body.data.forEach((series: any) => {
        expect(series.type).toBe('podcast');
      });
    });

    it('should get documentary series', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/series/by-type?type=documentary')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      
      // All series should be documentaries
      response.body.data.forEach((series: any) => {
        expect(series.type).toBe('documentary');
      });
    });

    it('should apply pagination to series by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/series/by-type?type=podcast&from=0&size=1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/search?from=invalid&size=invalid')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('total');
    });

    it('should handle missing required type parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/discovery/series/by-type')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });
  });
});
