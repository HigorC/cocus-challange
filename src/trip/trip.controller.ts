import { Body, Controller, Get, Post, Param, Delete, Put } from '@nestjs/common';

import { TripService } from './trip.service';
import { createTripDTO } from './dto/createTrip.dto';
import { updateTripDTO } from './dto/updateTrip.dto';

@Controller("/trips")
export class TripController {

  constructor(private readonly tripService: TripService) { }

  @Post()
  saveTrip(@Body() createTripDTO: createTripDTO) {
    return this.tripService.create(createTripDTO)
  }

  @Get("/:id")
  async getTrip(@Param() params): Promise<Object> {
    return this.tripService.findOne(params.id)
  }

  @Put("/:id")
  async addPeopleIntoTrip(@Param() params, @Body() newPeople: updateTripDTO): Promise<Object> {
    return this.tripService.addPeople(params.id, newPeople)
  }

  @Get()
  async getAllTrip(): Promise<Object> {
    return this.tripService.findAll()
  }

  @Delete("/:id")
  async remove(@Param() params) {
    return this.tripService.remove(params.id)
  }
}
