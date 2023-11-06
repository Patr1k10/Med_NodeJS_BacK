import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional, Length } from 'class-validator';
import { UserRole } from '../../types/enums/user.role';

export class UsersCreateDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 30)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 30)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 30)
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole = UserRole.USER;
}
