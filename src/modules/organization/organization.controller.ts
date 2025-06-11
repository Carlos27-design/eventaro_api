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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly _organizationService: OrganizationService) {}

  @Auth(ValidRoles.ADMIN)
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this._organizationService.create(createOrganizationDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Get()
  findAll() {
    return this._organizationService.findAll();
  }

  @Auth(ValidRoles.ADMIN)
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this._organizationService.findOne(term);
  }

  @Auth(ValidRoles.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this._organizationService.update(id, updateOrganizationDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._organizationService.remove(id);
  }
}
