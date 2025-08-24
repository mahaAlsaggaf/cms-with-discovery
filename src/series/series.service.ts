import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { Series } from './entities/series.entity';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private seriesRepository: Repository<Series>,
  ) {}

  async create(createSeriesDto: CreateSeriesDto): Promise<Series> {
    const series = this.seriesRepository.create(createSeriesDto);
    return await this.seriesRepository.save(series);
  }

  async findAll(): Promise<Series[]> {
    return await this.seriesRepository.find({
      relations: ['episodes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Series> {
    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: ['episodes'],
    });
    
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    
    return series;
  }

  async update(id: number, updateSeriesDto: UpdateSeriesDto): Promise<Series> {
    const series = await this.findOne(id); // This will throw if not found
    
    // Update the series with new data
    Object.assign(series, updateSeriesDto);
    
    return await this.seriesRepository.save(series);
  }

  async remove(id: number): Promise<{ deleted: boolean; message: string }> {
    const series = await this.findOne(id); // This will throw if not found
    
    await this.seriesRepository.remove(series);
    
    return {
      deleted: true,
      message: `Series '${series.title}' has been deleted successfully`,
    };
  }

  // Additional useful methods
  async findByType(type: 'podcast' | 'documentary'): Promise<Series[]> {
    return await this.seriesRepository.find({
      where: { type },
      relations: ['episodes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublished(): Promise<Series[]> {
    return await this.seriesRepository.find({
      where: { isPublished: true },
      relations: ['episodes'],
      order: { datePublished: 'DESC' },
    });
  }

  // Search functionality matching Thmanyah API pattern
  async search(params: {
    query: string;
    from: number;
    size: number;
    type: string;
  }): Promise<{
    series: Series[];
    total: number;
    from: number;
    size: number;
  }> {
    const { query, from, size, type } = params;

    // Build search query
    const queryBuilder = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.episodes', 'episodes');

    // Add text search if query provided
    if (query && query.trim()) {
      queryBuilder.where(
        '(series.title ILIKE :query OR series.description ILIKE :query OR series.category ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    // Filter by type if specified (podcast/documentary)
    if (type && type !== 'series') {
      queryBuilder.andWhere('series.type = :seriesType', { seriesType: type });
    }

    // Only show published content
    queryBuilder.andWhere('series.isPublished = :published', { published: true });

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const series = await queryBuilder
      .orderBy('series.datePublished', 'DESC')
      .skip(from)
      .take(size)
      .getMany();

    return {
      series,
      total,
      from,
      size,
    };
  }
}
