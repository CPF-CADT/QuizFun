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

// import bcrypt from "bcrypt";

// export class Encryption {
//     // Hash a password with bcrypt
//     static async hashPassword(password: string): Promise<string> {
//         const saltRounds = 10; // you can increase to 12–14 for more security
//         return await bcrypt.hash(password, saltRounds);
//     }

//     // Verify a password against a stored bcrypt hash
//     static async verifyPassword(storedHashedPassword: string, inputPassword: string): Promise<boolean> {
//         return await bcrypt.compare(inputPassword, storedHashedPassword);
//     }
// }
