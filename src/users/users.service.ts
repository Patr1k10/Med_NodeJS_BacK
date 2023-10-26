import {BadRequestException, ConflictException, Logger, NotFoundException} from '@nestjs/common';
import * as crypto from 'crypto';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entities/user.entity";
import {Repository} from "typeorm";
import {UsersCreateDto} from "./dto/users.create.dto";
import {UsersUpdateDto} from "./dto/users.update.dto";

export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name)
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
  }

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
    return this.userRepository.save(user);

  }

  async updateUser(id: number, updateUserDto: UsersUpdateDto): Promise<UsersUpdateDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.username) {
      const existingUser = await this.userRepository.findOne({ where: { username: updateUserDto.username } });
      if (existingUser && existingUser.id !== id) {
        this.logger.warn(`Username already exists: ${updateUserDto.username}`);
        throw new ConflictException('Username already exists');
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    this.logger.log(`Successfully updated user with ID: ${id}`);
    return this.userRepository.save({ ...user, ...updateUserDto });
  }

  async softDeleteUser(id: number): Promise<void> {
    this.logger.log(`Attempting to soft-delete user with ID: ${id}`);
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`Successfully soft-deleted user with ID: ${id}`);
  }
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.createQueryBuilder('user').where({ id }).getOne();
    if (!user) {
      throw new Error('User is not found');
    }
    if (!user.id || typeof user.id !== 'number' || Number.isNaN(user.id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return user;
  }

  async hashPassword(password: string): Promise<string> {
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
