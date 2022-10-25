export interface IEncrypter {
    encrypt(string: string, traceID: string): Promise<string>
    validate(string: string, hash: string, traceID: string): Promise<boolean>
}