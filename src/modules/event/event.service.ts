import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entity/event.entity';
import { DataSource, Repository } from 'typeorm';
import { ImageEvent } from './entity/image-event.entity';
import { UbicationService } from '../ubication/ubication.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { OrganizationService } from '../organization/organization.service';
import { TypeEventService } from '../type-event/type-event.service';
import { status } from 'src/shared/status.enum';
import { validate as isUUID } from 'uuid';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Ubication } from '../ubication/entity/ubication.entity';
import { statusEvent } from 'src/shared/status-event.enum';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(ImageEvent)
    private readonly imageEventRepository: Repository<ImageEvent>,

    private readonly _ubicationService: UbicationService,

    private readonly _organizationService: OrganizationService,

    private readonly _typeEventService: TypeEventService,

    private readonly _dataSource: DataSource,
  ) {}

  public async create(createEventDto: CreateEventDto) {
    const {
      images = [],
      ubication,
      organizationId,
      typeEventId,
      ...event
    } = createEventDto;

    try {
      const ubicationCreated = await this._ubicationService.create(ubication);

      const organization =
        await this._organizationService.findOne(organizationId);

      const typeEvent = await this._typeEventService.findOne(typeEventId);

      if (organization.id === organizationId && typeEvent.id === typeEventId) {
        const eventCreated = this.eventRepository.create({
          ...event,
          ubication: ubicationCreated,
          organization: { id: organizationId },
          typeEvent: { id: typeEventId },
        });

        const imagesCreated = images.map((image) =>
          this.imageEventRepository.create(image),
        );

        eventCreated.images = imagesCreated;

        return await this.eventRepository.save(eventCreated);
      } else {
        throw new BadRequestException('Organization or type event not found');
      }
    } catch (error) {
      this.handleDBError(error);
    }
  }

  public async findAll() {
    const queryBuilder = this.eventRepository.createQueryBuilder('event');

    const events = await queryBuilder
      .leftJoinAndSelect('event.organization', 'organization')
      .leftJoinAndSelect('event.typeEvent', 'typeEvent')
      .leftJoinAndSelect('event.ubication', 'ubication')
      .leftJoinAndSelect('event.images', 'images')
      .where('event.status = :status', { status: status.ACTIVE })
      .getMany();

    if (!events) throw new BadRequestException('Events not found');

    return events;
  }

  public async findOne(term: string) {
    let event: Event;
    const queryBuilder = this.eventRepository.createQueryBuilder('event');

    if (isUUID(term)) {
      event = await queryBuilder
        .leftJoinAndSelect('event.organization', 'organization')
        .leftJoinAndSelect('event.typeEvent', 'typeEvent')
        .leftJoinAndSelect('event.ubication', 'ubication')
        .leftJoinAndSelect('event.images', 'images')
        .where('event.id = :id', { id: term })
        .andWhere('event.status = :status', { status: status.ACTIVE })
        .getOne();
    } else {
      event = await queryBuilder
        .leftJoinAndSelect('event.organization', 'organization')
        .leftJoinAndSelect('event.typeEvent', 'typeEvent')
        .leftJoinAndSelect('event.ubication', 'ubication')
        .leftJoinAndSelect('event.images', 'images')
        .where('event.name = :name', { name: term })
        .andWhere('event.status = :status', { status: status.ACTIVE })
        .getOne();
    }

    if (!event) throw new BadRequestException(`Event not ${term} not found`);

    return event;
  }

  public async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id);

    if (!event) throw new BadRequestException(`Event not ${id} not found`);

    const { images, ubication, ...toUpdate } = updateEventDto;

    const eventUpdated = await this.eventRepository.preload({
      id,
      ...toUpdate,
    });

    if (!eventUpdated)
      throw new BadRequestException(`Event not ${id} not found`);

    const queryRunner = this._dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ImageEvent, {
          event: { id },
        });

        eventUpdated.images = images.map((image) =>
          this.imageEventRepository.create({ url: image.url }),
        );
      }

      if (ubication) {
        await queryRunner.manager.delete(Ubication, {
          event: { id },
        });

        eventUpdated.ubication = await this._ubicationService.create(ubication);
      }

      await queryRunner.manager.save(eventUpdated);

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBError(error);
    }

    return eventUpdated;
  }

  public async remove(id: string) {
    const event = await this.findOne(id);

    if (!event) throw new BadRequestException(`Event not ${id} not found`);

    await this.eventRepository.update(event.id, {
      statusEvent: statusEvent.CANCELADO,
    });

    if (event.images.length > 0) {
      await this.imageEventRepository.update(
        event.images.map((image) => image.id),
        { status: status.INACTIVE },
      );
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
