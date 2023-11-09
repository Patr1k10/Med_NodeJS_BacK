import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from './entity/company.entity';
import { User } from '../users/entities/user.entity';
import { CompanyCreateDto } from './dto /company.create.dto';
import { CompanyUpdateDto } from './dto /company.update.dto';

import { paginate } from '../common/pagination';
import { PaginatedData } from '../types/interface';
import { Invitation } from '../invitation/entity/invitation.entity';

@Injectable()
export class CompanyService {
  private readonly logger: Logger = new Logger(CompanyService.name);
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createCompany(user: User, companyDto: CompanyCreateDto): Promise<Company> {
    const { name, description } = companyDto;
    const company = this.companyRepository.create({
      name,
      description,
      owner: user,
    });
    const createdCompany = await this.companyRepository.save(company);
    this.logger.log(`Company created successfully. ID: ${createdCompany.id}`);
    return createdCompany;
  }

  async getCompanyById(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id, isVisible: true } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }
  async getCompanyMembers(companyId: number, page: number, limit: number): Promise<PaginatedData<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.companies', 'company')
      .where('company.id = :companyId', { companyId })
      .andWhere('user.deleted_at IS NULL')
      .orderBy('user.created_at', 'ASC');

    try {
      return paginate<User>(this.userRepository, queryBuilder, page, limit);
    } catch (error) {
      this.logger.error(`Failed to get members for company with ID ${companyId}: ${error.message}`);
      throw new NotFoundException('Failed to retrieve members');
    }
  }

  async updateCompany(id: number, user: User, companyDto: CompanyUpdateDto): Promise<Company> {
    const { name, description, isVisible } = companyDto;
    const company = await this.getCompanyById(id);
    if (company.owner.id !== user.id) {
      this.logger.warn(`User with ID ${user.id} is not authorized to update this company`);
      throw new UnauthorizedException('You do not have permission to update this company');
    }
    if (name) company.name = name;
    if (description) company.description = description;
    if (isVisible !== undefined) company.isVisible = isVisible;
    const updatedCompany = await this.companyRepository.save(company);
    this.logger.log(`Company updated successfully. ID: ${updatedCompany.id}`);
    return updatedCompany;
  }

  async deleteCompany(id: number, user: User): Promise<void> {
    this.logger.log(`Attempting to soft-delete company with ID: ${id}`);
    const company = await this.getCompanyById(id);
    if (company.owner.id !== user.id) {
      this.logger.warn(`User with ID ${user.id} is not authorized to delete this company`);
      throw new UnauthorizedException('You do not have permission to delete this company');
    }
    const result = await this.companyRepository.softDelete(id);
    if (result.affected === 0) {
      this.logger.warn(`Company not found with ID: ${id}`);
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    this.logger.log(`Successfully soft-deleted company with ID: ${id}`);
  }

  async excludeUserFromCompany(excludeUserId: number, companyId: number): Promise<void> {
    const excludeUser = await this.userRepository.findOne({ where: { id: excludeUserId } });
    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!excludeUser || !company) {
      throw new NotFoundException('User or company not found');
    }
    company.members = company.members.filter((member) => member.id !== excludeUser.id);
    await this.companyRepository.save(company);
  }

  async leaveCompany(userId: number, companyId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!user || !company) {
      throw new NotFoundException('User or company not found');
    }
    company.members = company.members.filter((member) => member.id !== userId);
    await this.companyRepository.save(company);
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedData<Company>> {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('Company')
      .where('Company.isVisible = :isVisible', { isVisible: true });
    return paginate<Company>(this.companyRepository, queryBuilder, +page, +limit);
  }
  async getCompanyInvitations(companyId: number, page: number, limit: number): Promise<PaginatedData<Invitation>> {
    const queryBuilder: SelectQueryBuilder<Invitation> = this.invitationRepository
      .createQueryBuilder('invitation')
      .where('invitation.companyId = :companyId', { companyId })
      .orderBy('invitation.created_at', 'DESC');

    try {
      return paginate<Invitation>(this.invitationRepository, queryBuilder, page, limit);
    } catch (error) {
      this.logger.error(`Failed to get invitations for company with ID ${companyId}: ${error.message}`);
      throw new NotFoundException('Failed to retrieve invitations');
    }
  }
}
