import { IsDateString, IsString, IsUUID } from 'class-validator';

export class CreateInscriptionDto {
  @IsDateString()
  dateInscription: Date;

  @IsString()
  @IsUUID()
  eventId: string;
}
