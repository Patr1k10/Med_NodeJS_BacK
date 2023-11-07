import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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
      where: { id: companyId, isVisible: true },
      relations: ['owner'],
    });

    if (!company) {
      throw new UnauthorizedException('Company not found');
    }

    if (user.id !== company.owner.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
