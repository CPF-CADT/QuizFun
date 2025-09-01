import { Types } from 'mongoose';
import { UserModel,IUserData } from '../model/User';
import { escapeRegex } from '../service/calculation';
import fuzzysort from 'fuzzysort';

export type UserData = Omit<IUserData, '_id' | 'createdAt' | 'updatedAt'>;

export interface PaginatedUsers {
  users: IUserData[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class UserRepository {

  static async findByEmail(email: string): Promise<IUserData | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  static async findById(id: string): Promise<IUserData | null> {
    return UserModel.findById(new Types.ObjectId(id)).exec();
  }

  static async create(userData: IUserData): Promise<IUserData> {
    return UserModel.create(userData);
  }

  static async update(id: string, dataToUpdate: Partial<UserData>): Promise<IUserData | null> {
    return UserModel.findByIdAndUpdate( new Types.ObjectId(id), { $set: dataToUpdate }, { new: true }).exec();
  }

  static async getAllUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedUsers> {
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery: any = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(searchQuery)
        .select('-password') // Exclude password field
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      UserModel.countDocuments(searchQuery).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  static async getUsersByRole(role: string, page: number = 1, limit: number = 10): Promise<PaginatedUsers> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find({ role })
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      UserModel.countDocuments({ role }).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
  static async searchUsers(query: string, limit: number = 10, excludeIds: string[] = []): Promise<IUserData[]> {
        if (!query) {
            return [];
        }

        const safeQuery = escapeRegex(query);
        const regex = new RegExp(safeQuery, 'i'); 

        const candidates = await UserModel.find({
            $and: [
                { _id: { $nin: excludeIds } }, 
                {
                    $or: [
                        { name: regex },
                        { email: regex }
                    ]
                }
            ]
        }).limit(50).lean();

        const results = fuzzysort.go(query, candidates, {
            keys: ['name', 'email'],
            threshold: -1000, 
        });

        return results.slice(0, limit).map(r => r.obj);
    }
}   