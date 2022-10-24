import * as bcrypt from 'bcrypt';

export class hash {
    private readonly hashSalts = 10

    encryptString(string: string): Promise<string> {
        return bcrypt.hash(string, this.hashSalts);
    }

    isEqual(string:string, hash:string) {
        // bcrypt.compare()
    }

}