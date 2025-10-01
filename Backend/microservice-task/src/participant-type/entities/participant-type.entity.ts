import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class ParticipantType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
