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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mongoose_1 = require("mongoose");
const User_1 = require("../model/User");
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
}
exports.UserRepository = UserRepository;
