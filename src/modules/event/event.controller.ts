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
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entity/user.entity';

@Controller('event')
export class EventController {
  constructor(private readonly _eventService: EventService) {}

  @Auth(ValidRoles.ADMIN, ValidRoles.ORGANIZER)
  @Post()
  create(@Body() createEventDto: CreateEventDto, @GetUser() user: User) {
    return this._eventService.create(createEventDto, user);
  }

  @Get()
  findAll() {
    return this._eventService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this._eventService.findOne(term);
  }

  @Get('search/:term')
  findAllByTypeEvent(@Param('term') term: string) {
    return this._eventService.findAllByTypeEvent(term);
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.ORGANIZER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: User,
  ) {
    return this._eventService.update(id, updateEventDto, user);
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.ORGANIZER)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this._eventService.remove(id, user);
  }
}
