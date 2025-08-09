import {GameSessionModel,IGameSession,IGameSessionParticipant} from '../model/GameSession'
import { GameHistoryModel,IGameHistory } from '../model/GameHistory';
export class GameRepositoy {
    static async hostNewGame(game: Partial<IGameSession>):Promise <IGameSession | null>{
        return await GameSessionModel.create(game);
    }
    static async addPlayerAndRsultInGame(game_id:string,players:IGameSessionParticipant) : Promise<boolean> {
        const result = await GameSessionModel.updateOne(
            {_id:game_id},
            {$push:{players}}
        )
        return result.modifiedCount > 0;
    }   
    static async addGameHistory(history:IGameHistory):Promise<IGameHistory | null> {
        return GameHistoryModel.create(history)
    }
    static fetchGameSession() {

    }

    static fetchGameSessionWithHistory() { 

    }

    static fetchUserGameHistory() { 

    }

    static fetchUserJoinHistory() { 

    }

}