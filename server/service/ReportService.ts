// import { ReportRepository } from '../repositories/report.repositories';
// import { IReportQuizListItem, IQuizAnalytics } from '../dto/ReportDTOs';

// export class ReportService {

//     /**
//      * Retrieves a list of quizzes for a user to select from for reporting.
//      */
//     static async getMyQuizzesForReport(creatorId: string): Promise<IReportQuizListItem[]> {
//         // Business logic could be added here in the future (e.g., filtering out quizzes with no plays)
//         return ReportRepository.findQuizzesByCreator(creatorId);
//     }

//     /**
//      * Generates a detailed analytics report for a specific quiz.
//      */
//     static async generateQuizAnalytics(quizId: string, creatorId: string): Promise<IQuizAnalytics | null> {
//         const analytics = await ReportRepository.getQuizAnalytics(quizId, creatorId);

//         if (analytics) {
//             // Add any additional business logic here. For example, generating qualitative feedback.
//             // For now, it directly returns the repository data.
//         }

//         return analytics;
//     }
// }