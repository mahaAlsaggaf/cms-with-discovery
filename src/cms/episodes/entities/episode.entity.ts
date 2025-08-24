import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeUpdate } from 'typeorm';
import { Series } from '../../series/entities/series.entity';

@Entity('episode')
export class Episode {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({default: ''})
  description: string;

  @Column()
  videoUrl: string;

  @Column({default: ''})
  thumbnailUrl: string;

  @Column({default: 0})
  duration: number; // in seconds

  @Column()
  episodeNumber: number;

  @Column({nullable: true})
  seasonNumber: number;

  @Column({default: false})
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @ManyToOne(() => Series, series => series.episodes)
  series: Series;
}
