import express from 'express'
import {hostGame} from '../controller/game.controller'
import { authenticateToken } from '../middleware/authenicate.middleware';
export const gameRouter = express.Router();
gameRouter.post('/host',authenticateToken,hostGame)