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

  @Auth(ValidRoles.ADMIN)
  @Get()
  findAll() {
    return this._typeEventService.findAll();
  }

  @Auth(ValidRoles.ADMIN)
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this._typeEventService.findOne(term);
  }

  @Auth(ValidRoles.ADMIN)
  @Post()
  create(@Body() createTypeEventDto: CreateTypeEventDto) {
    return this._typeEventService.create(createTypeEventDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTypeEventDto: UpdateTypeEventDto,
  ) {
    return this._typeEventService.update(id, updateTypeEventDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._typeEventService.remove(id);
  }
}
