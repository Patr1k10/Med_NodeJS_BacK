import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../company/entity/company.entity';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const companyId = request.params.id;
    const user = request.user as User;

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['owner', 'admins'],
    });

    if (!company) {
      throw new ForbiddenException('Company not found');
    }


    if (user.id === company.owner.id || (await this.isUserAdmin(user, company.admins))) {
      return true;
    }

    throw new UnauthorizedException('Unauthorized');
  }

  private async isUserAdmin(user: User, admins: User[]): Promise<boolean> {
    return admins.some((admin) => admin.id === user.id);
  }
}
