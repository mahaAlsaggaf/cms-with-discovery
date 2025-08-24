import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { Series } from '../cms/series/entities/series.entity';
import { Episode } from '../cms/episodes/entities/episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Series, Episode])],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
