import { Test, TestingModule } from '@nestjs/testing';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { InvitationDto } from './dto/invitation.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../decorator/getUser.decorator';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../company/entity/company.entity';
import { NotFoundException } from '@nestjs/common';
import * as supertest from 'supertest';
import { mockCompany } from '../common/const/mock.company';
import { mockUser } from '../common/const/mock.user';

// Создаем моки и данные для тестов

const mockInvitationDto: InvitationDto = { receiverId: 2, companyId: 1 };

// Мок сервиса и репозитория
const mockInvitationService = {
  sendInvitation: jest.fn(),
  sendRequest: jest.fn(),
  accept: jest.fn(),
  reject: jest.fn(),
  softDeleteInvitation: jest.fn(),
  getInvitationsForUser: jest.fn().mockResolvedValue({ data: [mockCompany], totalCount: 1, page: 1, limit: 10 }),
  getRequestedForUser: jest.fn().mockResolvedValue({ data: [mockCompany], totalCount: 1, page: 1, limit: 10 }),
};

describe('InvitationController', () => {
  let invitationController: InvitationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationController],
      providers: [
        {
          provide: InvitationService,
          useValue: mockInvitationService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {} as Repository<User>,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: {} as Repository<Company>,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    invitationController = module.get<InvitationController>(InvitationController);
  });

  describe('sendInvitation', () => {
    it('should send invitation successfully', async () => {
      jest.spyOn(invitationController, 'sendInvitation').mockResolvedValueOnce(undefined);

      await invitationController.sendInvitation(mockUser as User, mockInvitationDto);

      expect(mockInvitationService.sendInvitation).toHaveBeenCalledWith(mockInvitationDto, mockUser as User);
    });
  });

  describe('sendRequest', () => {
    it('should send request successfully', async () => {
      jest.spyOn(invitationController, 'senRequest').mockResolvedValueOnce(undefined);

      await invitationController.senRequest(mockUser as User, mockInvitationDto);

      expect(mockInvitationService.sendRequest).toHaveBeenCalledWith(mockInvitationDto, mockUser);
    });
  });

  describe('accept', () => {
    it('should accept invitation successfully', async () => {
      jest.spyOn(invitationController, 'accept').mockResolvedValueOnce(undefined);

      await invitationController.accept('1');

      expect(mockInvitationService.accept).toHaveBeenCalledWith(1);
    });
  });

  describe('reject', () => {
    it('should reject invitation successfully', async () => {
      jest.spyOn(invitationController, 'reject').mockResolvedValueOnce(undefined);

      await invitationController.reject('1');

      expect(mockInvitationService.reject).toHaveBeenCalledWith(1);
    });
  });

  describe('softDeleteInvitation', () => {
    it('should soft delete invitation successfully', async () => {
      jest.spyOn(invitationController, 'softDeleteInvitation').mockResolvedValueOnce(undefined);

      await invitationController.softDeleteInvitation('1');

      expect(mockInvitationService.softDeleteInvitation).toHaveBeenCalledWith(1);
    });
  });

  describe('getInvitationsForUser', () => {
    it('should get invitations for user successfully', async () => {
      const expectedResponse = { data: [mockCompany], totalCount: 1, page: 1, limit: 10 };

      const result = await invitationController.getInvitationsForUser('1', 1, 10);

      expect(mockInvitationService.getInvitationsForUser).toHaveBeenCalledWith(1, 1, 10);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getRequestedForUser', () => {
    it('should get requested companies for user successfully', async () => {
      const expectedResponse = { data: [mockCompany], totalCount: 1, page: 1, limit: 10 };

      const result = await invitationController.getRequestedForUser('1', 1, 10);

      expect(mockInvitationService.getRequestedForUser).toHaveBeenCalledWith(1, 1, 10);
      expect(result).toEqual(expectedResponse);
    });
  });
});
