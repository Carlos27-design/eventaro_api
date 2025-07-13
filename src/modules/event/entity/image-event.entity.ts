import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class ImageEvent extends StandardEntity {
  @Column('varchar', { nullable: false })
  url: string;

  @ManyToOne(() => Event, (event) => event.images)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
