import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateSeriesDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['podcast', 'documentary'])
  type: 'podcast' | 'documentary';

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsEnum(['ar', 'en'])
  language: 'ar' | 'en';

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsDateString()
  datePublished?: Date;
}
