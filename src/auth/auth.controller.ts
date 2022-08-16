import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RawHeaders } from 'src/auth/decorators/raw-headers.decorator';
import { AuthService } from './auth.service';
import { ReqUser } from './decorators/req-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('renew')
  @Auth()
  renewToken(
    @ReqUser() user: User
  ) {
    return this.authService.renewToken(user);
  }

  @Get('test')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @ReqUser() user: User,
    @ReqUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    return {
      user,
      userEmail,
      rawHeaders
    }
  }

  @Get('test-roles')
  @Auth('admin','super-admin')
  testingPrivateRouteWithRoles(
    @ReqUser() user: User
  ) {
    return {
      user
    }
  }

}
