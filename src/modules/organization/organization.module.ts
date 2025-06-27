import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entity/organization.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [OrganizationService],
  controllers: [OrganizationController],
  imports: [TypeOrmModule.forFeature([Organization]), AuthModule],
  exports: [OrganizationService, TypeOrmModule],
})
export class OrganizationModule {}
