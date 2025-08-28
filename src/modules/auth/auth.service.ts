import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { LoginUserDto } from './dtos/login-user.dto';
import { status } from 'src/shared/status.enum';
import { CreateUserAdminDto } from './dtos/create-user-admin.dto';
import { UpdateUserAdminDto } from './dtos/update-user-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly _jwtService: JwtService,
  ) {}

  public async getUsers() {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const users = await queryBuilder
      .where('user.status = :status', {
        status: status.ACTIVE,
      })
      .getMany();

    return users;
  }

  public async getUserById(userId: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const user = await queryBuilder
      .where('user.id = :id', { id: userId })
      .andWhere('user.status = :status', { status: status.ACTIVE })
      .getOne();

    return user;
  }

  public async createUserAdmin(createUserAdminDto: CreateUserAdminDto) {
    try {
      const { password, ...rest } = createUserAdminDto;
      const salt = 10;
      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, salt),
      });

      await this.userRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  public async updateUserAdmin(
    id: string,
    updateUserAdminDto: UpdateUserAdminDto,
  ) {
    try {
      const user = await this.getUserById(id);
      if (!user) throw new BadRequestException('User not found');

      if (updateUserAdminDto.fullName)
        user.fullName = updateUserAdminDto.fullName;
      if (updateUserAdminDto.email) user.email = updateUserAdminDto.email;
      if (updateUserAdminDto.role) user.roles = updateUserAdminDto.role;
      if (updateUserAdminDto.password) {
        const salt = 10;
        user.password = bcrypt.hashSync(updateUserAdminDto.password, salt);
      }

      return await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  public async deleteUserAdmin(id: string) {
    try {
      const user = await this.getUserById(id);

      if (!user) throw new BadRequestException('User not found');

      user.status = status.INACTIVE;

      await this.userRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  public async register(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;
      const salt = 10;
      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, salt),
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        user: user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  public async registerUserAdmin(createUserAdminDto: CreateUserAdminDto) {
    try {
      const { password, ...rest } = createUserAdminDto;
      const salt = 10;
      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, salt),
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        user: user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  public async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const user = await queryBuilder
      .where('user.email = :email', { email: email })
      .getOne();

    if (!user) throw new BadRequestException('Credentials are not valid');

    if (!bcrypt.compare(password, user.password))
      throw new BadRequestException('Credentials are not valid');

    delete user.password;

    return {
      user: user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  public async checkAuthStatus(user: User) {
    return {
      user: user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this._jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
