import { Test, TestingModule } from '@nestjs/testing';
import { InvitationService } from './invitation.service';
import { InvitationDto } from './dto/invitation.dto';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../company/entity/company.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Invitation } from './entity/invitation.entity';
import { mockRepository } from '../common/const/mock.repository';
import { mockUser, mockUser1 } from '../common/const/mock.user';

const mockPaginatedData = {
  data: [{ id: 2 }, { id: 3 }],
  totalCount: 2,
  page: 1,
  limit: 10,
};

const mockInvitation = {
  id: 1,
  status: 'SENT',
  isRequest: false,
  sender: { id: 2 },
  receiver: { id: 3 },
  company: { id: 4, members: [] },
};

const mockCompany = {
  id: 1,
  name: 'Mock Company',
  description: 'A mock company for testing',
  isVisible: true,
  owner: mockUser,
  admins: [mockUser],
  members: [{ id: 1 }],
  invitations: [],
  quizzes: [],
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

const mockInvitationDto: InvitationDto = {
  receiverId: 2,
  companyId: 1,
};

describe('InvitationService', () => {
  let invitationService: InvitationService;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let invitationRepository: Repository<Invitation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Invitation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    invitationService = module.get<InvitationService>(InvitationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
    invitationRepository = module.get<Repository<Invitation>>(getRepositoryToken(Invitation));
  });
  describe('sendInvitation', () => {
    it('should send invitation successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser as User);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser1 as User);
      jest.spyOn(companyRepository, 'findOne').mockResolvedValueOnce(mockCompany as Company);
      jest.spyOn(invitationRepository, 'create').mockReturnValueOnce({ ...mockInvitationDto } as any);

      const result = await invitationService.sendInvitation(mockInvitationDto, mockUser as User);
      console.log(`result:${result}`);

      expect(result).toBeDefined();
      expect(result.sender).toEqual(mockUser1 as User);
      expect(result.receiver).toBeDefined();
      expect(result.receiver.id).toBe(mockInvitationDto.receiverId);
      expect(result.company).toEqual(mockCompany);
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
      expect(invitationRepository.save).toHaveBeenCalledWith(result);
    });

    it('should throw NotFoundException if sender, receiver, or company not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(companyRepository, 'findOne').mockResolvedValueOnce(null); // Fix: добавление проверки на компанию

      await expect(invitationService.sendInvitation(mockInvitationDto, mockUser1 as User)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if sender, receiver, or company not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(invitationService.sendInvitation(mockInvitationDto, mockUser1 as User)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if sender does not have permission to send invitations for this company', async () => {
      const invalidSender = { ...(mockUser1 as User), id: 2 };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(invalidSender);

      await expect(invitationService.sendInvitation(mockInvitationDto, invalidSender)).rejects.toThrowError(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if receiver is already a member or has already sent requests to this company', async () => {
      const existingReceiver = {
        ...(mockUser1 as User),
        id: mockInvitationDto.receiverId,
        invitedCompanies: [mockCompany],
      };
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(mockUser1 as User)
        .mockResolvedValueOnce(existingReceiver as User);

      await expect(invitationService.sendInvitation(mockInvitationDto, mockUser1 as User)).rejects.toThrowError(
        BadRequestException,
      );
    });
    describe('sendRequest', () => {
      it('should send request successfully', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser as User);
        jest.spyOn(companyRepository, 'findOne').mockResolvedValueOnce(mockCompany as Company);
        jest.spyOn(invitationRepository, 'create').mockReturnValueOnce({ ...mockInvitationDto } as any);

        const result = await invitationService.sendRequest(mockInvitationDto, mockUser as User);

        expect(result).toBeDefined();
        expect(result.sender).toEqual(mockUser as User);
        expect(result.receiver).toBeDefined();
        expect(result.receiver).toEqual(mockCompany.owner); // Проверка на то, что получатель - владелец компании
        expect(result.company).toEqual(mockCompany);
        expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
        expect(invitationRepository.save).toHaveBeenCalledWith(result);
      });

      it('should throw NotFoundException if sender, company, or owner not found', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
        jest.spyOn(companyRepository, 'findOne').mockResolvedValueOnce(null);

        await expect(invitationService.sendRequest(mockInvitationDto, mockUser1 as User)).rejects.toThrowError(
          NotFoundException,
        );
      });

      it('should throw BadRequestException if sender is already a member or has sent requests to this company', async () => {
        const existingSender = {
          ...(mockUser1 as User),
          id: mockInvitationDto.receiverId,
          requestedCompanies: [mockCompany],
        };
        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValueOnce(mockUser1 as User)
          .mockResolvedValueOnce(existingSender as User);

        await expect(invitationService.sendRequest(mockInvitationDto, mockUser1 as User)).rejects.toThrowError(
          BadRequestException,
        );
      });
    });
  });
  describe('accept', () => {
    it('should accept invitation and update company members', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(mockInvitation as Invitation);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ id: 2 } as any);
      jest
        .spyOn(companyRepository, 'save')
        .mockResolvedValueOnce({ ...mockInvitation.company, members: [mockInvitation.sender] } as any);
      jest.spyOn(invitationRepository, 'save').mockResolvedValueOnce(mockInvitation as Invitation);

      await invitationService.accept(mockInvitation.id);

      expect(invitationRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockInvitation.id },
        relations: ['sender', 'receiver', 'company'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockInvitation.sender.id } });
      expect(companyRepository.save).toHaveBeenCalledWith({
        ...mockInvitation.company,
        members: [mockInvitation.sender],
      });
      expect(invitationRepository.save).toHaveBeenCalledWith({ ...mockInvitation, status: 'ACCEPTED' });
    });

    it('should throw NotFoundException if invitation not found', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(invitationService.accept(mockInvitation.id)).rejects.toThrowError(NotFoundException);
    });

    it('should throw BadRequestException if invitation status is not "SENT"', async () => {
      const invalidStatusInvitation = { ...mockInvitation, status: 'ACCEPTED' };
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(invalidStatusInvitation as Invitation);

      await expect(invitationService.accept(mockInvitation.id)).rejects.toThrowError(BadRequestException);
    });

    it('should throw NotFoundException if sender not found', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(mockInvitation as Invitation);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(invitationService.accept(mockInvitation.id)).rejects.toThrowError(NotFoundException);
    });
  });
  describe('reject', () => {
    it('should reject invitation and update status', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(mockInvitation as Invitation);
      jest.spyOn(invitationRepository, 'save').mockResolvedValueOnce(mockInvitation as Invitation);

      await invitationService.reject(mockInvitation.id);

      expect(invitationRepository.findOne).toHaveBeenCalledWith({ where: { id: mockInvitation.id } });
      expect(invitationRepository.save).toHaveBeenCalledWith({ ...mockInvitation, status: 'REJECTED' });
    });

    it('should throw NotFoundException if invitation not found', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(invitationService.reject(mockInvitation.id)).rejects.toThrowError(NotFoundException);
    });

    it('should throw BadRequestException if invitation status is not "SENT"', async () => {
      const invalidStatusInvitation = { ...mockInvitation, status: 'ACCEPTED' };
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(invalidStatusInvitation as Invitation);

      await expect(invitationService.reject(mockInvitation.id)).rejects.toThrowError(BadRequestException);
    });
  });
  describe('softDeleteInvitation', () => {
    it('should soft delete invitation successfully', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(mockInvitation as Invitation);
      jest.spyOn(invitationRepository, 'save').mockResolvedValueOnce(mockInvitation as Invitation);

      await invitationService.softDeleteInvitation(mockInvitation.id);

      expect(invitationRepository.findOne).toHaveBeenCalledWith({ where: { id: mockInvitation.id } });
      expect(invitationRepository.save).toHaveBeenCalledWith(mockInvitation as Invitation);
    });

    it('should throw NotFoundException if invitation not found', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(invitationService.softDeleteInvitation(mockInvitation.id)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('getInvitationsForUser', () => {
    it('should get invitations for user successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser as any); // Замените any на тип вашей сущности пользователя
      jest.spyOn(companyRepository, 'createQueryBuilder').mockReturnValueOnce({
        whereInIds: jest.fn().mockReturnValueOnce({ orderBy: jest.fn().mockReturnValueOnce(mockPaginatedData.data) }),
      } as any);

      const result = await invitationService.getInvitationsForUser(
        mockUser.id,
        mockPaginatedData.page,
        mockPaginatedData.limit,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['invitedCompanies'],
      });
      expect(companyRepository.createQueryBuilder).toHaveBeenCalledWith('company');
      expect(result).toEqual(mockPaginatedData);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        invitationService.getInvitationsForUser(mockUser.id, mockPaginatedData.page, mockPaginatedData.limit),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('getRequestedForUser', () => {
    it('should get requested companies for user successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser as any); // Замените any на тип вашей сущности пользователя
      jest.spyOn(companyRepository, 'createQueryBuilder').mockReturnValueOnce({
        whereInIds: jest.fn().mockReturnValueOnce({ orderBy: jest.fn().mockReturnValueOnce(mockPaginatedData.data) }),
      } as any);

      const result = await invitationService.getRequestedForUser(
        mockUser.id,
        mockPaginatedData.page,
        mockPaginatedData.limit,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['requestedCompanies'],
      });
      expect(companyRepository.createQueryBuilder).toHaveBeenCalledWith('company');
      expect(result).toEqual(mockPaginatedData);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        invitationService.getRequestedForUser(mockUser.id, mockPaginatedData.page, mockPaginatedData.limit),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
