import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypts from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password,...rest } = createUserDto;
    try {
      const user = this.userRepository.create({
        ...rest,
        password: bcrypts.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwt({ id: user.id })
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, isActive: true } 
    })
    if(!user) throw new UnauthorizedException('User does not exist');
    const isMatch = bcrypts.compareSync(password, user.password);
    if(!isMatch) throw new UnauthorizedException('Invalid credentials');
    if(!user.isActive) throw new UnauthorizedException('User is not active');
    delete user.password;
    delete user.isActive;
    return {
      ...user,
      token: this.getJwt({ id: user.id })
    }
  }

  async renewToken(user: User) {
    return {
      ...user,
      token: this.getJwt({ id: user.id })
    }
  }

  private getJwt(payload: JwtPayload){
    return this.jwtService.sign(payload);
  }

  private handleDBExceptions(error: any) {
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error)
    throw new InternalServerErrorException('unexpected error');
  }

}
