import { Controller, Request, Post, UseGuards, Body, Get, Param, Put, Delete, HttpException, HttpStatus, Query, Res, Req } from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { createTripDTO } from './dto/createTrip.dto';
import { updateTripDTO } from './dto/updateTrip.dto';
import { Trip } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService, private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user, req.generatedTraceID);
  }

  @Post()
  async saveUser(@Req() req, @Body() createUserDTO) {
    const user = await this.userService.createUser(createUserDTO, req.generatedTraceID)
    if (user) {
      return `User ${user.Username} created successufuly`
    }
    throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:userId/trips')
  saveTrip(@Req() req, @Body() createTripDTO: createTripDTO, @Param() params) {
    return this.userService.createTrip(params.userId, createTripDTO, req.generatedTraceID)
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:userId/trips/:tripId")
  async getTrip(@Req() req, @Param() params): Promise<Object> {
    return this.userService.findOneTrip(params.userId, params.tripId, req.generatedTraceID)
  }

  @UseGuards(JwtAuthGuard)
  @Put("/:userId/trips/:tripId")
  async addPeopleIntoTrip(
    @Req() req,
    @Param() params,
    @Body() newPeople: updateTripDTO
  ): Promise<Object> {
    return this.userService.addPeopleIntoTrip(params.userId, params.tripId, newPeople, req.generatedTraceID)
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:userId/trips")
  async getAllTrip(
    @Req() req,
    @Param() params,
    @Query('origin') origin,
    @Query('destination') destination,
    @Query('date') date,
  ): Promise<Trip[]> {
    return this.userService.findAllTrips(params.userId, req.generatedTraceID, origin, destination, date)
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/:userId/trips/:tripId")
  async remove(@Req() req, @Param() params) {
    return this.userService.removeTrip(params.userId, params.tripId, req.generatedTraceID)
  }
}
