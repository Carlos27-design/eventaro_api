import { IsString, MinLength } from "class-validator";

export class CreateUbicationDto {
    @IsString()
    @MinLength(3)
    name: string
}