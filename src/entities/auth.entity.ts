import {Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn} from 'typeorm';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userId: number;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp'})
  deleted_at: Date;
}
