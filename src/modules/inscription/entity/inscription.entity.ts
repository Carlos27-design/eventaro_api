import { User } from 'src/modules/auth/entity/user.entity';
import { Event } from 'src/modules/event/entity/event.entity';
import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Inscription extends StandardEntity {
  @Column('date', { nullable: false })
  dateInscription: Date;

  @Column('varchar', { nullable: false, default: 'PENDIENTE', length: 30 })
  statusInscription: string;

  @Column('varchar', { nullable: false })
  token: string;

  @Column('timestamp', { nullable: true })
  tokenExpiresAt: Date;

  @ManyToOne(() => Event, (event) => event.inscription)
  event: Event;

  @ManyToOne(() => User, (user) => user.inscripition)
  user: User;
}
