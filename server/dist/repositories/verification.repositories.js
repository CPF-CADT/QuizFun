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
exports.VerificationCodeRepository = void 0;
const VerificationToken_1 = require("../model/VerificationToken");
const mongoose_1 = require("mongoose");
class VerificationCodeRepository {
    static create(userId, Code, expiresAt) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationCode = new VerificationToken_1.VerificationCodeModel({
                userId: new mongoose_1.Types.ObjectId(userId),
                Code: Code.toString(),
                expiresAt,
            });
            yield verificationCode.save();
        });
    }
    static find(userId, Code) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundCode = yield VerificationToken_1.VerificationCodeModel.findOne({
                userId: new mongoose_1.Types.ObjectId(userId),
                Code: Code,
            }).exec();
            if (!foundCode)
                return null;
            return { id: foundCode.id.toString(), userId: foundCode.userId.toString() };
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield VerificationToken_1.VerificationCodeModel.findByIdAndDelete(new mongoose_1.Types.ObjectId(id)).exec();
        });
    }
    static deleteByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield VerificationToken_1.VerificationCodeModel.deleteMany({ userId: new mongoose_1.Types.ObjectId(userId) }).exec();
        });
    }
}
exports.VerificationCodeRepository = VerificationCodeRepository;
