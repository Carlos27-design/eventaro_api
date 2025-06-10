import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateImageEventDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateUbicationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  initialDate: Date;

  @IsDateString()
  finalDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageEventDto)
  @IsOptional()
  images?: CreateImageEventDto[];

  @ValidateNested()
  @Type(() => CreateUbicationDto)
  ubication: CreateUbicationDto;

  @IsUUID()
  @IsNotEmpty()
  typeEventId: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}
