import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsString()
  @IsEmail()
  @MinLength(3)
  email: string;
}
