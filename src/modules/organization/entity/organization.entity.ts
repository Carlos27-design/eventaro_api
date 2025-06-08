import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Organization extends StandardEntity {
  @Column('varchar', { nullable: false, unique: true })
  name: string;

  @Column('varchar', { nullable: false })
  description: string;

  @Column('varchar', { nullable: false })
  email: string;
}
