import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entity/event.entity';
import { ImageEvent } from './entity/image-event.entity';
import { OrganizationModule } from '../organization/organization.module';
import { TypeEventModule } from '../type-event/type-event.module';
import { UbicationModule } from '../ubication/ubication.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([Event, ImageEvent]),
    OrganizationModule,
    TypeEventModule,
    UbicationModule,
  ],
  exports: [EventService, TypeOrmModule],
})
export class EventModule {}
