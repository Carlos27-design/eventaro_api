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

@Controller('event')
export class EventController {
  constructor(private readonly _eventService: EventService) {}

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

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this._eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._eventService.remove(id);
  }
}
