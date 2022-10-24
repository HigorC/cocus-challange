import { Injectable } from '@nestjs/common';

import { Model } from 'dynamoose/dist/Model';
import { UserSchema } from './user.schema';
import { createUserDTO } from './dto/createUser.dto';
import { createTripDTO } from './dto/createTrip.dto';
import { Trip, User } from './user.entity';
import { updateTripDTO } from './dto/updateTrip.dto';

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as dynamoose from 'dynamoose'

// export type User = any;
@Injectable()
export class UserService {
  private dbInstance: Model<User>;
  private readonly hashSalts = 10

  constructor() {
    const tableName = 'users';
    this.dbInstance = dynamoose.model<User>(tableName, UserSchema);
  }

  async create(createUserDTO: createUserDTO) {
    const hash = await bcrypt.hash(createUserDTO.Password, this.hashSalts);

    return this.dbInstance.create({
      Username: createUserDTO.Username,
      Password: hash
    });
  }

  async findOne(username: string): Promise<User> {
    return this.dbInstance.get({ Username: username });
  }

  async validateUser(username: string, pass: string): Promise<boolean> {
    const user = await this.findOne(username);

    if (user) {
      return bcrypt.compare(pass, user.Password)
    }
    return false
  }

  async createTrip(username: string, createTripDTO: createTripDTO): Promise<User> {
    const tripId = uuidv4()

    const newTrip: Trip = {
      TripID: tripId,
      ...createTripDTO
    }

    const user = await this.findOne(username)

    if (!user.Trips) {
      user.Trips = []
    }

    user.Trips.push(newTrip)

    return this.dbInstance.update(user);
  }

  async findOneTrip(username, tripId: string): Promise<Trip | undefined> {
    const user = await this.findOne(username)

    if (user.Trips) {
      return user.Trips.find((trip) => trip.TripID === tripId)
    }
    return undefined
  }

  async findAllTrips(username: string): Promise<Trip[] | undefined> {
    const user = await this.findOne(username)
    return user.Trips
  }

  async addPeopleIntoTrip(username: string, tripId: string, updateTripDTO: updateTripDTO) {
    const user = await this.findOne(username)

    if (user.Trips) {
      const trip = user.Trips.find((trip) => trip.TripID === tripId)

      if (trip && trip.People) {
        trip.People.push(...updateTripDTO.People)
        return this.dbInstance.update(user)
      }
    }
  }

  async removeTrip(username: string, tripId: string): Promise<Trip[]> {
    const user = await this.findOne(username)
    if (user && user.Trips) {
      const index = user.Trips.findIndex((trip) => trip.TripID === tripId);
      if (index > -1) {
        user.Trips.splice(index, 1);
      }
    }
    return user.Trips
  }
}
