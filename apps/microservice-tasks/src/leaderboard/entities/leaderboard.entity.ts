import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { PrimaryGeneratedColumn, Entity, Column, ManyToOne, Index } from 'typeorm';
import { IsNumber, IsNotEmpty, IsOptional, Min, IsObject } from 'class-validator';

@Entity('leaderboard')
@Index(['dashboard', 'userId'], { unique: true }) 
export class Leaderboard {
  
  @PrimaryGeneratedColumn()
  @IsOptional()
  @IsNumber()
  id?: number;

  @Column()
  @IsNotEmpty({ message: 'El userId no puede ser nulo' })
  @IsNumber({}, { message: 'El userId debe ser un número' })
  userId: number;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @IsNotEmpty({ message: 'La relación dashboard es obligatoria' })
  @IsObject({ message: 'Debe proporcionar un objeto Dashboard válido' })
  dashboard: Dashboard;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  totalPoints: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  tasksCompleted: number;
}