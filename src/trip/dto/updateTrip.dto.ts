import { IsNotEmpty } from "class-validator";

export class updateTripDTO {
    @IsNotEmpty()
    People: string[];
}