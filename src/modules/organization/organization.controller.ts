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

  @Post()
  @Auth(ValidRoles.ADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this._organizationService.create(createOrganizationDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN)
  findAll() {
    return this._organizationService.findAll();
  }

  @Get(':term')
  @Auth(ValidRoles.ADMIN)
  findOne(@Param('term') term: string) {
    return this._organizationService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this._organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._organizationService.remove(id);
  }
}
