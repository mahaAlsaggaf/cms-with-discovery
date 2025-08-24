import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeUpdate } from 'typeorm';
import { Episode } from '../../episodes/entities/episode.entity';

@Entity('series')
export class Series {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({default: ''})
  description: string;

  @Column({
    type: 'enum',
    enum: ['podcast', 'documentary']
  })
  type: 'podcast' | 'documentary';

  @Column({default: ''})
  thumbnailUrl: string;

  @Column()
  category: string;

  @Column({
    type: 'enum',
    enum: ['ar', 'en']
  })
  language: 'ar' | 'en';

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @Column({default: false})
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  datePublished: Date;

  @OneToMany(() => Episode, episode => episode.series, {eager: true})
  episodes: Episode[];
}
