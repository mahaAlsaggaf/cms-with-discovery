import { IsString, IsOptional, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEpisodeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUrl()
  videoUrl: string;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration?: number; // in seconds

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  episodeNumber: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  seasonNumber?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  // Series relationship - we'll pass the series ID
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  seriesId: number;
}
