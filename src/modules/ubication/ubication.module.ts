import { Module } from '@nestjs/common';
import { UbicationService } from './ubication.service';
import { Ubication } from './entity/ubication.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [UbicationService],
  imports: [TypeOrmModule.forFeature([Ubication])],
  exports: [UbicationService, TypeOrmModule],
})
export class UbicationModule {}
