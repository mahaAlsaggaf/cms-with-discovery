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
  ) { }

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
      relations: { series: true },
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

  // Search functionality matching Thmanyah API pattern
  async search(params: {
    query: string;
    from: number;
    size: number;
    type: string;
  }): Promise<{
    episodes: Episode[];
    total: number;
    from: number;
    size: number;
  }> {
    const { query, from, size, type } = params;

    // Build search query
    const queryBuilder = this.episodeRepository
      .createQueryBuilder('episode')
      .leftJoinAndSelect('episode.series', 'series');

    // Add text search if query provided
    if (query && query.trim()) {
      queryBuilder.where(
        '(episode.title ILIKE :query OR episode.description ILIKE :query OR series.title ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    // Filter by type if specified
    if (type && type !== 'episode') {
      // If searching for series, we might want to filter by series type
      queryBuilder.andWhere('series.type = :seriesType', { seriesType: type });
    }

    // Only show published content
    queryBuilder.andWhere('episode.isPublished = :published', { published: true });

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const episodes = await queryBuilder
      .orderBy('episode.publishedAt', 'DESC')
      .skip(from)
      .take(size)
      .getMany();

    return {
      episodes,
      total,
      from,
      size,
    };
  }
}
