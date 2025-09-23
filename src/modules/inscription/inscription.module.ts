import { Module } from '@nestjs/common';
import { InscriptionController } from './inscription.controller';
import { InscriptionService } from './inscription.service';
import { AuthModule } from '../auth/auth.module';
import { Inscription } from './entity/inscription.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventModule } from '../event/event.module';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [InscriptionController],
  providers: [InscriptionService],
  imports: [
    TypeOrmModule.forFeature([Inscription]),
    AuthModule,
    EventModule,
    MailModule,
  ],
  exports: [InscriptionService, TypeOrmModule],
})
export class InscriptionModule {}
