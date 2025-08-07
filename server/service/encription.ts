import { createHash } from 'crypto';

export class Encryption {
    static hashPassword(password: string): string {
        return createHash('sha256').update(password).digest('hex');
    }
    static verifyPassword(storedHashedPassword: string, inputPassword: string): boolean {
        const hashedInput = this.hashPassword(inputPassword);
        return hashedInput === storedHashedPassword;
    }
}