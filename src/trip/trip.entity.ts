import { Item } from "dynamoose/dist/Item";

export class Trip extends Item {
  Id: string;
  People: string[];
  OriginCity: string;
  DestinationCity: string;
  Date: string;
}