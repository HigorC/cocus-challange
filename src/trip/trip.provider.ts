import { DataSource } from 'typeorm';
import { Trip } from './trip.entity';

export const tripProviders = [
  {
    provide: 'TRIP_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Trip),
    inject: ['DATA_SOURCE'],
  },
];