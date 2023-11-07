import { Controller, Post, Body, Param, UseGuards, Query, Get } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationDto } from './entity/invitation.dto';
import { AuthGuard } from '@nestjs/passport';
import { AppGuard } from '../auth/guard/app.guard';
import { PaginatedData } from '../types/interface';
import { Invitation } from './entity/invitation.entity';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(AuthGuard('jwt'), AppGuard)
  @Post()
  async sendInvitation(@Body() invitationDto: InvitationDto): Promise<void> {
    await this.invitationService.sendInvitation(invitationDto);
  }
  @UseGuards(AuthGuard('jwt'), AppGuard)
  @Post(':id/accept')
  async acceptInvitation(@Param('id') id: number): Promise<void> {
    await this.invitationService.acceptInvitation(+id);
  }
  @UseGuards(AuthGuard('jwt'), AppGuard)
  @Post(':id/reject')
  async rejectInvitation(@Param('id') id: number): Promise<void> {
    await this.invitationService.rejectInvitation(+id);
  }
  @UseGuards(AuthGuard('jwt'), AppGuard)
  @Get()
  async getInvitationsAndRequests(
    @GetUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedData<Invitation>> {
    return this.invitationService.getInvitationsAndRequestsForUser(user, +page, +limit);
  }
}
