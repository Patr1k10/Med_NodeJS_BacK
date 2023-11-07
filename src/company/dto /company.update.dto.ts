import { IsString, IsBoolean, Length } from 'class-validator';
export class CompanyUpdateDto {
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsString()
  @Length(1, 500)
  description?: string;

  @IsBoolean()
  isVisible?: boolean;
}
