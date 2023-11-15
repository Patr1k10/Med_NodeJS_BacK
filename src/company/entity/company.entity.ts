import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Invitation } from '../../invitation/entity/invitation.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';

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
  admins: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  members: User[];

  @OneToMany(() => Invitation, (invitation) => invitation.company)
  invitations: Invitation[];

  @OneToMany(() => Quiz, (quiz) => quiz.company, { cascade: true })
  quizzes: Quiz[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;
}
