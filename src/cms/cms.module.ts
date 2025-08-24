import { Module } from '@nestjs/common';
import { EpisodesModule } from './episodes/episodes.module';
import { SeriesModule } from './series/series.module';

@Module({
  imports: [EpisodesModule, SeriesModule],
  exports: [EpisodesModule, SeriesModule],
})
export class CmsModule {}
