import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Thmanyah CMS & Discovery API')
  .setDescription(
    'Content Management System with Discovery endpoints for Series (Podcasts/Documentaries) and Episodes (Videos). ' +
    'Features include CRUD operations for content management, advanced search and filtering, caching for optimal performance, ' +
    'and comprehensive content discovery capabilities.'
  )
  .setVersion('1.0')
  .setContact('Thmanyah Team', 'https://github.com/mahaAlsaggaf/cms-with-discovery', 'support@thmanyah.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:3000', 'Development server')
  .addTag('discovery', 'Content discovery and search endpoints with intelligent caching')
  .addTag('series', 'Series management - Podcasts and Documentaries CRUD operations')
  .addTag('episodes', 'Episodes management - Video content CRUD operations')
  .build();

export function setupSwagger(app: INestApplication): void {
  // Only setup Swagger in development/staging environments
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
    });
    
    console.log('📚 Swagger documentation available at: http://localhost:3000/api');
  }
}
