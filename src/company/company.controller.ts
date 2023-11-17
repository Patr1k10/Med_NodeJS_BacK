import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
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
import { Response } from 'express';
import { FileType } from '../types/enums/file.type';

@UseGuards(AuthGuard('jwt'), CompanyGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  createCompany(@GetUser() user: User, @Body() companyDto: CompanyCreateDto): Promise<Company> {
    return this.companyService.createCompany(user, companyDto);
  }

  @Patch(':id')
  updateCompany(@Param('id') id: string, @Body() companyDto: CompanyUpdateDto): Promise<Company> {
    return this.companyService.updateCompany(+id, companyDto);
  }

  @Get(':id')
  getCompanyById(@Param('id') id: string): Promise<Company> {
    return this.companyService.getCompanyById(+id);
  }
  @Get(':id/members')
  async getCompanyMembers(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedData<User>> {
    return this.companyService.getCompanyMembers(+id, page, limit);
  }
  @Get(':id/invitations')
  async getCompanyInvitations(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedData<Invitation>> {
    return await this.companyService.getCompanyInvitations(+id, page, limit);
  }

  @Delete(':id')
  deleteCompany(@Param('id') id: string): Promise<void> {
    return this.companyService.deleteCompany(+id);
  }

  @Patch(':id/add-admin/:userId')
  async addAdminToCompany(@Param('id') companyId: string, @Param('userId') userId: string): Promise<Company> {
    return this.companyService.addAdminToCompany(+companyId, +userId);
  }

  @Patch(':id/remove-admin/:userId')
  async removeAdminFromCompany(@Param('id') companyId: string, @Param('userId') userId: string): Promise<Company> {
    return this.companyService.removeAdminFromCompany(+companyId, +userId);
  }

  @Delete(':id/exclude-user/:userId')
  async excludeUserFromCompany(@Param('id') companyId: string, @Param('userId') excludeUserId: string): Promise<void> {
    return this.companyService.excludeUserFromCompany(+excludeUserId, +companyId);
  }

  @Delete(':id/leave')
  async leaveCompany(@GetUser() user: User, @Param('id') companyId: number): Promise<void> {
    return this.companyService.leaveCompany(+user.id, +companyId);
  }

  @Get()
  getAllCompanies(@Query('page') page = 1, @Query('limit') limit = 10): Promise<PaginatedData<Company>> {
    return this.companyService.findAll(+page, +limit);
  }
  @Get(':id/admins')
  async getCompanyAdmins(@Param('id') id: string): Promise<User[]> {
    return this.companyService.getCompanyAdmins(+id);
  }

  @Get(':companyId/export-all-data/:fileType')
  async exportCompanyAllData(
    @Param('companyId') companyId: string,
    @Param('fileType') fileType: FileType,
    @Res() response: Response,
  ): Promise<void> {
    return this.companyService.exportCompanyAllData(+companyId, fileType, response);
  }

  @Get(':companyId/export-user-data/:userId/:fileType')
  async exportCompanyUserData(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Param('fileType') fileType: FileType,
    @Res() response: Response,
  ): Promise<void> {
    return this.companyService.exportCompanyUserData(+companyId, +userId, fileType, response);
  }

  @Get(':quizId/export-quiz-data/:fileType')
  async exportCompanyQuizData(
    @Param('quizId') quizId: string,
    @Param('fileType') fileType: FileType,
    @Res() response: Response,
  ): Promise<void> {
    return this.companyService.exportCompanyQuizData(+quizId, fileType, response);
  }
}
