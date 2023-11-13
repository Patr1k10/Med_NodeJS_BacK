import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersCreateDto } from './dto/users.create.dto';
import { UsersUpdateDto } from './dto/users.update.dto';
import { PaginatedData } from '../types/interface';
import { User } from './entities/user.entity';
import { paginate } from '../common/pagination';

export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userDto: UsersCreateDto): Promise<UsersCreateDto> {
    const existingUser = await this.userRepository.findOne({
      where: {
        username: userDto.username,
      },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await this.hashPassword(userDto.password);
    const user = this.userRepository.create({ ...userDto, password: hashedPassword });
    this.logger.log(`Successfully create user with ID: ${user.id}`);
    return await this.userRepository.save(user);
  }

  async updateUser(userId: number, updateUserDto: UsersUpdateDto): Promise<UsersUpdateDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new NotFoundException('User not found');
    }
    const updatedUser = { ...user, ...updateUserDto };
    return this.userRepository.save(updatedUser);
  }

  async softDeleteUser(id: number): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`Successfully soft-deleted user with ID: ${id}`);
  }
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User is not found');
    }
    return user;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedData<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('User');
    return paginate<User>(this.userRepository, queryBuilder, +page, +limit);
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return `${salt}:${derivedKey}`;
    } catch (error) {
      this.logger.error(`Error hashing password: ${error.message}`);
      throw error;
    }
  }
}
