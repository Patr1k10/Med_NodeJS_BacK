import { Controller, Post, Body, Param, UseGuards, Query, Get, Delete } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationDto } from './dto/invitation.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedData } from '../types/interface';
import { Invitation } from './entity/invitation.entity';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async sendInvitation(@Body() invitationDto: InvitationDto): Promise<void> {
    await this.invitationService.sendInvitation(invitationDto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/accept')
  async acceptInvitation(@Param('id') id: string): Promise<void> {
    await this.invitationService.acceptInvitation(+id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/reject')
  async rejectInvitation(@Param('id') id: string): Promise<void> {
    await this.invitationService.rejectInvitation(+id);
  }
  @Delete(':id')
  async softDeleteInvitation(@Param('id') id: string): Promise<void> {
    await this.invitationService.softDeleteInvitation(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getInvitationsAndRequests(
    @GetUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedData<Invitation>> {
    return this.invitationService.getInvitationsAndRequestsForUser(user, +page, +limit);
  }
}
