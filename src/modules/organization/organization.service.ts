import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entity/organization.entity';
import { Repository } from 'typeorm';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos';
import { status } from 'src/shared/status.enum';
import { validate as isUUID } from 'uuid';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) { }

  public async create(createOrganizationDto: CreateOrganizationDto) {
    const organization = this.organizationRepository.create(
      createOrganizationDto,
    );
    try {
      return await this.organizationRepository.save(organization);
    } catch (error) {
      console.log(error);
      this.handleDBError(error);
    }
  }

  public async findAll() {
    const queryBuilder =
      this.organizationRepository.createQueryBuilder('organization');

    const organizations = await queryBuilder
      .where('organization.status = :status', {
        status: status.ACTIVE,
      })
      .getMany();

    if (!organizations) throw new BadRequestException('Organization not found');

    return organizations;
  }

  public async findOne(term: string) {
    let organization: Organization;

    const queryBuilder =
      this.organizationRepository.createQueryBuilder('organization');

    if (isUUID(term)) {
      organization = await queryBuilder
        .where('organization.id = :id', {
          id: term,
        })
        .andWhere('organization.status = :status', { status: status.ACTIVE })
        .getOne();
    } else {
      organization = await queryBuilder
        .where('organization.name = :name', {
          name: term,
        })
        .andWhere('organization.status = :status', { status: status.ACTIVE })
        .getOne();
    }

    if (!organization) {
      throw new BadRequestException(`Organization not ${term} not found`);
    }

    return organization;
  }

  public async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ) {
    const organization = await this.organizationRepository.preload({
      id,
      ...updateOrganizationDto,
    });

    if (!organization) {
      throw new BadRequestException(`Organization not ${id} not found`);
    }

    try {
      await this.organizationRepository.save(organization);
      return organization;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  public async remove(id: string) {
    const organization = await this.findOne(id);

    if (!organization)
      throw new BadRequestException(`Organization not ${id} not found`);

    organization.status = status.INACTIVE;
    await this.organizationRepository.save(organization);
  }

  private handleDBError(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
