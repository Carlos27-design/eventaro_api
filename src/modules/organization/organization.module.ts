import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entity/organization.entity';

@Module({
  providers: [OrganizationService],
  controllers: [OrganizationController],
  imports: [TypeOrmModule.forFeature([Organization])],
  exports: [OrganizationService, TypeOrmModule],
})
export class OrganizationModule {}
