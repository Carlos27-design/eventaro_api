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
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entity/user.entity';
import { Auth } from './decorators/auth.decorator';
import { CreateUserAdminDto } from './dtos/create-user-admin.dto';
import { ValidRoles } from './interfaces';
import { UpdateUserAdminDto } from './dtos/update-user-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Auth(ValidRoles.ADMIN)
  @Get()
  getUsers() {
    return this._authService.getUsers();
  }

  @Auth(ValidRoles.ADMIN)
  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this._authService.getUserById(id);
  }

  @Auth(ValidRoles.ADMIN)
  @Post('register-admin')
  registerAdmin(@Body() createUserAdminDto: CreateUserAdminDto) {
    return this._authService.registerUserAdmin(createUserAdminDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Patch('update-admin/:id')
  updateUserAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return this._authService.updateUserAdmin(id, updateUserAdminDto);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this._authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this._authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this._authService.checkAuthStatus(user);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  deleteUserAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this._authService.deleteUserAdmin(id);
  }
}
