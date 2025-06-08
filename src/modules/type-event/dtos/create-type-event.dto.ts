import { IsString, MinLength } from 'class-validator';

export class CreateTypeEventDto {
  @IsString()
  @MinLength(3)
  name: string;
}
