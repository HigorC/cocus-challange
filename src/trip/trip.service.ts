import { Injectable, Inject } from '@nestjs/common';
import { Trip } from './trip.entity';
import { Model } from "dynamoose/dist/Model";
import * as dynamoose from "dynamoose"
import { TripSchema } from './trip.schema';
import { createTripDTO } from './dto/createTrip.dto';
import { v4 as uuidv4 } from 'uuid';
import { updateTripDTO } from './dto/updateTrip.dto';

@Injectable()
export class TripService {
  private dbInstance: Model<Trip>;

  constructor() {
    const tableName = 'trips';
    this.dbInstance = dynamoose.model<Trip>(tableName, TripSchema);
  }

  async create(createTripDTO: createTripDTO) {
    const id = uuidv4()
    
    return this.dbInstance.create({
      Id: id,
      ...createTripDTO
    });
  }

  async findOne(id: string) {
    return this.dbInstance.get({ Id: id });
  }

  async findAll(): Promise<Trip[]> {
    return this.dbInstance.scan().exec()
  }

  async addPeople(id: string, updateTripDTO: updateTripDTO) {
    const trip = await this.findOne(id)
    console.log(trip);

    return this.dbInstance.update({
      Id: id,
      People: [...trip.People, ...updateTripDTO.People]
    });
  }

  async remove(id: string) {
    return this.dbInstance.delete({ Id: id });
  }
}