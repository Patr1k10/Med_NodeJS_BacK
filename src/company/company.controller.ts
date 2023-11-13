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
import { Invitation } from '../invitation/entity/invitation.entity';

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
  @UseGuards(AuthGuard('jwt'))
  getCompanyById(@Param('id') id: string): Promise<Company> {
    return this.companyService.getCompanyById(+id);
  }
  @Get(':id/members')
  @UseGuards(AuthGuard('jwt'))
  async getCompanyMembers(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedData<User>> {
    return this.companyService.getCompanyMembers(+id, page, limit);
  }
  @Get(':id/invitations')
  @UseGuards(AuthGuard('jwt'))
  async getCompanyInvitations(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedData<Invitation>> {
    return await this.companyService.getCompanyInvitations(+id, page, limit);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  deleteCompany(@Param('id') id: string): Promise<void> {
    return this.companyService.deleteCompany(+id);
  }

  @Patch(':id/add-admin/:userId')
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  async addAdminToCompany(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
  ): Promise<Company> {
    return this.companyService.addAdminToCompany(+companyId, +userId);
  }

  @Patch(':id/remove-admin/:userId')
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  async removeAdminFromCompany(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
  ): Promise<Company> {
    return this.companyService.removeAdminFromCompany(+companyId, +userId);
  }

  @Delete(':id/exclude-user/:userId')
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  async excludeUserFromCompany(@Param('id') companyId: string, @Param('userId') excludeUserId: string): Promise<void> {
    return this.companyService.excludeUserFromCompany(+excludeUserId, +companyId);
  }

  @Delete(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  async leaveCompany(@GetUser() user: User, @Param('id') companyId: number): Promise<void> {
    return this.companyService.leaveCompany(+user.id, +companyId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getAllCompanies(@Query('page') page = 1, @Query('limit') limit = 10): Promise<PaginatedData<Company>> {
    return this.companyService.findAll(+page, +limit);
  }
  @Get(':id/admins')
  @UseGuards(AuthGuard('jwt'), CompanyGuard)
  async getCompanyAdmins(@Param('id') id: string): Promise<User[]> {
    return this.companyService.getCompanyAdmins(+id);
  }
}
