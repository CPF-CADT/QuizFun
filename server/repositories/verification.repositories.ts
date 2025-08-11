import { IVerificationCode, VerificationCodeModel } from '../model/VerificationToken';
import { Types } from 'mongoose';

export class VerificationCodeRepository {

static async create(userId: string, Code: number, expiresAt: Date): Promise<void> {
    const verificationCode = new VerificationCodeModel({
        userId: new Types.ObjectId(userId),
        Code: Code.toString(),
        expiresAt,
    });
    await verificationCode.save();
}


    static async find(userId: string, Code: number): Promise<{ id: string; userId: string } | null> {
          const foundCode = await VerificationCodeModel.findOne({
            userId: new Types.ObjectId(userId),
            Code: Code,
        }).exec() as IVerificationCode;

        if (!foundCode) return null;

        return { id: foundCode.id.toString(), userId: foundCode.userId.toString() };
    }

    static async delete(id: string): Promise<void> {
        await VerificationCodeModel.findByIdAndDelete( new Types.ObjectId(id)).exec();
    }


    static async deleteByUserId(userId: string): Promise<void> {
        await VerificationCodeModel.deleteMany({ userId: new Types.ObjectId(userId) }).exec();
    }
}