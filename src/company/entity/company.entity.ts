import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Invitation } from '../../invitation/entity/invitation.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  isVisible: boolean;

  @ManyToOne(() => User, (user) => user.companies)
  owner: User;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  members: User[];

  @OneToMany(() => Invitation, (invitation) => invitation.company)
  invitations: Invitation[];
}
