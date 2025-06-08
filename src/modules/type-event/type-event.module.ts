import { Module } from '@nestjs/common';
import { TypeEventController } from './type-event.controller';
import { TypeEventService } from './type-event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeEvent } from './entity/type-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeEvent])],
  controllers: [TypeEventController],
  providers: [TypeEventService],
  exports: [TypeEventService, TypeOrmModule],
})
export class TypeEventModule {}
