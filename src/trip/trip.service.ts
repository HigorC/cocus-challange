import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';

@Injectable()
export class TripService {
  constructor(
    @Inject('TRIP_REPOSITORY')
    private tripRepository: Repository<Trip>,
  ) {}

  async findAll(): Promise<Trip[]> {
    return this.tripRepository.find();
  }
}