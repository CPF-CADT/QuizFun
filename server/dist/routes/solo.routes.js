"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const solo_controller_1 = require("../controller/solo.controller");
const authenicate_middleware_1 = require("../middleware/authenicate.middleware");
const router = (0, express_1.Router)();
router.use(authenicate_middleware_1.optionalAuthMiddleware);
// --- Solo Game Routes ---
router.post('/start', solo_controller_1.soloController.startSoloGame);
router.get('/:sessionId/state', solo_controller_1.soloController.getSoloGameState);
router.post('/:sessionId/answer', solo_controller_1.soloController.submitSoloAnswer);
router.post('/:sessionId/finish', solo_controller_1.soloController.finishSoloGame);
exports.default = router;
