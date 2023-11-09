import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InvitationDto } from './dto/invitation.dto';
import { Invitation } from './entity/invitation.entity';
import { Company } from '../company/entity/company.entity';
import { InvitationStatus } from '../types/enums/invitation.status';
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
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
      relations: ['invitedCompanies', 'requestedCompanies'],
    });
    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
      relations: ['invitedCompanies', 'requestedCompanies'],
    });
    const company = await this.companyRepository.findOne({ where: { id: companyId }, relations: ['owner', 'members'] });
    if (!sender || !company || !receiver) {
      throw new NotFoundException('Sender, receiver, or company not found');
    }
    if (sender.id !== company.owner.id) {
      throw new ForbiddenException('Sender does not have permission to send invitations for this company');
    }
    if (
      receiver.invitedCompanies.some((invitedCompany) => invitedCompany.id === companyId) ||
      receiver.requestedCompanies.some((requestedCompany) => requestedCompany.id === companyId) ||
      company.members.some((member) => member.id === receiverId)
    ) {
      throw new BadRequestException('Receiver is already a member or has already sent requests to this company');
    }
    const invitation = this.invitationRepository.create({
      sender,
      receiver,
      company,
    });
    invitation.receiver.invitedCompanies = [company];
    await this.userRepository.save(invitation.receiver);
    await this.invitationRepository.save(invitation);
    this.logger.log(`Invitation sent: ${receiverId}`);
    return invitation;
  }

  async sendRequest(invitationDto: InvitationDto): Promise<Invitation> {
    const { senderId, receiverId, companyId } = invitationDto;
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
      relations: ['invitedCompanies', 'requestedCompanies'],
    });
    const company = await this.companyRepository.findOne({ where: { id: companyId }, relations: ['owner', 'members'] });
    const receiver = company.owner;
    if (!sender || !company || !receiver) {
      throw new NotFoundException('Sender, receiver, or company not found');
    }
    if (
      sender.invitedCompanies.some((invitedCompany) => invitedCompany.id === companyId) ||
      sender.requestedCompanies.some((requestedCompany) => requestedCompany.id === companyId) ||
      company.members.some((member) => member.id === senderId)
    ) {
      throw new BadRequestException('Sender is already a member or has already sent requests to this company');
    }
    const invitation = this.invitationRepository.create({
      sender,
      receiver,
      company,
    });
    invitation.isRequest = true;
    invitation.sender.requestedCompanies = [company];
    await this.userRepository.save(invitation.sender);
    await this.invitationRepository.save(invitation);
    this.logger.log(`Invitation sent: ${receiverId}`);
    return invitation;
  }

  async accept(invitationId: number): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['sender', 'receiver', 'company'],
    });
    if (!invitation) {
      this.logger.error(`Invitation with ID ${invitationId} not found`);
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== InvitationStatus.ACCEPTED) {
      throw new BadRequestException('Invalid invitation status');
    }
    if (invitation.isRequest === true) {
      invitation.status = InvitationStatus.ACCEPTED;
      const sender = await this.userRepository.findOne({ where: { id: invitation.sender.id } });
      if (!sender) {
        this.logger.error(`Sender with ID ${invitation.sender.id} not found`);
        throw new NotFoundException('Sender not found');
      }
      invitation.company.members = [sender];
    } else {
      invitation.status = InvitationStatus.ACCEPTED;
      const receiver = await this.userRepository.findOne({ where: { id: invitation.receiver.id } });
      if (!receiver) {
        this.logger.error(`Receiver with ID ${invitation.receiver.id} not found`);
        throw new NotFoundException('Receiver not found');
      }
      invitation.company.members = [receiver];
    }
    await this.companyRepository.save(invitation.company);
    await this.invitationRepository.save(invitation);
    this.logger.log(`Invitation accepted: ${invitationId}`);
  }

  async reject(invitationId: number): Promise<void> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      this.logger.error(`Invitation with ID ${invitationId} not found`);
      throw new NotFoundException('Invitation not found');
    }
    this.logger.log(`Invitation rejected with ID: ${invitationId}`);
    invitation.status = InvitationStatus.REJECTED;
    await this.companyRepository.save(invitation);
  }

  async softDeleteInvitation(invitationId: number): Promise<void> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      this.logger.warn(`Invitation with ID ${invitationId} not found`);
      throw new NotFoundException('Invitation not found');
    }
    await this.invitationRepository.save(invitation);
    this.logger.log(`Invitation soft deleted successfully. ID: ${invitationId}`);
  }
  async getInvitationsGorUser(userId: number, page: number, limit: number): Promise<PaginatedData<Company>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['invitedCompanies'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const invitedCompanies = user.invitedCompanies;
    const queryBuilder: SelectQueryBuilder<Company> = this.companyRepository
      .createQueryBuilder('company')
      .whereInIds(invitedCompanies.map((company) => company.id))
      .orderBy('company.created_at', 'DESC');
    try {
      return paginate<Company>(this.companyRepository, queryBuilder, page, limit);
    } catch (error) {
      throw new NotFoundException('Failed to retrieve invited companies');
    }
  }
  async getRequestedForUser(userId: number, page: number, limit: number): Promise<PaginatedData<Company>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['requestedCompanies'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const requestedCompanies = user.requestedCompanies;
    const queryBuilder: SelectQueryBuilder<Company> = this.companyRepository
      .createQueryBuilder('company')
      .whereInIds(requestedCompanies.map((company) => company.id))
      .orderBy('company.created_at', 'DESC');
    try {
      return paginate<Company>(this.companyRepository, queryBuilder, page, limit);
    } catch (error) {
      throw new NotFoundException('Failed to retrieve requested companies');
    }
  }
}
