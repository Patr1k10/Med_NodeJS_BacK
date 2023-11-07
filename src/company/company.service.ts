import { Injectable, Logger, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entity/company.entity';
import { User } from '../users/entities/user.entity';
import { CompanyCreateDto } from './dto /company.create.dto';
import { CompanyUpdateDto } from './dto /company.update.dto';

import { paginate } from '../common/pagination';
import { PaginatedData } from '../types/interface';

@Injectable()
export class CompanyService {
  private readonly logger: Logger = new Logger(CompanyService.name);
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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

  async updateCompany(id: number, companyDto: CompanyUpdateDto): Promise<Company> {
    const company = await this.getCompanyById(id);
    if (!company) {
      this.logger.warn(`Company not found with ID: ${id}`);
      throw new NotFoundException('Company not found');
    }
    await this.companyRepository.update(id, companyDto);
    const updatedCompany = await this.getCompanyById(id);
    this.logger.log(`Company updated successfully. ID: ${id}`);
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<void> {
    const result = await this.companyRepository.softDelete(id);
    if (result.affected === 0) {
      this.logger.warn(`Company not found with ID: ${id}`);
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    this.logger.log(`Successfully soft-deleted company with ID: ${id}`);
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedData<Company>> {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('Company')
      .where('Company.isVisible = :isVisible', { isVisible: true });
    return paginate<Company>(this.companyRepository, queryBuilder, +page, +limit);
  }
}
