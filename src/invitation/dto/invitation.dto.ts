import { IsInt, IsNotEmpty } from 'class-validator';

export class InvitationDto {
  @IsInt()
  @IsNotEmpty()
  senderId?: number;

  @IsInt()
  @IsNotEmpty()
  receiverId?: number;

  @IsInt()
  @IsNotEmpty()
  companyId?: number;
}
