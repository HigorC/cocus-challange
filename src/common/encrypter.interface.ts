export interface EncrypterInterface {
    encrypt(string: string): Promise<string>
    validate(string: string, hash: string): Promise<boolean>
}