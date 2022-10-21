import { Controller, Get } from '@nestjs/common';
import { TripService } from './trip.service';

@Controller()
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get('/trips')
  getTrips(): string {
    console.log( this.tripService.findAll());
    return 'oi'
  }
}
