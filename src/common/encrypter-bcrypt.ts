import { EncrypterInterface } from "./encrypter.interface";

import * as bcrypt from 'bcrypt';
import { Injectable } from "@nestjs/common";

@Injectable()
export class EncrypterBcrypt implements EncrypterInterface {
    private readonly hashSalts = 10

    encrypt(string: string): Promise<string> {
        return bcrypt.hash(string, this.hashSalts);
    }
    
    validate(string: string, hash: string): Promise<boolean> {
        return bcrypt.compare(string,hash)
    }
}