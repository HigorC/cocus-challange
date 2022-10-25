import { Item } from "dynamoose/dist/Item";

export class Trip {
  TripID: string;
  People: string[];
  OriginCity: string;
  DestinationCity: string;
  Date: string;
}

export class User extends Item {
  Username: string;
  Password: string;
  Trips: Trip[] = []
}