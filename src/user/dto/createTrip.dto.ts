import {  IsDateString, IsNotEmpty } from "class-validator";

export class createTripDTO {
    @IsNotEmpty()
    People: string[];

    @IsNotEmpty()
    OriginCity: string;

    @IsNotEmpty()
    DestinationCity: string;

    @IsNotEmpty()
    @IsDateString()
    Date: string;
}