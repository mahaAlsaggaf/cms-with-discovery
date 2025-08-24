import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { Episode } from './entities/episode.entity';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
  ) {}

  async create(createEpisodeDto: CreateEpisodeDto): Promise<Episode> {
    const { seriesId, ...episodeData } = createEpisodeDto;
    
    const episode = this.episodeRepository.create({
      ...episodeData,
      series: { id: seriesId } as any, // TypeORM will handle the relationship
    });
    
    return await this.episodeRepository.save(episode);
  }

  async findAll(): Promise<Episode[]> {
    return await this.episodeRepository.find({
      relations: ['series'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({
      where: { id },
      relations: ['series'],
    });
    
    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }
    
    return episode;
  }

  async update(id: string, updateEpisodeDto: UpdateEpisodeDto): Promise<Episode> {
    const episode = await this.findOne(id); // This will throw if not found
    
    // Update the episode with new data
    Object.assign(episode, updateEpisodeDto);
    
    return await this.episodeRepository.save(episode);
  }

  async remove(id: string): Promise<{ deleted: boolean; message: string }> {
    const episode = await this.findOne(id); // This will throw if not found
    
    await this.episodeRepository.remove(episode);
    
    return {
      deleted: true,
      message: `Episode '${episode.title}' has been deleted successfully`,
    };
  }

  // Additional useful methods
  async findBySeries(seriesId: number): Promise<Episode[]> {
    return await this.episodeRepository.find({
      where: { series: { id: seriesId } },
      relations: ['series'],
      order: { episodeNumber: 'ASC' },
    });
  }

  async findBySeasonAndSeries(seriesId: number, seasonNumber: number): Promise<Episode[]> {
    return await this.episodeRepository.find({
      where: { 
        series: { id: seriesId },
        seasonNumber: seasonNumber 
      },
      relations: ['series'],
      order: { episodeNumber: 'ASC' },
    });
  }

  async findPublished(): Promise<Episode[]> {
    return await this.episodeRepository.find({
      where: { isPublished: true },
      relations: ['series'],
      order: { publishedAt: 'DESC' },
    });
  }
}
