import { Module } from '@nestjs/common';
import { TripsModule } from './trip/trip.module';
import { PersonModule } from './person/person.module';

@Module({
  imports: [TripsModule, PersonModule],
})
export class AppModule { }
