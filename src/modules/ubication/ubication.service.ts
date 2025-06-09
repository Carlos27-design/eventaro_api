import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ubication } from './entity/ubication.entity';
import { Repository } from 'typeorm';
import { CreateUbicationDto } from './dtos/create-ubication.dto';

@Injectable()
export class UbicationService {
  constructor(
    @InjectRepository(Ubication)
    private readonly ubicationRepository: Repository<Ubication>,
  ) {}

  private readonly MAPBOX_TOKEN = process.env.API_KEY_MAPBOX;

  public async create(createUbicationDto: CreateUbicationDto) {
    const { name } = createUbicationDto;
    try {
      const encodedName = encodeURIComponent(name);
      const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodedName}&access_token=${this.MAPBOX_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        throw new Error('No se encontraron coordenadas para la ubicación');
      }

      const [lat, lng] = data.features[0].geometry.coordinates;

      const ubication = this.ubicationRepository.create({
        name,
        latitude: lat,
        longitude: lng,
      });

      return await this.ubicationRepository.save(ubication);
    } catch (error) {
      throw new Error('No se encontraron coordenadas para la ubicación');
    }
  }

  public async findOne(id: string) {
    const queryBuilder =
      this.ubicationRepository.createQueryBuilder('ubication');

    const ubication = await queryBuilder
      .where('ubication.id = :id', { id: id })
      .getOne();

    if (!ubication)
      throw new BadRequestException(`Ubication not ${id} not found`);

    return ubication;
  }

  public async delete(id: string) {
    const ubication = await this.findOne(id);

    ubication.status = 'INACTIVE';

    return await this.ubicationRepository.save(ubication);
  }
}
