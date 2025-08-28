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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzRepositories = void 0;
const mongoose_1 = require("mongoose");
const Quiz_1 = require("../model/Quiz");
const GameSession_1 = require("../model/GameSession");
const GameHistory_1 = require("../model/GameHistory");
const fuzzysort_1 = __importDefault(require("fuzzysort"));
const calculation_1 = require("../service/calculation");
class QuizzRepositories {
    static getAllQuizzes(page_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (page, limit, sortBy = "createdAt", sortOrder = "desc", searchQuery, tags, userId, owner) {
            const offset = (page - 1) * limit;
            const filter = {};
            if (owner === "me" && userId) {
                filter.$and = [
                    {
                        $or: [
                            { creatorId: new mongoose_1.Types.ObjectId(userId) },
                            { forkBy: new mongoose_1.Types.ObjectId(userId) }
                        ]
                    },
                    {
                        visibility: { $in: ["public", "private"] }
                    }
                ];
            }
            else if (owner === "others" && userId) {
                filter.$and = [
                    { creatorId: { $ne: new mongoose_1.Types.ObjectId(userId) } },
                    { visibility: "public" }
                ];
            }
            else {
                filter.visibility = "public";
            }
            if (searchQuery) {
                const safeQuery = (0, calculation_1.escapeRegex)(searchQuery);
                const searchFilter = {
                    $or: [
                        { title: { $regex: safeQuery, $options: "i" } },
                        { description: { $regex: safeQuery, $options: "i" } }
                    ]
                };
                if (filter.$and) {
                    filter.$and.push(searchFilter);
                }
                else {
                    filter.$and = [searchFilter];
                }
            }
            if (tags && tags.length > 0) {
                const tagFilter = { tags: { $in: tags } };
                if (filter.$and) {
                    filter.$and.push(tagFilter);
                }
                else {
                    filter.$and = [tagFilter];
                }
            }
            const validSortFields = ["createdAt", "title", "updatedAt"];
            const sort = {
                [validSortFields.includes(sortBy) ? sortBy : "createdAt"]: sortOrder === "asc" ? 1 : -1,
            };
            let candidates = yield Quiz_1.QuizModel.find(filter)
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean();
            let total = yield Quiz_1.QuizModel.countDocuments(filter);
            if (searchQuery) {
                const fuzzyResults = fuzzysort_1.default.go(searchQuery, candidates, {
                    keys: ["title", "description"],
                    threshold: -1000,
                });
                candidates = fuzzyResults.map(r => r.obj);
                total = candidates.length;
            }
            const quizzes = yield Promise.all(candidates.map((quiz) => __awaiter(this, void 0, void 0, function* () {
                const sessions = yield GameSession_1.GameSessionModel.find({ quizId: quiz._id }).lean();
                const totalPlayers = sessions.reduce((sum, s) => { var _a; return sum + (((_a = s.results) === null || _a === void 0 ? void 0 : _a.length) || 0); }, 0);
                let ratingCount = 0;
                let ratingSum = 0;
                sessions.forEach(s => {
                    if (s.feedback && s.feedback.length > 0) {
                        ratingCount += s.feedback.length;
                        ratingSum += s.feedback.reduce((a, f) => a + f.rating, 0);
                    }
                });
                const averageRating = ratingCount > 0 ? ratingSum / ratingCount : null;
                return Object.assign(Object.assign({}, quiz), { totalPlayers, rating: {
                        count: ratingCount,
                        average: averageRating,
                    } });
            })));
            return {
                quizzes: quizzes,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            };
        });
    }
    static getQuizz(qId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(qId)) {
                throw new Error("Invalid quiz ID");
            }
            return Quiz_1.QuizModel.findById(qId).lean();
        });
    }
    static createQuizz(quizz) {
        return __awaiter(this, void 0, void 0, function* () {
            return Quiz_1.QuizModel.create(quizz);
        });
    }
    static getQuizzByUser(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10, search) {
            var _a, _b, _c;
            if (!userId)
                return { total: 0, quizzes: [] };
            const objectId = new mongoose_1.Types.ObjectId(userId);
            const skip = (page - 1) * limit;
            // Base query to find quizzes created or forked by the user
            const matchQuery = {
                $or: [{ forkBy: objectId }, { creatorId: objectId }],
            };
            // If a search term is provided, add a case-insensitive regex search on the title
            if (search && search.trim() !== '') {
                matchQuery.title = { $regex: search, $options: 'i' };
            }
            const result = yield Quiz_1.QuizModel.aggregate([
                { $match: matchQuery },
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        quizzes: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                    },
                },
            ]).exec();
            const total = ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.total[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
            const quizzes = ((_c = result[0]) === null || _c === void 0 ? void 0 : _c.quizzes) || [];
            return { total, quizzes };
        });
    }
    static addQuestion(quizId, question) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Quiz_1.QuizModel.updateOne({ _id: new mongoose_1.Types.ObjectId(quizId) }, { $push: { questions: question } });
            return result.modifiedCount > 0;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Quiz_1.QuizModel.findById(id).lean().exec();
        });
    }
    static updateQuestion(quizzId, questionId, questionUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield Quiz_1.QuizModel.findOneAndUpdate({
                _id: new mongoose_1.Types.ObjectId(quizzId),
                "questions._id": new mongoose_1.Types.ObjectId(questionId),
            }, {
                $set: Object.entries(questionUpdate).reduce((acc, [k, v]) => {
                    acc[`questions.$.${k}`] = v;
                    return acc;
                }, {}),
            }, { new: true }).exec();
            if (!quiz)
                return null;
            return quiz.questions.find((q) => q._id.toString() === questionId) || null;
        });
    }
    static updateOption(quizzId, questionId, optionId, optionUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield Quiz_1.QuizModel.findOneAndUpdate({
                $match: { _id: new mongoose_1.Types.ObjectId(quizzId) },
                "questions._id": questionId,
                "questions.options._id": optionId,
            }, {
                $set: Object.entries(optionUpdate).reduce((acc, [k, v]) => {
                    acc[`questions.$[q].options.$[o].${k}`] = v;
                    return acc;
                }, {}),
            }, {
                new: true,
                arrayFilters: [
                    { "q._id": new mongoose_1.Types.ObjectId(questionId) },
                    { "o._id": new mongoose_1.Types.ObjectId(optionId) },
                ],
            }).exec();
            if (!quiz)
                return null;
            const question = quiz.questions.find((q) => q._id.toString() === questionId);
            if (!question)
                return null;
            return question.options.find((o) => o._id.toString() === optionId) || null;
        });
    }
    static deleteQuestion(quizzId, questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Quiz_1.QuizModel.updateOne({ _id: new mongoose_1.Types.ObjectId(quizzId) }, { $pull: { questions: { _id: new mongoose_1.Types.ObjectId(questionId) } } }).exec();
            return result.modifiedCount > 0;
        });
    }
    static deleteOption(quizzId, questionId, optionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Quiz_1.QuizModel.updateOne({
                $match: { _id: new mongoose_1.Types.ObjectId(quizzId) },
                "questions._id": questionId,
            }, { $pull: { "questions.$.options": { _id: optionId } } }).exec();
            return result.modifiedCount > 0;
        });
    }
    static deleteQuizz(quizzId, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Quiz_1.QuizModel.deleteOne({
                _id: new mongoose_1.Types.ObjectId(quizzId),
                $or: [{ creatorId: ownerId }, { forkBy: ownerId }],
            }).exec();
            return result.deletedCount > 0;
        });
    }
    static updateQuizz(quizId, creatorId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Quiz_1.QuizModel.findOneAndUpdate({
                _id: new mongoose_1.Types.ObjectId(quizId),
                $or: [
                    { creatorId: new mongoose_1.Types.ObjectId(creatorId) },
                    { forkBy: new mongoose_1.Types.ObjectId(creatorId) },
                ],
            }, { $set: updateData }, { new: true, runValidators: true }).exec();
        });
    }
    static cloneQuizz(quizId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quizz = yield Quiz_1.QuizModel.findById(quizId).lean();
            if (!quizz)
                return null;
            if (quizz.visibility === "private") {
                return null;
            }
            const { _id, createdAt, updatedAt } = quizz, quizData = __rest(quizz, ["_id", "createdAt", "updatedAt"]);
            const clonedQuiz = yield Quiz_1.QuizModel.create(Object.assign(Object.assign({}, quizData), { forkBy: new mongoose_1.Types.ObjectId(userId) }));
            return clonedQuiz.toObject();
        });
    }
    static getDashboardStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = new mongoose_1.Types.ObjectId(userId);
            // 1. Total quizzes created or forked
            const totalQuizzes = yield Quiz_1.QuizModel.countDocuments({
                $or: [{ creatorId: userObjectId }, { forkBy: userObjectId }],
            });
            // 2. All game sessions hosted by user
            const hostSessions = yield GameSession_1.GameSessionModel.find({ hostId: userObjectId }).select("_id");
            const sessionIds = hostSessions.map((s) => s._id);
            // 3. Total distinct students (users + guests) from GameHistory
            const [uniqueUsers, uniqueGuests] = yield Promise.all([
                GameHistory_1.GameHistoryModel.distinct("userId", { gameSessionId: { $in: sessionIds }, userId: { $exists: true } }),
                GameHistory_1.GameHistoryModel.distinct("guestNickname", { gameSessionId: { $in: sessionIds }, guestNickname: { $exists: true, $ne: "" } }),
            ]);
            const totalStudents = uniqueUsers.length + uniqueGuests.length;
            // 4. Completed game sessions
            const completedQuizzes = yield GameSession_1.GameSessionModel.countDocuments({
                hostId: userObjectId,
                status: "completed",
            });
            // 5. Average % correct across all answers
            const avgCorrectAgg = yield GameHistory_1.GameHistoryModel.aggregate([
                { $match: { gameSessionId: { $in: sessionIds } } },
                {
                    $group: {
                        _id: null,
                        totalAnswers: { $sum: 1 },
                        totalCorrect: {
                            $sum: { $cond: [{ $eq: ["$isUltimatelyCorrect", true] }, 1, 0] },
                        },
                    },
                },
                {
                    $project: {
                        percentCorrect: {
                            $cond: [
                                { $eq: ["$totalAnswers", 0] },
                                0,
                                { $multiply: [{ $divide: ["$totalCorrect", "$totalAnswers"] }, 100] },
                            ],
                        },
                    },
                },
            ]);
            const averageScore = avgCorrectAgg.length > 0 ? avgCorrectAgg[0].percentCorrect : 0;
            return {
                totalQuizzes,
                totalStudents,
                completedQuizzes,
                averageScore: parseFloat(averageScore.toFixed(2)), // percentage of correct answers
            };
        });
    }
}
exports.QuizzRepositories = QuizzRepositories;
