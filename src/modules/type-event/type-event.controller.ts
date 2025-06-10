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

@Controller('type-event')
export class TypeEventController {
  constructor(private readonly _typeEventService: TypeEventService) {}

  @Get()
  findAll() {
    return this._typeEventService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this._typeEventService.findOne(term);
  }

  @Post()
  create(@Body() createTypeEventDto: CreateTypeEventDto) {
    return this._typeEventService.create(createTypeEventDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTypeEventDto: UpdateTypeEventDto,
  ) {
    return this._typeEventService.update(id, updateTypeEventDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._typeEventService.remove(id);
  }
}
