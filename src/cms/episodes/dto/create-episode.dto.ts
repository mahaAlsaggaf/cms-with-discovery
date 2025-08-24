import { IsString, IsOptional, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEpisodeDto {
  @ApiProperty({
    description: 'Episode title',
    example: 'Introduction to TypeScript'
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Episode description',
    example: 'Learn the basics of TypeScript in this comprehensive episode'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Video URL for the episode',
    example: 'https://example.com/videos/episode1.mp4'
  })
  @IsNotEmpty()
  @IsUrl()
  videoUrl: string;

  @ApiPropertyOptional({
    description: 'Thumbnail image URL',
    example: 'https://example.com/thumbnails/episode1.jpg'
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Episode duration in seconds',
    example: 1800
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration?: number;

  @ApiProperty({
    description: 'Episode number within the series',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  episodeNumber: number;

  @ApiPropertyOptional({
    description: 'Season number (optional)',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  seasonNumber?: number;

  @ApiPropertyOptional({
    description: 'Whether the episode is published',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Publication date and time',
    example: '2024-08-25T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @ApiProperty({
    description: 'ID of the series this episode belongs to',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  seriesId: number;
}
