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
import { InscriptionService } from './inscription.service';
import { CreateInscriptionDto } from './dtos/create-inscription.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entity/user.entity';
import { UpdateInscriptionDto } from './dtos/update-inscription.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('inscription')
export class InscriptionController {
  constructor(private readonly _inscriptionService: InscriptionService) {}

  @Auth()
  @Post()
  create(
    @Body() createInscriptionDto: CreateInscriptionDto,
    @GetUser() user: User,
  ) {
    return this._inscriptionService.create(createInscriptionDto, user);
  }

  @Auth(ValidRoles.ADMIN)
  @Get()
  findAll() {
    return this._inscriptionService.findAll();
  }

  @Auth(ValidRoles.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this._inscriptionService.findOne(id);
  }

  @Auth()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInscriptionDto: UpdateInscriptionDto,
  ) {
    return this._inscriptionService.update(id, updateInscriptionDto);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._inscriptionService.remove(id);
  }
}
