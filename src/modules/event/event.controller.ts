import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('event')
export class EventController {
  constructor(private readonly _eventService: EventService) {}

  @Auth(ValidRoles.ADMIN)
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this._eventService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this._eventService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this._eventService.findOne(term);
  }

  @Auth(ValidRoles.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this._eventService.update(id, updateEventDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._eventService.remove(id);
  }
}
