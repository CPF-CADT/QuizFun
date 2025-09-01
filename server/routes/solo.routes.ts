import { Router } from 'express';
import { soloController } from '../controller/solo.controller';
import { optionalAuthMiddleware } from '../middleware/authenicate.middleware';

const router = Router();

router.use(optionalAuthMiddleware);

// --- Solo Game Routes ---
router.post('/start', soloController.startSoloGame);
router.get('/:sessionId/state', soloController.getSoloGameState);
router.post('/:sessionId/answer', soloController.submitSoloAnswer);
router.post('/:sessionId/finish', soloController.finishSoloGame);

export default router;