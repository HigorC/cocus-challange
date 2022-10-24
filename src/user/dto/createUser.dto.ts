import { IsNotEmpty } from "class-validator";

export class createUserDTO {
    @IsNotEmpty()
    Username: string;

    @IsNotEmpty()
    Password: string;
}