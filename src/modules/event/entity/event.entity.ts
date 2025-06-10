import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ImageEvent } from './image-event.entity';
import { Ubication } from 'src/modules/ubication/entity/ubication.entity';
import { TypeEvent } from 'src/modules/type-event/entity/type-event.entity';
import { Organization } from 'src/modules/organization/entity/organization.entity';

@Entity()
export class Event extends StandardEntity {
  @Column('varchar', { nullable: false, unique: true })
  name: string;

  @Column('varchar', { nullable: false })
  description: string;

  @Column('date', { nullable: false })
  initialDate: Date;

  @Column('date', { nullable: false })
  finalDate: Date;

  @Column('varchar', { nullable: false, default: 'CREADO', length: 8 })
  statusEvent: string;

  @OneToMany(() => ImageEvent, (imageEvent) => imageEvent.event, {
    cascade: true,
  })
  images?: ImageEvent[];

  @ManyToOne(() => Ubication, (ubication) => ubication.event)
  ubication: Ubication;

  @ManyToOne(() => TypeEvent, (typeEvent) => typeEvent.event)
  typeEvent: TypeEvent;

  @ManyToOne(() => Organization, (organization) => organization.event)
  organization: Organization;
}
