import { Router } from 'express';
import { GameController } from '../controller/game.controller';

const gameRouter = Router();

// gameRouter.post('/games', GameController.hostNewGame);
// gameRouter.post('/games/:gameId/players', GameController.addPlayer);

// gameRouter.get('/', GameController.getAllGames);
// gameRouter.get('/games-history', GameController.getGamesWithHistory);

// gameRouter.get('/users/:userId/game-history', GameController.getUserGameHistory);
// gameRouter.get('/users/:userId/join-history', GameController.getUserJoinHistory);

export default gameRouter;
