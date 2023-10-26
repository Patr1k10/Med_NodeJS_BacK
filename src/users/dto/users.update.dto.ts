import {IsString, IsOptional, Length} from 'class-validator';

export class UsersUpdateDto {

  @IsOptional()
  @IsString()
  @Length(1, 30)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  lastName?: string;

}
