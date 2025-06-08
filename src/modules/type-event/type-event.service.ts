import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeEvent } from './entity/type-event.entity';
import { Repository } from 'typeorm';

import { status } from 'src/shared/status.enum';
import { validate as isUUID } from 'uuid';
import { CreateTypeEventDto, UpdateTypeEventDto } from './dtos';

@Injectable()
export class TypeEventService {
  constructor(
    @InjectRepository(TypeEvent)
    private readonly typeEventRepository: Repository<TypeEvent>,
  ) {}

  public async create(createTypeEventDto: CreateTypeEventDto) {
    const typeEvent = this.typeEventRepository.create(createTypeEventDto);
    try {
      return await this.typeEventRepository.save(typeEvent);
    } catch (error) {
      console.log(error);
      this.handleDBError(error);
    }
  }

  public async findAll() {
    const queryBuilder =
      this.typeEventRepository.createQueryBuilder('type_event');

    const typeEvents = await queryBuilder
      .where('type_event.status = :status', {
        status: status.ACTIVE,
      })
      .getMany();

    if (!typeEvents) throw new BadRequestException('Type event not found');

    return typeEvents;
  }

  public async finOne(term: string) {
    let typeEvent: TypeEvent;

    const queryBuilder =
      this.typeEventRepository.createQueryBuilder('type_event');
    if (isUUID(term)) {
      typeEvent = await queryBuilder
        .where('type_event.id = :id', { id: term })
        .andWhere('type_event.status = :status', { status: status.ACTIVE })
        .getOne();
    } else {
      typeEvent = await queryBuilder
        .where('type_event.name = :name', { name: term })
        .andWhere('type_event.status = :status', { status: status.ACTIVE })
        .getOne();
    }

    if (!typeEvent) {
      throw new BadRequestException(`Type event not ${term} not found`);
    }

    return typeEvent;
  }

  public async update(id: string, updateTypeEventDto: UpdateTypeEventDto) {
    const typeEvent = await this.typeEventRepository.preload({
      id,
      ...updateTypeEventDto,
    });

    if (!typeEvent) {
      throw new BadRequestException(`Type event not ${id} not found`);
    }

    await this.typeEventRepository.save(typeEvent);

    return typeEvent;
  }

  public async remove(id: string) {
    const typeEvent = await this.finOne(id);

    if (!typeEvent) {
      throw new BadRequestException(`Type event not ${id} not found`);
    }

    typeEvent.status = status.INACTIVE;
    await this.typeEventRepository.save(typeEvent);
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
