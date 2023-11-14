import { Controller, Post, Body, Param, UseGuards, Query, Get, Delete } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationDto } from './dto/invitation.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedData } from '../types/interface';
import { Company } from '../company/entity/company.entity';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';
@UseGuards(AuthGuard('jwt'))
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('/sendInvitation')
  async sendInvitation(@GetUser() user: User, @Body() invitationDto: InvitationDto): Promise<void> {
    await this.invitationService.sendInvitation(invitationDto, user);
  }

  @Post('/sendRequest')
  async senRequest(@GetUser() user: User, @Body() invitationDto: InvitationDto): Promise<void> {
    await this.invitationService.sendRequest(invitationDto, user);
  }

  @Post(':id/accept')
  async accept(@Param('id') id: string): Promise<void> {
    await this.invitationService.accept(+id);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string): Promise<void> {
    await this.invitationService.reject(+id);
  }

  @Delete(':id')
  async softDeleteInvitation(@Param('id') id: string): Promise<void> {
    await this.invitationService.softDeleteInvitation(+id);
  }

  @Get(':id/invitations')
  async getInvitationsForUser(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedData<Company>> {
    return await this.invitationService.getInvitationsForUser(+id, page, limit);
  }
  @Get(':id/invitations')
  async getRequestedForUser(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedData<Company>> {
    return await this.invitationService.getRequestedForUser(+id, page, limit);
  }
}
