"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = require("./service/swaggerConfig");
const users_route_1 = __importDefault(require("./routes/users.route"));
const quizz_route_1 = __importDefault(require("./routes/quizz.route"));
const errHandle_middleware_1 = require("./middleware/errHandle.middleware");
const service_route_1 = __importDefault(require("./routes/service.route"));
const game_route_1 = require("./routes/game.route");
const report_route_1 = require("./routes/report.route");
const config_1 = require("./config/config");
const bug_report_route_1 = __importDefault(require("./routes/bug.report.route"));
const solo_routes_1 = __importDefault(require("./routes/solo.routes"));
const team_route_1 = __importDefault(require("./routes/team.route"));
// import { } from './middleware/apiKeyVerification.middleware';
const swaggerProtect_middleware_1 = require("./middleware/swaggerProtect.middleware");
// import rateLimit from 'express-rate-limit';
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.config.frontEndUrl,
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per window
//     standardHeaders: true,
//     legacyHeaders: false,
//     // The 'trustProxy' setting is no longer needed here if set globally
// });
// app.use(limiter);
// API Routes
app.use('/api/user', users_route_1.default);
app.use('/api/quizz', quizz_route_1.default);
app.use('/api-docs', swaggerProtect_middleware_1.swaggerPasswordProtect, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.swaggerSpec));
app.use('/api/service', service_route_1.default);
app.use('/api/session', game_route_1.gameRouter);
app.use('/api', bug_report_route_1.default);
app.use('/api/solo', solo_routes_1.default);
app.use('/api/teams', team_route_1.default);
app.use('/api/reports', report_route_1.reportRouter);
app.use(errHandle_middleware_1.errHandle);
exports.default = app;
