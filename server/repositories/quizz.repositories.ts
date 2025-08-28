import { Types } from "mongoose";
import { QuizModel, IQuestion, IQuiz, IOption } from "../model/Quiz";
import { GameSessionModel } from "../model/GameSession";
import { GameHistoryModel } from "../model/GameHistory";
import fuzzysort from "fuzzysort";
import { escapeRegex } from "../service/calculation";

export class QuizzRepositories {

	static async getAllQuizzes(
		page: number,
		limit: number,
		sortBy: string = "createdAt",
		sortOrder: string = "desc",
		searchQuery?: string,
		tags?: string[],
		userId?: string,
		owner?: string
	) {
		const offset = (page - 1) * limit;
		const filter: any = {};

		if (owner === "me" && userId) {
			filter.$and = [
				{
					$or: [
						{ creatorId: new Types.ObjectId(userId) },
						{ forkBy: new Types.ObjectId(userId) }
					]
				},
				{
					visibility: { $in: ["public", "private"] }
				}
			];
		} else if (owner === "others" && userId) {
			filter.$and = [
				{ creatorId: { $ne: new Types.ObjectId(userId) } },
				{ visibility: "public" }
			];
		} else {
			filter.visibility = "public";
		}

		if (searchQuery) {
			const safeQuery = escapeRegex(searchQuery);
			const searchFilter = {
				$or: [
					{ title: { $regex: safeQuery, $options: "i" } },
					{ description: { $regex: safeQuery, $options: "i" } }
				]
			};

			if (filter.$and) {
				filter.$and.push(searchFilter);
			} else {
				filter.$and = [searchFilter];
			}
		}

		if (tags && tags.length > 0) {
			const tagFilter = { tags: { $in: tags } };
			if (filter.$and) {
				filter.$and.push(tagFilter);
			} else {
				filter.$and = [tagFilter];
			}
		}

		const validSortFields = ["createdAt", "title", "updatedAt"];
		const sort: any = {
			[validSortFields.includes(sortBy) ? sortBy : "createdAt"]:
				sortOrder === "asc" ? 1 : -1,
		};

		let candidates = await QuizModel.find(filter)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.lean();

		let total = await QuizModel.countDocuments(filter);

		if (searchQuery) {
			const fuzzyResults = fuzzysort.go(searchQuery, candidates, {
				keys: ["title", "description"],
				threshold: -1000,
			});
			candidates = fuzzyResults.map(r => r.obj);
			total = candidates.length;
		}

const quizzes = await Promise.all(
  candidates.map(async quiz => {
    const sessions = await GameSessionModel.find({ quizId: quiz._id }).lean();

    const totalPlayers = sessions.reduce(
      (sum, s) => sum + (s.results?.length || 0),
      0
    );

    let ratingCount = 0;
    let ratingSum = 0;

    sessions.forEach(s => {
      if (s.feedback && s.feedback.length > 0) {
        ratingCount += s.feedback.length;
        ratingSum += s.feedback.reduce((a, f) => a + f.rating, 0);
      }
    });

    const averageRating = ratingCount > 0 ? ratingSum / ratingCount : null;

    return {
      ...quiz,
      totalPlayers,
      rating: {
        count: ratingCount,
        average: averageRating,
      },
    };
  })
);
		

		return {
			quizzes: quizzes,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNext: page * limit < total,
			hasPrev: page > 1,
		};
	}



	static async getQuizz(qId: string) {
		if (!Types.ObjectId.isValid(qId)) {
			throw new Error("Invalid quiz ID");
		}
		return QuizModel.findById(qId).lean();
	}
	static async createQuizz(quizz: IQuiz): Promise<IQuiz | null> {
		return QuizModel.create(quizz);
	}
	static async getQuizzByUser(userId?: string, page = 1, limit = 10, search?: string) {
		if (!userId) return { total: 0, quizzes: [] };

		const objectId = new Types.ObjectId(userId);
		const skip = (page - 1) * limit;

		// Base query to find quizzes created or forked by the user
		const matchQuery: any = {
			$or: [{ forkBy: objectId }, { creatorId: objectId }],
		};

		// If a search term is provided, add a case-insensitive regex search on the title
		if (search && search.trim() !== '') {
			matchQuery.title = { $regex: search, $options: 'i' };
		}

		const result = await QuizModel.aggregate([
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

		const total = result[0]?.total[0]?.count || 0;
		const quizzes = result[0]?.quizzes || [];

		return { total, quizzes };
	}

	static async addQuestion(
		quizId: string,
		question: IQuestion
	): Promise<boolean> {
		const result = await QuizModel.updateOne(
			{ _id: new Types.ObjectId(quizId) },
			{ $push: { questions: question } }
		);
		return result.modifiedCount > 0;
	}
	static async findById(id: string): Promise<IQuiz | null> {
		return QuizModel.findById(id).lean().exec();
	}
	static async updateQuestion(
		quizzId: string,
		questionId: string,
		questionUpdate: Partial<IQuestion>
	): Promise<IQuestion | null> {
		const quiz = await QuizModel.findOneAndUpdate(
			{
				_id: new Types.ObjectId(quizzId),
				"questions._id": new Types.ObjectId(questionId),
			},
			{
				$set: Object.entries(questionUpdate).reduce((acc, [k, v]) => {
					acc[`questions.$.${k}`] = v;
					return acc;
				}, {} as Record<string, any>),
			},
			{ new: true }
		).exec();

		if (!quiz) return null;
		return quiz.questions.find((q) => q._id.toString() === questionId) || null;
	}

	static async updateOption(
		quizzId: string,
		questionId: string,
		optionId: string,
		optionUpdate: Partial<IOption>
	): Promise<IOption | null> {
		const quiz = await QuizModel.findOneAndUpdate(
			{
				$match: { _id: new Types.ObjectId(quizzId) },
				"questions._id": questionId,
				"questions.options._id": optionId,
			},
			{
				$set: Object.entries(optionUpdate).reduce((acc, [k, v]) => {
					acc[`questions.$[q].options.$[o].${k}`] = v;
					return acc;
				}, {} as Record<string, any>),
			},
			{
				new: true,
				arrayFilters: [
					{ "q._id": new Types.ObjectId(questionId) },
					{ "o._id": new Types.ObjectId(optionId) },
				],
			}
		).exec();

		if (!quiz) return null;

		const question = quiz.questions.find(
			(q) => q._id.toString() === questionId
		);
		if (!question) return null;

		return question.options.find((o) => o._id.toString() === optionId) || null;
	}

	static async deleteQuestion(
		quizzId: string,
		questionId: string
	): Promise<boolean> {
		const result = await QuizModel.updateOne(
			{ _id: new Types.ObjectId(quizzId) },
			{ $pull: { questions: { _id: new Types.ObjectId(questionId) } } }
		).exec();

		return result.modifiedCount > 0;
	}

	static async deleteOption(
		quizzId: string,
		questionId: string,
		optionId: string
	): Promise<boolean> {
		const result = await QuizModel.updateOne(
			{
				$match: { _id: new Types.ObjectId(quizzId) },
				"questions._id": questionId,
			},
			{ $pull: { "questions.$.options": { _id: optionId } } }
		).exec();

		return result.modifiedCount > 0;
	}

	static async deleteQuizz(quizzId: string, ownerId: string): Promise<boolean> {
		const result = await QuizModel.deleteOne({
			_id: new Types.ObjectId(quizzId),
			$or: [{ creatorId: ownerId }, { forkBy: ownerId }],
		}).exec();

		return result.deletedCount > 0;
	}

	static async updateQuizz(
		quizId: string,
		creatorId: string,
		updateData: Partial<IQuiz>,
	): Promise<IQuiz | null> {
		return await QuizModel.findOneAndUpdate(
			{
				_id: new Types.ObjectId(quizId),
				$or: [
					{ creatorId: new Types.ObjectId(creatorId) },
					{ forkBy: new Types.ObjectId(creatorId) },
				],
			},
			{ $set: updateData },
			{ new: true, runValidators: true }
		).exec();
	}
	static async cloneQuizz(
		quizId: string,
		userId: string
	): Promise<IQuiz | null> {
		const quizz = await QuizModel.findById(quizId).lean();
		if (!quizz) return null;
		if (quizz.visibility === "private") {
			return null;
		}
		const { _id, createdAt, updatedAt, ...quizData } = quizz;

		const clonedQuiz = await QuizModel.create({
			...quizData,
			forkBy: new Types.ObjectId(userId),
		});

		return clonedQuiz.toObject();
	}


	static async getDashboardStats(userId: string) {
		const userObjectId = new Types.ObjectId(userId);

		// 1. Total quizzes created or forked
		const totalQuizzes = await QuizModel.countDocuments({
			$or: [{ creatorId: userObjectId }, { forkBy: userObjectId }],
		});

		// 2. All game sessions hosted by user
		const hostSessions = await GameSessionModel.find({ hostId: userObjectId }).select("_id");
		const sessionIds = hostSessions.map((s) => s._id);

		// 3. Total distinct students (users + guests) from GameHistory
		const [uniqueUsers, uniqueGuests] = await Promise.all([
			GameHistoryModel.distinct("userId", { gameSessionId: { $in: sessionIds }, userId: { $exists: true } }),
			GameHistoryModel.distinct("guestNickname", { gameSessionId: { $in: sessionIds }, guestNickname: { $exists: true, $ne: "" } }),
		]);
		const totalStudents = uniqueUsers.length + uniqueGuests.length;

		// 4. Completed game sessions
		const completedQuizzes = await GameSessionModel.countDocuments({
			hostId: userObjectId,
			status: "completed",
		});

		// 5. Average % correct across all answers
		const avgCorrectAgg = await GameHistoryModel.aggregate([
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

		const averageScore =
			avgCorrectAgg.length > 0 ? avgCorrectAgg[0].percentCorrect : 0;

		return {
			totalQuizzes,
			totalStudents,
			completedQuizzes,
			averageScore: parseFloat(averageScore.toFixed(2)), // percentage of correct answers
		};
	}
}
