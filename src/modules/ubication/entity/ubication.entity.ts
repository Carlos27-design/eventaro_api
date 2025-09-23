import { Event } from 'src/modules/event/entity/event.entity';
import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Ubication extends StandardEntity {
  @Column('varchar', { nullable: false })
  name: string;

  @Column('float', { nullable: false })
  latitude: number;

  @Column('float', { nullable: false })
  longitude: number;

  @OneToMany(() => Event, (event) => event.ubication)
  event: Event[];
}
