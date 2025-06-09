import { StandardEntity } from "src/modules/standard.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Ubication extends StandardEntity {
    @Column("varchar", { nullable: false })
    name: string;

    @Column("float", { nullable: false })
    latitude: number;

    @Column("float", { nullable: false })
    longitude: number;
}