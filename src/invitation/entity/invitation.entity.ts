import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../company/entity/company.entity';
import { InvitationStatus } from '../../types/enums/invitation.status';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.invitedCompanies)
  sender: User;

  @ManyToOne(() => User, (user) => user.requestedCompanies)
  receiver: User;

  @ManyToOne(() => Company, (company) => company.invitations)
  company: Company;

  @Column({ default: false })
  isRequest: boolean;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.SENT,
  })
  status: InvitationStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;
}
