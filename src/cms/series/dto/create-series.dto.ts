import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSeriesDto {
  @ApiProperty({
    description: 'Series title',
    example: 'تاريخ الحضارات'
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Series description',
    example: 'سلسلة وثائقية تستكشف تاريخ الحضارات القديمة'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of series',
    enum: ['podcast', 'documentary'],
    example: 'documentary'
  })
  @IsEnum(['podcast', 'documentary'])
  type: 'podcast' | 'documentary';

  @ApiPropertyOptional({
    description: 'Thumbnail image URL',
    example: 'https://example.com/thumbnails/series1.jpg'
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Series category',
    example: 'تاريخ'
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Content language',
    enum: ['ar', 'en'],
    example: 'ar'
  })
  @IsEnum(['ar', 'en'])
  language: 'ar' | 'en';

  @ApiPropertyOptional({
    description: 'Whether the series is published',
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
  datePublished?: Date;
}
