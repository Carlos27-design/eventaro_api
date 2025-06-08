import { CreateTypeEventDto } from './create-type-event.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTypeEventDto extends PartialType(CreateTypeEventDto) {}
