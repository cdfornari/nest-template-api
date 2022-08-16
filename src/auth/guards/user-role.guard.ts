import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(private readonly reflector: Reflector) {}

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = this.reflector.get<string>(META_ROLES, ctx.getHandler());
    if (!validRoles || validRoles.length === 0) return true;
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if(!user || !user.isActive) throw new UnauthorizedException('user not found or inactive');
    if(validRoles.includes(user.role)) return true;
    throw new UnauthorizedException('user not authorized');
  }
  
}
