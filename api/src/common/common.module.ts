import {  Module } from "@nestjs/common";
import { EncrypterBcrypt } from "./hash/encrypter-bcrypt";

@Module({
    providers: [EncrypterBcrypt],
    exports: [EncrypterBcrypt]
})
export class CommonModule { }