import { GameSessionModel, IGameSession, IGameSessionParticipant } from '../model/GameSession';
import { GameHistoryModel, IGameHistory } from '../model/GameHistory';
import mongoose from 'mongoose';
import { log } from 'console';


export class GameRepository {
  static async hostNewGame(game: Partial<IGameSession>): Promise<IGameSession | null> {
    return GameSessionModel.create(game);
  }

  static async addPlayerAndResultInGame(game_id: string, player: IGameSessionParticipant): Promise<boolean> {
    const result = await GameSessionModel.updateOne(
      { _id: game_id },
      { $push: { players: player } }
    );
    return result.modifiedCount > 0;
  }

  static async addGameHistory(history: IGameHistory): Promise<IGameHistory | null> {
    return GameHistoryModel.create(history);
  }

  static async fetchGameSession(page: number, limit: number){
    
    const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
          GameSessionModel.find().skip(skip).limit(limit),
          GameSessionModel.countDocuments()
      ]);

    return {
      total,
      limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data
    };
  }

  static async fetchGameSessionWithHistory() {
    return GameSessionModel.aggregate([
      {
        $lookup: {
          from: 'gamehistories',
          localField: '_id',
          foreignField: 'gameId',
          as: 'history',
        },
      },
    ]);
  }

  static async fetchUserGameHistory(userId: string) {
    return GameHistoryModel.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: 'gamesessions',
          localField: 'gameId',
          foreignField: '_id',
          as: 'gameSession',
        },
      },
    ]);
  }

  static async fetchUserJoinHistory(userId: string) {
    return GameSessionModel.aggregate([
      {
        $match: { 'players.userId': new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: 'gamehistories',
          localField: '_id',
          foreignField: 'gameId',
          as: 'history',
        },
      },
    ]);
  }
}
