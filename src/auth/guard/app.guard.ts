import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.id;
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const currentUser = request.user;
    if (currentUser.id !== user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
