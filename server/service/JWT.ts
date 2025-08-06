import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

export default class JWT {
    private static JWT_SECRET = process.env.JWT_SECRET as string;

    static create({ id, phone_number, email,role }: { id: number; phone_number?: string,email?:string ,role:string}): string {
        return jwt.sign(
            {
                id , phone_number,email,role

            },
            JWT.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static verify(token: string): any {
        if (!token) {
            throw new Error('Access token missing');
        }

        try {
            return jwt.verify(token, JWT.JWT_SECRET);
        } catch (err) {
            throw new Error('Invalid or expired token');
        }   
    }
}