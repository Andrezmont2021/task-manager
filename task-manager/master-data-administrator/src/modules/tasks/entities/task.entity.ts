import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'task' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 15 })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
