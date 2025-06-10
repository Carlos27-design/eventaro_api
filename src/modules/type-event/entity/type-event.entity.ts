import { Event } from 'src/modules/event/entity/event.entity';
import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('type_event')
export class TypeEvent extends StandardEntity {
  @Column('varchar', { nullable: false, unique: true })
  name: string;

  @OneToMany(() => Event, (event) => event.typeEvent)
  event: Event[];
}
