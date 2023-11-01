import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaginatedData } from '../types/interface/paginated.interface';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UsersCreateDto } from './dto/users.create.dto';
import { UsersUpdateDto } from './dto/users.update.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../decorator/getUser.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userDto: UsersCreateDto): Promise<UsersCreateDto> {
    return this.usersService.createUser(userDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateUserDto: UsersUpdateDto,
  ): Promise<UsersUpdateDto> {
    return this.usersService.updateUser(user, Number(id), updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async softDeleteUser(@GetUser() user: User): Promise<void> {
    await this.usersService.softDeleteUser(user);
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
