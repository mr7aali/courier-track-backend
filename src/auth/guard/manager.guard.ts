import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';


@Injectable()
export class ManagerGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Call default JWT authentication first
    const canActivate = (await super.canActivate(context)) as boolean;
    if (!canActivate) return false;

    // Get the request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== "manager") {
      throw new ForbiddenException('Only MANAGER can access this route');
    }

    return true;
  }
}
