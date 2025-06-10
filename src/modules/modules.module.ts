import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from '../database/database.config';
import { TypeEventModule } from './type-event/type-event.module';
import { OrganizationModule } from './organization/organization.module';
import { UbicationModule } from './ubication/ubication.module';
import { EventModule } from './event/event.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeEventModule,
    OrganizationModule,
    UbicationModule,
    EventModule,
    FilesModule,
    AuthModule,
  ],
  exports: [TypeOrmModule],
})
export class ModulesModule {}
