import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { UserSchema } from './user.schema';
import { createUserDTO } from './dto/createUser.dto';
import { createTripDTO } from './dto/createTrip.dto';
import { Trip, User } from './user.entity';
import { updateTripDTO } from './dto/updateTrip.dto';
import { IEncrypter } from '../common/hash/encrypter.interface';

import { v4 as uuidv4 } from 'uuid';
import * as dynamoose from 'dynamoose'

@Injectable()
export class UserService {
  private readonly tableName = 'users';
  private dbInstance = dynamoose.model<User>(this.tableName, UserSchema);
  private readonly logger = new Logger(UserService.name);

  constructor(@Inject("EncrypterInterface") private encrypter: IEncrypter) { }

  /**
   * Creates a new user, if it's doesn't exists.
   * 
   * @param createUserDTO new user information
   * @param traceID
   * @returns created user
   */
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

  /**
   * Try to find a user.
   *
   * @param username searched username
   * @param traceID 
   * @returns user, if founded
   */
  async findUser(username: string, traceID: string): Promise<User> {
    this.logger.log({ traceID, username, message: `Getting the user [${username}]` })

    const user = await this.dbInstance.get({ Username: username });

    if (!user) {
      this.logger.warn({ traceID, username, message: `User [${username}] not found` })
    }

    return user
  }

  /**
   * Check if a passed string is the same as the saved password.
   *
   * @param username
   * @param password 
   * @param traceID 
   * @returns boolean
   */
  async validateUser(username: string, password: string, traceID: string): Promise<boolean> {
    const user = await this.findUser(username, traceID);

    if (user) {
      return this.encrypter.validate(password, user.Password, traceID)
    }
    return false
  }

  /**
   * Create a new trip to a specific user.
   *
   * @param username 
   * @param createTripDTO trip information
   * @param traceID 
   * @returns the uploaded user
   */
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

  /**
   * Try to find a trip of a specific user.
   *
   * @param username 
   * @param tripId searched tripID
   * @param traceID 
   * @returns Trip, if founded
   */
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

  /**
   * Returns all trip's of a specific user.
   * Trips could be filtered by some parameters: origin,destination and date.
   *
   * @param username 
   * @param traceID 
   * @param origin param to filter
   * @param destination param to filter
   * @param date param to filter
   * @returns Trips founded with the passed params
   */
  async findAllTrips(username: string, traceID: string, origin?: string, destination?: string, date?: string): Promise<Trip[] | undefined> {
    this.logger.log({ traceID, username, message: `Finding all trips for the user [${username}]` })

    const user = await this.findUser(username, traceID)

    if (!user) throw new HttpException(`User [${username}] not found`, HttpStatus.NOT_FOUND)

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

  /**
   * Add a list of people in a specific trip.
   *
   * @param username 
   * @param tripId TripID to add the new people
   * @param updateTripDTO new people names
   * @param traceID 
   * @returns 
   */
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
        await this.dbInstance.update(user)
        return user.Trips
      }

      this.logger.log({ ...defaultLog, message: `Trip not found` })
      throw new HttpException('Trip not found', HttpStatus.NOT_FOUND)
    }
    throw new HttpException('This user doesnt have any Trip', HttpStatus.NOT_FOUND)
  }

  /**
   * Remove a specific trip of a specific user
   *
   * @param username 
   * @param tripId TripID to be removed
   * @param traceID 
   * @returns uploaded list of trips
   */
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
