import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { Series } from '../cms/series/entities/series.entity';
import { Episode } from '../cms/episodes/entities/episode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Series, Episode]),
    CacheModule.register({
      ttl: 300000, // 5 minutes in milliseconds
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
