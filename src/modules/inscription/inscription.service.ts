import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inscription } from './entity/inscription.entity';
import { Repository } from 'typeorm';
import { EventService } from '../event/event.service';
import { CreateInscriptionDto } from './dtos/create-inscription.dto';
import { User } from '../auth/entity/user.entity';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';
import { UpdateInscriptionDto } from './dtos/update-inscription.dto';
import { statusInscription } from 'src/shared/status-inscription.enum';
import { MailService } from '../mail/mail.service';
import { status } from 'src/shared/status.enum';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class InscriptionService {
  constructor(
    @InjectRepository(Inscription)
    private readonly inscriptionRepository: Repository<Inscription>,

    private readonly _eventService: EventService,

    private readonly _authService: AuthService,

    private readonly _mailService: MailService,
  ) {}

  public async create(createInscriptionDto: CreateInscriptionDto, user: User) {
    try {
      const { userId, eventId, dateInscription } = createInscriptionDto;

      const now = moment();

      const expiresAt = now.add(1, 'day').toDate();

      const event = await this._eventService.findOne(eventId);

      if (!event) throw new BadRequestException('Event not found');

      if (user.id === userId) throw new BadRequestException('User not found');

      const inscription = this.inscriptionRepository.create({
        dateInscription: moment(dateInscription).format('DD/MM/YYYY'),
        token: uuid(),
        tokenExpiresAt: expiresAt,
        user: { id: userId },
        event: { id: eventId },
      });

      await this.inscriptionRepository.save(inscription);

      const targetUser = await this._authService.getOne(userId);

      await this._mailService.sendMail({
        to: targetUser.email,
        subject: `Confirmación de inscription al evento ${event.name}`,
        html: `
        <h1>Confirmación de inscription al evento ${event.name}</h1>
        <p>Estimado/a ${targetUser.fullName}</p>
        <p>Te has inscrito correctamente en el evento: <strong>${event.name}</strong>.</p>
        <p>El evento se llevara a cabo el <strong>${moment(event.initialDate).format('DD/MM/YYYY')}</strong></p>
        <p>Gracias por participar</p>
        `,
      });
    } catch (error) {
      this.handleDBError(error);
    }
  }

  public async findAll() {
    const queryBuilder =
      this.inscriptionRepository.createQueryBuilder('inscription');

    const inscriptions = await queryBuilder
      .leftJoinAndSelect('inscription.user', 'user')
      .leftJoinAndSelect('inscription.event', 'event')
      .where('inscription.status = :status', {
        status: status.ACTIVE,
      })
      .getMany();

    if (!inscriptions) throw new BadRequestException('Inscriptions not found');

    return inscriptions;
  }

  public async findOne(id: string) {
    const queryBuilder =
      this.inscriptionRepository.createQueryBuilder('inscription');

    const inscription = await queryBuilder
      .leftJoinAndSelect('inscription.user', 'user')
      .leftJoinAndSelect('inscription.event', 'event')
      .where('inscription.id = :id', { id: id })
      .andWhere('inscription.status = :status', {
        status: status.ACTIVE,
      })
      .getOne();

    if (!inscription) throw new BadRequestException('Inscription not found');

    return inscription;
  }

  public async update(id: string, updateInscriptionDto: UpdateInscriptionDto) {
    const { token } = updateInscriptionDto;

    const inscription = await this.findOne(id);

    if (!inscription.token || inscription.token !== token)
      throw new BadRequestException('token not valid');

    const now = moment();
    const expiresAt = moment(inscription.tokenExpiresAt);

    if (now.isAfter(expiresAt)) {
      throw new BadRequestException('token expired');
    }

    inscription.statusInscription = statusInscription.ACEPTADA;
    inscription.token = null;
    inscription.tokenExpiresAt = null;

    try {
      await this.inscriptionRepository.save(inscription);

      const user = await this._authService.getOne(inscription.user.id);

      const event = await this._eventService.findOne(inscription.event.id);

      await this._mailService.sendMail({
        to: user.email,
        subject: `Confirmación de inscripción al evento ${event.name}`,
        html: `
          <h1>Confirmación de inscripción al evento ${event.name}</h1>
          <p>Hola ${user.fullName}</p>
          <p>Tu incripción al evento <strong>${event.name}</strong> ha sido aceptada</p>
          <p>Gracias por participar</p>
        `,
      });
    } catch (error) {
      this.handleDBError(error);
    }
  }

  public async remove(id: string) {
    const inscription = await this.findOne(id);
    const event = await this._eventService.findOne(inscription.event.id);

    if (!inscription) throw new BadRequestException('Inscription not found');

    if (
      moment(event.initialDate).format('DD/MM/YYYY') >
      moment(event.finalDate).format('DD/MM/YYYY')
    ) {
      inscription.statusInscription = statusInscription.RECHAZADA;
    }

    inscription.status = status.INACTIVE;

    try {
      await this.inscriptionRepository.save(inscription);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  private handleDBError(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
