// import { faker } from '@faker-js/faker';
// import { Types } from 'mongoose';
// import { GameHistoryModel, historyResponse, IGameHistory } from '../model/GameHistory'; 
// import { GameSessionModel, IGameSession, IGameSessionParticipant } from '../model/GameSession'; 
// import { IQuiz, IQuestion, IOption, QuizModel } from '../model/Quiz'; 
// import { IUserData, UserModel } from '../model/User'; 
// import { IVerificationCode, VerificationCodeModel } from '../model/VerificationToken'; 
// import { IResponse } from '../model/GameHistory';

// const createRandomResponses = (question: IQuestion): IResponse[] => {
//   const count = faker.number.int({ min: 1, max: 100 });
//   const responses: IResponse[] = [];
//   let lastTime = 0;
//   for (let i = 0; i < count; i++) {
//     const option = faker.helpers.arrayElement(question.options);
//     lastTime += faker.number.int({ min: 1000, max: 5000 });
//     responses.push({
//       selectedOptionId: option._id,
//       timeStamp: new Date(Date.now() + lastTime),
//     });
//   }
//   return responses;
// };
// export const createRandomUserData = (): IUserData => {
//   return {
//     name: faker.person.fullName(),
//     email: faker.internet.email(),
//     role: faker.helpers.arrayElement(['player', 'admin']),
//     profileUrl: faker.image.avatar(),
//     isVerified: faker.datatype.boolean(),
//   };
// };


// const createRandomOption = (isCorrect: boolean): IOption => ({
//   _id: new Types.ObjectId(),
//   text: faker.lorem.sentence(3),
//   isCorrect: isCorrect,
// });

// const createRandomQuestion = (): IQuestion => {
//   const options: IOption[] = [];
//   const correctOptionIndex = faker.number.int({ min: 0, max: 3 });

//   for (let i = 0; i < 4; i++) {
//     options.push(createRandomOption(i === correctOptionIndex));
//   }

//   return {
//     _id: new Types.ObjectId(),
//     questionText: faker.lorem.sentence(5) + '?',
//     point: faker.helpers.arrayElement([10, 20, 30, 50]),
//     timeLimit: faker.helpers.arrayElement([10, 20, 30, 60]),
//     options: options,
//     imageUrl: faker.image.url(),
//     tags: [faker.lorem.word(), faker.lorem.word()],
//   };
// };

// export const createRandomQuiz = (creatorId: Types.ObjectId): IQuiz => {
//   const questions = Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, createRandomQuestion);

//   return {
//     _id: new Types.ObjectId(),
//     title: faker.lorem.sentence(4),
//     description: faker.lorem.paragraph(),
//     creatorId: creatorId,
//     visibility: faker.helpers.arrayElement(['public', 'private']),
//     questions: questions,
//     templateImgUrl: faker.image.url(),
//   } as IQuiz;
// };


// const createRandomParticipant = (userId: Types.ObjectId): IGameSessionParticipant => ({
//   userId: userId,
//   nickname: faker.internet.userName(),
//   finalScore: faker.number.int({ min: 0, max: 1000 }),
//   finalRank: faker.number.int({ min: 1, max: 50 }),
//   feedback: [
//     {
//       rating: Types.Decimal128.fromString(
//         faker.number.float({ min: 1, max: 5}).toFixed(1)
//       ),
//       comment: faker.lorem.sentence()
//     }
//   ]
// });


// export const createRandomGameSession = (quizId: Types.ObjectId, hostId: Types.ObjectId, userIds: Types.ObjectId[]): IGameSession => {
//   const participants = userIds.map(createRandomParticipant);
//   const status = faker.helpers.arrayElement(['waiting', 'in_progress', 'completed']);
//   const startedAt = status !== 'waiting' ? faker.date.past() : undefined;
//   const endedAt = status === 'completed' ? faker.date.future({ refDate: startedAt }) : undefined;

//   return {
//     _id: new Types.ObjectId(),
//     quizId: quizId,
//     hostId: hostId,
//     joinCode: faker.string.alphanumeric(6).toUpperCase(),
//     status: status,
//     results: participants,
//     startedAt: startedAt,
//     endedAt: endedAt,
//   } as IGameSession;
// };


// export const createRandomGameHistory = (
//   gameSessionId: Types.ObjectId,
//   quizId: Types.ObjectId,
//   userId: Types.ObjectId,
//   question: IQuestion,
//   allQuestions: IQuestion[]
// ): IGameHistory => {
//   const selectedOption = faker.helpers.arrayElement(question.options);
//    const questionsWithResponses: historyResponse[] = allQuestions.map(q => ({
//     ...q,
//     responses: createRandomResponses(q),
//   }));
//   return {
//     _id: new Types.ObjectId(),
//     gameSessionId: gameSessionId,
//     quizId: quizId,
//     userId: userId,
//     questionId: question._id,
//     selectedOptionId: selectedOption._id,
//     isCorrect: selectedOption.isCorrect,
//     pointsAwarded: selectedOption.isCorrect ? question.point : 0,
//     timeTakenMs: faker.number.int({ min: 1000, max: question.timeLimit * 1000 }),
//     questions:questionsWithResponses,
//   } as IGameHistory;
// };



// export const createRandomVerificationCode = (userId: Types.ObjectId): IVerificationCode => {
//     return {
//         _id: new Types.ObjectId(),
//         userId: userId,
//         Code: faker.string.alphanumeric(6),
//         expiresAt: faker.date.future(),
//     } as IVerificationCode;
// };




// export async function runSeed() {
//    // 1. Create and save user
//   const randomUser = createRandomUserData();
//   const userDoc = new UserModel(randomUser);
//   await userDoc.save();
//   console.log('--- User saved ---', userDoc);

//   // 2. Create and save quiz
//   const randomQuiz = createRandomQuiz(userDoc._id);
//   const quizDoc = new QuizModel(randomQuiz);
//   await quizDoc.save();
//   console.log('--- Quiz saved ---', quizDoc._id);

//   // 3. Create and save other users
//   const otherUserDocs = [];
//   for (let i = 0; i < 5; i++) {
//     const u = new UserModel(createRandomUserData());
//     await u.save();
//     otherUserDocs.push(u);
//   }

//   // 4. Create and save game session
//   const allUserIds = [userDoc._id, ...otherUserDocs.map(u => u._id)];
//   const randomGameSession = createRandomGameSession(quizDoc.id, userDoc._id, allUserIds);
//   const gameSessionDoc = new GameSessionModel(randomGameSession);
//   await gameSessionDoc.save();
//   console.log('--- Game Session saved ---', gameSessionDoc);

//   // 5. Create and save game history (for one question)
//   const question = randomQuiz.questions[0];
//   const randomGameHistory = createRandomGameHistory(gameSessionDoc.hostId, quizDoc.id, userDoc._id,randomQuiz.questions[0],randomQuiz.questions);
//   const gameHistoryDoc = new GameHistoryModel(randomGameHistory);
//   await gameHistoryDoc.save();
//   console.log('--- Game History saved ---', gameHistoryDoc);

//   // 6. Create and save verification code
//   const randomVerificationCode = createRandomVerificationCode(userDoc._id);
//   const verificationCodeDoc = new VerificationCodeModel(randomVerificationCode);
//   await verificationCodeDoc.save();
//   console.log('--- Verification Code saved ---', verificationCodeDoc);
// }