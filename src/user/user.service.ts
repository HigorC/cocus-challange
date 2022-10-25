import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { UserSchema } from './user.schema';
import { createUserDTO } from './dto/createUser.dto';
import { createTripDTO } from './dto/createTrip.dto';
import { Trip, User } from './user.entity';
import { updateTripDTO } from './dto/updateTrip.dto';
import { EncrypterInterface } from '../common/encrypter.interface';

import { v4 as uuidv4 } from 'uuid';
import * as dynamoose from 'dynamoose'

@Injectable()
export class UserService {
  private readonly tableName = 'users';
  private dbInstance = dynamoose.model<User>(this.tableName, UserSchema);
  private readonly logger = new Logger(UserService.name);

  constructor(@Inject("EncrypterInterface") private encrypter: EncrypterInterface) { }

  async createUser(createUserDTO: createUserDTO, traceID: string) {
    const user = await this.findUser(createUserDTO.Username, traceID);

    if (user) {
      throw new HttpException('Username already in use! Please choose another one.', HttpStatus.BAD_REQUEST)
    }

    const hash = await this.encrypter.encrypt(createUserDTO.Password, traceID)

    return this.dbInstance.create({
      Username: createUserDTO.Username,
      Password: hash
    });
  }

  async findUser(username: string, traceID: string): Promise<User> {
    this.logger.log({ traceID,username, message: `Getting the user [${username}]` })

    const user = await this.dbInstance.get({ Username: username });

    if (!user) {
      this.logger.warn({ traceID,username, message: `User [${username}] not found` })
    }

    return user
  }

  async validateUser(username: string, pass: string, traceID: string): Promise<boolean> {
    const user = await this.findUser(username, traceID);

    if (user) {
      return this.encrypter.validate(pass, user.Password, traceID)
    }
    return false
  }

  async createTrip(username: string, createTripDTO: createTripDTO, traceID: string): Promise<User> {
    this.logger.log({ traceID, username, message: `Creating trip` })

    const tripId = uuidv4()

    const newTrip: Trip = {
      TripID: tripId,
      ...createTripDTO
    }

    const user = await this.findUser(username, traceID)

    if (!user.Trips) {
      user.Trips = []
    }

    user.Trips.push(newTrip)

    return this.dbInstance.update(user);
  }

  async findOneTrip(username, tripId: string, traceID: string): Promise<Trip | undefined> {
    const defaultLog = {
      traceID,
      username,
      tripId,
    }

    this.logger.log({ ...defaultLog, message: `Finding trip for the user [${username}]` })

    const user = await this.findUser(username, traceID)

    if (user.Trips) {
      return user.Trips.find((trip) => trip.TripID === tripId)
    }
    this.logger.log({ ...defaultLog, message: `Trip not found` })

    throw new HttpException('Trip not found', HttpStatus.NOT_FOUND)
  }

  async findAllTrips(username: string, traceID: string, origin?: string, destination?: string, date?: string): Promise<Trip[] | undefined> {
    this.logger.log({ traceID, username, message: `Finding all trips for the user [${username}]` })

    const user = await this.findUser(username, traceID)

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

  async addPeopleIntoTrip(username: string, tripId: string, updateTripDTO: updateTripDTO, traceID: string) {
    const defaultLog = {
      traceID,
      username,
      tripId,
    }

    this.logger.log({
      ...defaultLog,
      message: `Adding people inside Trip[${tripId}] for the user [${username}]`
    })

    const user = await this.findUser(username, traceID)

    if (user.Trips) {
      const trip = user.Trips.find((trip) => trip.TripID === tripId)

      if (trip && trip.People) {
        trip.People.push(...updateTripDTO.People)
        return this.dbInstance.update(user)
      }

      this.logger.log({ ...defaultLog, message: `Trip not found` })
      throw new HttpException('Trip not found', HttpStatus.NOT_FOUND)
    }
  }

  async removeTrip(username: string, tripId: string, traceID: string): Promise<Trip[]> {
    const defaultLog = {
      traceID,
      username,
      tripId,
    }

    this.logger.log({
      ...defaultLog,
      message: `Removing Trip[${tripId}] for the user [${username}]`
    })

    const user = await this.findUser(username, traceID)
    if (user && user.Trips) {
      const index = user.Trips.findIndex((trip) => trip.TripID === tripId);
      if (index > -1) {
        user.Trips.splice(index, 1);
      }
    }
    return user.Trips
  }
}
