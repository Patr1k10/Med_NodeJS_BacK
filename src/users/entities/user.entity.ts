import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../types/enums/user.role';
import { Company } from '../../company/entity/company.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: true })
  username: string | null;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ nullable: true })
  password: string | null;

  @Column({
    type: 'enum',
    enum: ['admin', 'moderator', 'user'],
    default: 'user',
  })
  role: UserRole;

  @OneToMany(() => Company, (company) => company.owner)
  companies: Company[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;
}
