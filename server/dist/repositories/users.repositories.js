"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mongoose_1 = require("mongoose");
const User_1 = require("../model/User");
const calculation_1 = require("../service/calculation");
const fuzzysort_1 = __importDefault(require("fuzzysort"));
class UserRepository {
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.UserModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.UserModel.findById(new mongoose_1.Types.ObjectId(id)).exec();
        });
    }
    static create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.UserModel.create(userData);
        });
    }
    static update(id, dataToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.UserModel.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: dataToUpdate }, { new: true }).exec();
        });
    }
    static getAllUsers() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, search) {
            const skip = (page - 1) * limit;
            // Build search query
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            const [users, total] = yield Promise.all([
                User_1.UserModel.find(searchQuery)
                    .select('-password') // Exclude password field
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .exec(),
                User_1.UserModel.countDocuments(searchQuery).exec()
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
        });
    }
    static getUsersByRole(role_1) {
        return __awaiter(this, arguments, void 0, function* (role, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const [users, total] = yield Promise.all([
                User_1.UserModel.find({ role })
                    .select('-password')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .exec(),
                User_1.UserModel.countDocuments({ role }).exec()
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
        });
    }
    static searchUsers(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, limit = 10, excludeIds = []) {
            if (!query) {
                return [];
            }
            const safeQuery = (0, calculation_1.escapeRegex)(query);
            const regex = new RegExp(safeQuery, 'i');
            const candidates = yield User_1.UserModel.find({
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
            const results = fuzzysort_1.default.go(query, candidates, {
                keys: ['name', 'email'],
                threshold: -1000,
            });
            return results.slice(0, limit).map(r => r.obj);
        });
    }
}
exports.UserRepository = UserRepository;
