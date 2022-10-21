import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripsModule } from './trip/trip.module';
import { PersonModule } from './person/person.module';
import { TripService } from './trip/trip.service';

@Module({
  imports: [TripsModule, PersonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
