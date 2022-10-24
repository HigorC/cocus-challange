import { Controller, Request, Post, UseGuards, Body, Get, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { createTripDTO } from './dto/createTrip.dto';
import { updateTripDTO } from './dto/updateTrip.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService, private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post()
  async saveUser(@Body() createUserDTO) {
    const user = await this.userService.create(createUserDTO)
    if (user) {
      return `User ${user.Username} created successufuly`
    }
    throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:userId/trips')
  saveTrip(@Body() createTripDTO: createTripDTO, @Param() params) {
    return this.userService.createTrip(params.userId, createTripDTO)
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:userId/trips/:tripId")
  async getTrip(@Param() params): Promise<Object> {
    return this.userService.findOneTrip(params.userId, params.tripId)
  }

  @UseGuards(JwtAuthGuard)
  @Put("/:userId/trips/:tripId")
  async addPeopleIntoTrip(@Param() params, @Body() newPeople: updateTripDTO): Promise<Object> {
    return this.userService.addPeopleIntoTrip(params.userId, params.tripId, newPeople)
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:userId/trips")
  async getAllTrip(@Param() params): Promise<Object> {
    return this.userService.findAllTrips(params.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/:userId/trips/:tripId")
  async remove(@Param() params) {
    return this.userService.removeTrip(params.userId, params.tripId)
  }
}
