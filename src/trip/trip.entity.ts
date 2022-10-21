import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Person } from '../person/person.entity';

@Entity()
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  people: Person[];

  @Column('origin_city')
  originCity: string;

  @Column('destination_city')
  destinationCity: string;

  @Column()
  date: Date;
}