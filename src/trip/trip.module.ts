import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TripController } from './trip.controller';
import { tripProviders } from './trip.provider';
import { TripService } from './trip.service';

@Module({
    imports: [DatabaseModule],
    controllers: [TripController],
    providers: [
        ...tripProviders,
        TripService,
    ],
})
export class TripsModule { }
