import { Types } from "mongoose";
import { QuizModel, IQuestion, IQuiz, IOption, } from "../model/Quiz";
<<<<<<< refs/remotes/origin/chhunhour

export interface PaginatedQuizzes {
	quizzes: IQuiz[];
	total: number;
	page: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

=======
import { UserModel } from "../model/User";
import { GameSessionModel } from "../model/GameSession";
>>>>>>> local
export class QuizzRepositories {

	static async getAllQuizzes(
		page: number = 1, 
		limit: number = 10, 
		search?: string, 
		visibility?: 'public' | 'private',
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'desc'
	): Promise<PaginatedQuizzes> {
        const skip = (page - 1) * limit;

		// Build search query
		const searchQuery: any = {};
		
		if (visibility) {
			searchQuery.visibility = visibility;
		} else {
			searchQuery.visibility = 'public'; // Default to public quizzes
		}

		if (search) {
			searchQuery.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}

		// Build sort object
		const sortObject: any = {};
		sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [quizzes, total] = await Promise.all([
			QuizModel.find(searchQuery)
				.skip(skip)
				.limit(limit)
				.sort(sortObject)
				.exec(),
			QuizModel.countDocuments(searchQuery).exec()
		]);

        const totalPages = Math.ceil(total / limit);

        return {
            quizzes,
            total,
            page,
            totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1
        };
    }

	static async getQuizzesByUser(
		userId: string, 
		page: number = 1, 
		limit: number = 10,
		visibility?: 'public' | 'private'
	): Promise<PaginatedQuizzes> {
		const skip = (page - 1) * limit;

		const searchQuery: any = { creatorId: userId };
		if (visibility) {
			searchQuery.visibility = visibility;
		}

		const [quizzes, total] = await Promise.all([
			QuizModel.find(searchQuery)
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.exec(),
			QuizModel.countDocuments(searchQuery).exec()
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			quizzes,
			total,
			page,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1
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
	
	static async getQuizzByUser(userId: string) {
		return QuizModel.find({ creatorId: userId }).exec();
	}

	static async addQuestion(quizId: string, question: IQuestion): Promise<boolean> {
		const result = await QuizModel.updateOne(
			 { $match: { _id: new Types.ObjectId(quizId) } },
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
			{ $match: { _id: new Types.ObjectId(quizzId) }, 'questions._id': questionId },
			{
				$set: Object.entries(questionUpdate).reduce((acc, [k, v]) => {
					acc[`questions.$.${k}`] = v;
					return acc;
				}, {} as Record<string, any>)
			},
			{ new: true }
		).exec();

		if (!quiz) return null;
		return quiz.questions.find(q => q._id.toString() === questionId) || null;
	}

	static async updateOption(
		quizzId: string,
		questionId: string,
		optionId: string,
		optionUpdate: Partial<IOption>
	): Promise<IOption | null> {
		const quiz = await QuizModel.findOneAndUpdate(
			{ $match: { _id: new Types.ObjectId(quizzId) }, 'questions._id': questionId, 'questions.options._id': optionId },
			{
				$set: Object.entries(optionUpdate).reduce((acc, [k, v]) => {
					acc[`questions.$[q].options.$[o].${k}`] = v;
					return acc;
				}, {} as Record<string, any>)
			},
			{
				new: true,
				arrayFilters: [
					{ 'q._id': new Types.ObjectId(questionId) },
					{ 'o._id': new Types.ObjectId(optionId) }
				]
			}
		).exec();

		if (!quiz) return null;

		const question = quiz.questions.find(q => q._id.toString() === questionId);
		if (!question) return null;

		return question.options.find(o => o._id.toString() === optionId) || null;
	}

	static async deleteQuestion(quizzId: string, questionId: string): Promise<boolean> {
		const result = await QuizModel.updateOne(
			{ $match: { _id: new Types.ObjectId(quizzId) } },
			{ $pull: { questions: { _id: questionId } } }
		).exec();

		return result.modifiedCount > 0;
	}

	static async deleteOption(
		quizzId: string,
		questionId: string,
		optionId: string
	): Promise<boolean> {
		const result = await QuizModel.updateOne(
			{ $match: { _id: new Types.ObjectId(quizzId) }, 'questions._id': questionId },
			{ $pull: { 'questions.$.options': { _id: optionId } } }
		).exec();

		return result.modifiedCount > 0;
	}

	static async deleteQuizz(quizzId: string): Promise<boolean> {
		const result = await QuizModel.deleteOne(
			{ $match: { _id: new Types.ObjectId(quizzId) } },
		).exec();

		return result.deletedCount !== undefined && result.deletedCount > 0;
	}

	static async getDashboardStats() {
        const totalQuizzes = await QuizModel.countDocuments();
        const totalStudents = await UserModel.countDocuments({ role: 'player' });
        const completedQuizzes = await GameSessionModel.countDocuments({ status: 'completed' });

        const avgScoreAggregation = await GameSessionModel.aggregate([
            { $unwind: "$results" },
            { $group: { _id: null, avgScore: { $avg: "$results.finalScore" } } }
        ]);

        const averageScore = avgScoreAggregation.length > 0 ? avgScoreAggregation[0].avgScore : 0;

        return {
            totalQuizzes,
            totalStudents,
            completedQuizzes,
            averageScore: parseFloat(averageScore.toFixed(2))
        };
    }
}
