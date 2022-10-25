import { Inject, Injectable } from '@nestjs/common';

import { Model } from 'dynamoose/dist/Model';
import { UserSchema } from './user.schema';
import { createUserDTO } from './dto/createUser.dto';
import { createTripDTO } from './dto/createTrip.dto';
import { Trip, User } from './user.entity';
import { updateTripDTO } from './dto/updateTrip.dto';

import { v4 as uuidv4 } from 'uuid';
import * as dynamoose from 'dynamoose'
import { EncrypterInterface } from '../common/encrypter.interface';

@Injectable()
export class UserService {
  private dbInstance: Model<User>;

  constructor(@Inject("EncrypterInterface") private encrypter: EncrypterInterface) {
    const tableName = 'users';
    this.dbInstance = dynamoose.model<User>(tableName, UserSchema);
  }

  async create(createUserDTO: createUserDTO) {
    const hash  = await this.encrypter.encrypt(createUserDTO.Password)

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
      return this.encrypter.validate(pass, user.Password)
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

  async findAllTrips(username: string, origin?: string, destination?: string, date?: string): Promise<Trip[] | undefined> {
    const user = await this.findOne(username)

    const filteredTrips = user.Trips && user.Trips.filter((trip) => {
      if (origin && trip.OriginCity !== origin) {
        return false
      }
      if (destination && trip.DestinationCity !== destination) {
        return false
      }
      if (date && trip.Date !== date) {
        return false
      }
      return true
    })

    return filteredTrips
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
