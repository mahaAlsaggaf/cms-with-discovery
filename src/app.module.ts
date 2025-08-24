import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeriesModule } from './series/series.module';
import { EpisodesModule } from './episodes/episodes.module';

@Module({
  imports: [SeriesModule, EpisodesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
