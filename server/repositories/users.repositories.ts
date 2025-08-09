import { Types } from 'mongoose';
import { UserModel, IUser } from '../model/User';

export type UserData = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>;

export class UserRepository {

  static async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  static async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(new Types.ObjectId(id)).exec();
  }

  static async create(userData: UserData): Promise<IUser> {
    return UserModel.create(userData);
  }

  static async update(id: string, dataToUpdate: Partial<UserData>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate( new Types.ObjectId(id), { $set: dataToUpdate }, { new: true }).exec();
  }
}   