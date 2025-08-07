import { UserModel, IUser } from '../model/User';

// This is a simplified representation of the User object you might use internally.
// In a real app, you might have more complex DTOs (Data Transfer Objects).
export type UserData = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>;

export class UserRepository {

  static async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  static async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  static async create(userData: UserData): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  static async update(id: string, dataToUpdate: Partial<UserData>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, { $set: dataToUpdate }, { new: true }).exec();
  }
}