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
import { statusInscription } from 'src/shared/status-inscription.enum';
import { MailService } from '../mail/mail.service';
import { status } from 'src/shared/status.enum';
import { AuthService } from '../auth/auth.service';
import { UpdateInscriptionDto } from './dtos/update-inscription.dto';

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
      const { eventId, dateInscription } = createInscriptionDto;

      const event = await this._eventService.findOne(eventId);

      if (!event) throw new BadRequestException('Event not found');

      if (!user.id) throw new BadRequestException('User not found');

      const eventDate = moment(event.initialDate).startOf('day');
      const inscriptionDate = moment(dateInscription).startOf('day');

      if (eventDate.isSame(inscriptionDate)) {
        throw new BadRequestException('No se que inicia el mismo día');
      }

      const existingInscriptions = await this.findInscripitionsPerUser(user);

      const alreadyRegistered = existingInscriptions.some((insc) =>
        moment(insc.event.initialDate).startOf('day').isSame(eventDate),
      );

      if (alreadyRegistered) {
        throw new BadRequestException(
          'Ya esta inscrito en un evento que inicia el mismo dia',
        );
      }

      const expiresAt = moment(event.initialDate).endOf('day').toDate();

      const inscription = this.inscriptionRepository.create({
        dateInscription: moment(dateInscription).format('YYYY-MM-DD'),
        token: uuid(),
        tokenExpiresAt: expiresAt,
        user: { id: user.id },
        event: { id: eventId },
      });

      await this.inscriptionRepository.save(inscription);

      const targetUser = await this._authService.getUserById(user.id);

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
      if (error instanceof BadRequestException) {
        throw error;
      }

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

    await Promise.all(
      inscriptions.map(async (inscription) => {
        if (
          inscription.tokenExpiresAt &&
          inscription.tokenExpiresAt > inscription.event!.initialDate
        ) {
          inscription.tokenExpiresAt = null;
          inscription.token = null;
          inscription.statusInscription = statusInscription.RECHAZADA;

          await this.update(inscription.id, inscription);
        }
      }),
    );

    return inscriptions;
  }

  private async findInscripitionsPerUser(user: User) {
    const queryBuilder =
      this.inscriptionRepository.createQueryBuilder('inscription');

    const inscriptions = await queryBuilder
      .leftJoinAndSelect('inscription.user', 'user')
      .leftJoinAndSelect('inscription.event', 'event')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('inscription.status = :status', {
        status: status.ACTIVE,
      })
      .getMany();

    if (!inscriptions) throw new BadRequestException('Inscriptions not found');

    return inscriptions;
  }

  public async findExistInscription(
    user: User,
    eventId: string,
  ): Promise<boolean> {
    return await this.inscriptionRepository.existsBy({
      user: { id: user.id },
      event: { id: eventId },
    });
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

  public async update(id: string, inscription: Inscription) {
    inscription = await this.findOne(id);

    if (!inscription) throw new BadRequestException('Inscription not found');

    try {
      await this.inscriptionRepository.update(id, inscription);
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
      error,
    );
  }
}
