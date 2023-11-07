import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';
import { CompanyCreateDto } from './dto /company.create.dto';
import { CompanyUpdateDto } from './dto /company.update.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedData } from '../types/interface';
import { CompanyGuard } from '../auth/guard/company.guard';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createCompany(@GetUser() user: User, @Body() companyDto: CompanyCreateDto): Promise<Company> {
    return this.companyService.createCompany(user, companyDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  updateCompany(@Param('id') id: string, @Body() companyDto: CompanyUpdateDto): Promise<Company> {
    return this.companyService.updateCompany(+id, companyDto);
  }

  @Get(':id')
  getCompanyById(@Param('id') id: string): Promise<Company> {
    return this.companyService.getCompanyById(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  deleteCompany(@Param('id') id: string): Promise<void> {
    return this.companyService.deleteCompany(+id);
  }

  @Get()
  getAllCompanies(@Query('page') page = 1, @Query('limit') limit = 10): Promise<PaginatedData<Company>> {
    return this.companyService.findAll(+page, +limit);
  }
}
