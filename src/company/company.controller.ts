import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';
import { CompanyCreateDto } from './dto /company.create.dto';
import { CompanyUpdateDto } from './dto /company.update.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedData } from '../types/interface';
import { AppGuard } from '../auth/guard/app.guard';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AppGuard)
  createCompany(@GetUser() user: User, @Body() companyDto: CompanyCreateDto): Promise<Company> {
    return this.companyService.createCompany(user, companyDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AppGuard)
  updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() companyDto: CompanyUpdateDto,
  ): Promise<Company> {
    return this.companyService.updateCompany(id, user, companyDto);
  }

  @Get(':id')
  getCompanyById(@Param('id', ParseIntPipe) id: number): Promise<Company> {
    return this.companyService.getCompanyById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AppGuard)
  deleteCompany(@GetUser() user: User, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.companyService.deleteCompany(id, user);
  }

  @Get()
  getAllCompanies(@Query('page') page = 1, @Query('limit') limit = 10): Promise<PaginatedData<Company>> {
    return this.companyService.findAll(+page, +limit);
  }
}