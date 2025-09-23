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
import { TypeEventService } from './type-event.service';
import { CreateTypeEventDto, UpdateTypeEventDto } from './dtos';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('type-event')
export class TypeEventController {
  constructor(private readonly _typeEventService: TypeEventService) {}

  @Get()
  findAll() {
    return this._typeEventService.findAll();
  }

  @Get(':term')
  @Auth(ValidRoles.ADMIN)
  findOne(@Param('term') term: string) {
    return this._typeEventService.findOne(term);
  }

  @Post()
  @Auth(ValidRoles.ADMIN)
  create(@Body() createTypeEventDto: CreateTypeEventDto) {
    return this._typeEventService.create(createTypeEventDto);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTypeEventDto: UpdateTypeEventDto,
  ) {
    return this._typeEventService.update(id, updateTypeEventDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._typeEventService.remove(id);
  }
}
