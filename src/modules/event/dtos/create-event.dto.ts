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

  @IsString({
    each: true,
  })
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsNotEmpty()
  ubication: string;

  @IsString()
  @IsNotEmpty()
  typeEventId: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;
}
