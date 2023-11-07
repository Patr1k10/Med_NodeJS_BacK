import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InvitationDto } from './entity/invitation.dto';
import { Invitation } from './entity/invitation.entity';
import { Company } from '../company/entity/company.entity';
import { paginate } from '../common/pagination';
import { PaginatedData } from '../types/interface';

@Injectable()
export class InvitationService {
  private readonly logger: Logger = new Logger(InvitationService.name);
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async sendInvitation(invitationDto: InvitationDto): Promise<Invitation> {
    const { senderId, receiverId, companyId } = invitationDto;
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
    const company = await this.companyRepository.findOne({ where: { id: companyId } });

    const invitation = this.invitationRepository.create({
      sender,
      receiver,
      company,
    });
    this.logger.log(`Invitation sent: ${JSON.stringify(invitation)}`);
    return await this.invitationRepository.save(invitation);
  }

  async acceptInvitation(invitationId: number): Promise<void> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      this.logger.error(`Invitation with ID ${invitationId} not found`);
      throw new NotFoundException('Invitation not found');
    }
    invitation.company.members.push(invitation.receiver);
    await this.companyRepository.save(invitation.company);
    await this.invitationRepository.delete(invitationId);
    this.logger.log(`Invitation accepted: ${JSON.stringify(invitation)}`);
  }

  async rejectInvitation(invitationId: number): Promise<void> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      this.logger.error(`Invitation with ID ${invitationId} not found`);
      throw new NotFoundException('Invitation not found');
    }
    this.logger.log(`Invitation rejected with ID: ${invitationId}`);
    await this.invitationRepository.delete(invitationId);
  }

  async getInvitationsAndRequestsForUser(user: User, page: number, limit: number): Promise<PaginatedData<Invitation>> {
    const queryBuilder: SelectQueryBuilder<Invitation> = this.invitationRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.sender', 'sender')
      .leftJoinAndSelect('invitation.receiver', 'receiver')
      .leftJoinAndSelect('invitation.company', 'company')
      .where('sender.id = :userId OR receiver.id = :userId', { userId: user.id })
      .orderBy('invitation.created_at', 'DESC');

    return paginate(this.invitationRepository, queryBuilder, page, limit);
  }
}
