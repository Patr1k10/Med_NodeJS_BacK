import {IsString, IsEmail, IsEnum, IsOptional, Length} from 'class-validator';
import {UserRole} from "../../types/enums/user.role";
export class UsersUpdateDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(6, 30)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole;
}
