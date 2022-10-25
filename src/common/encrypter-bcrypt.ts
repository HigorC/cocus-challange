import { EncrypterInterface } from "./encrypter.interface";

import * as bcrypt from 'bcrypt';
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EncrypterBcrypt implements EncrypterInterface {
    private readonly logger = new Logger(EncrypterBcrypt.name);
    private readonly hashSalts = 10

    encrypt(string: string, traceID: string): Promise<string> {
        this.logger.log({ traceID, message: 'Encrypting string' })
        return bcrypt.hash(string, this.hashSalts);
    }

    async validate(string: string, hash: string, traceID: string): Promise<boolean> {
        this.logger.log({ traceID, message: 'Validating hash' })
        const result = await bcrypt.compare(string, hash)

        if (!result) {
            this.logger.warn({ traceID, message: 'Validation failed! Hash is invalid' })
        }
        return result
    }
}