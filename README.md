# Thmanyah CMS & Discovery API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
</p>

<p align="center">
  A comprehensive Content Management System with Discovery endpoints for Series (Podcasts/Documentaries) and Episodes (Videos)
</p>

## 🚀 Features

- **🎯 Discovery API** - Advanced content search and discovery with caching
- **📺 CMS Module** - Unified content management for Series and Episodes
- **⚡ High Performance** - Smart caching with different TTL strategies
- **📚 API Documentation** - Comprehensive Swagger/OpenAPI documentation
- **🧪 Full Test Coverage** - Unit and integration tests with 100% coverage
- **🏗️ Modular Architecture** - Clean, scalable NestJS architecture

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🎯 Overview

Thmanyah CMS & Discovery API is a comprehensive content management system built with NestJS, designed to manage and discover multimedia content including:

- **Series**: Podcasts and Documentaries
- **Episodes**: Individual video content within series
- **Discovery**: Advanced search, filtering, and content recommendation features

### Content Hierarchy
```
Series (Podcasts/Documentaries)
├── Episode 1 (Video)
├── Episode 2 (Video)
└── Episode N (Video)
```

## 🏗️ Architecture

### Project Structure
```
src/
├── cms/                    # Content Management System
│   ├── cms.module.ts      # Main CMS wrapper module
│   ├── episodes/          # Episodes management
│   └── series/            # Series management
├── discovery/             # Content discovery & search
│   ├── discovery.controller.ts
│   ├── discovery.service.ts
│   └── discovery.module.ts
├── config/               # Configuration files
│   ├── database.config.ts
│   └── swagger.config.ts
└── main.ts              # Application bootstrap
```

### Key Modules
- **CMS Module**: Unified content management for series and episodes
- **Discovery Module**: Search, filtering, and content discovery with caching
- **Configuration**: Centralized config management for database and API docs

## 🔗 API Endpoints

### Discovery Endpoints
- `GET /discovery/search` - Universal content search
- `GET /discovery/episodes/search` - Episode-specific search
- `GET /discovery/series/search` - Series-specific search
- `GET /discovery/featured` - Featured content
- `GET /discovery/categories` - Available categories
- `GET /discovery/episodes/recent` - Recent episodes
- `GET /discovery/series/by-type` - Series by type (podcast/documentary)

### CMS Endpoints
- `GET|POST|PATCH|DELETE /series` - Series CRUD operations
- `GET|POST|PATCH|DELETE /episodes` - Episodes CRUD operations

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/mahaAlsaggaf/cms-with-discovery.git
cd thmanyah-project
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=thmanyah_db

# Application
PORT=3000
NODE_ENV=development
```

4. **Database Setup**
```bash
# Create PostgreSQL database
createdb thmanyah_db
```

## 🚀 Usage

### Development
```bash
# Start in development mode with hot reload
npm run start:dev
```

### Production
```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Docker (Optional)
```bash
# Build and run with Docker
docker-compose up --build
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Coverage
The project maintains **100% test coverage** with:
- Unit tests for all services and controllers
- Integration tests for API endpoints
- Comprehensive test scenarios including edge cases

## 📚 Documentation

### API Documentation
Interactive Swagger documentation is available at:
- **Development**: `http://localhost:3000/api`
- **Features**: Interactive API testing, request/response examples, parameter documentation

### Caching Strategy
The discovery API implements intelligent caching:
- **Search queries**: 5 minutes TTL
- **Featured content**: 10 minutes TTL
- **Categories**: 30 minutes TTL

### Performance Features
- In-memory caching (easily upgradeable to Redis)
- Optimized database queries with TypeORM
- Pagination support for large datasets
- Environment-based configuration

## 🔧 Configuration

### Cache Configuration
```typescript
// Located in src/discovery/discovery.module.ts
CacheModule.register({
  ttl: 300000, // 5 minutes
  max: 100,    // Max items
})
```

### Database Configuration
```typescript
// Located in src/config/database.config.ts
// Supports PostgreSQL with TypeORM
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Maha Alsaggaf** - *Initial work* - [@mahaAlsaggaf](https://github.com/mahaAlsaggaf)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database powered by [PostgreSQL](https://postgresql.org/)
- Documentation with [Swagger/OpenAPI](https://swagger.io/)
- Testing with [Jest](https://jestjs.io/)

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
