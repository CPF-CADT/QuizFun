import bcrypt from "bcrypt";

export class Encryption {
    // Hash a password with bcrypt
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10; // you can increase to 12–14 for more security
        return await bcrypt.hash(password, saltRounds);
    }

    // Verify a password against a stored bcrypt hash
    static async verifyPassword(storedHashedPassword: string, inputPassword: string): Promise<boolean> {
        return await bcrypt.compare(inputPassword, storedHashedPassword);
    }
}
