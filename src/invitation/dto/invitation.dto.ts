import { IsBoolean, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { InvitationStatus } from '../../types/enums/invitation.status';

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
