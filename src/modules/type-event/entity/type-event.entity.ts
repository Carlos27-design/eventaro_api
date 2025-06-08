import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity } from 'typeorm';

@Entity('type_event')
export class TypeEvent extends StandardEntity {
  @Column('varchar', { nullable: false, unique: true })
  name: string;
}
