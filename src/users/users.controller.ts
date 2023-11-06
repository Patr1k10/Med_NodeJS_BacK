import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersCreateDto } from './dto/users.create.dto';
import { UsersUpdateDto } from './dto/users.update.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedData } from '../types/interface';
import { AppGuard } from '../auth/guard/app.guard';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userDto: UsersCreateDto): Promise<UsersCreateDto> {
    return this.usersService.createUser(userDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AppGuard)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UsersUpdateDto): Promise<UsersUpdateDto> {
    return this.usersService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AppGuard)
  async softDeleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.softDeleteUser(+id);
  }

  @Get(':id')
  async getUserById(@Param() params?: User): Promise<User> {
    return this.usersService.getUserById(params.id);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10): Promise<PaginatedData<User>> {
    return this.usersService.findAll(+page, +limit);
  }
}
