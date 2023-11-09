import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CompanyCreateDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  description: string;
}
