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
const authenicate_middleware_1 = require("./middleware/authenicate.middleware");
const apiKeyVerification_middleware_1 = require("./middleware/apiKeyVerification.middleware");
const swaggerProtect_middleware_1 = require("./middleware/swaggerProtect.middleware");
const app = (0, express_1.default)();
app.set('trust proxy', true);
app.use((0, cors_1.default)({
    origin: config_1.config.frontEndUrl,
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});
// API Routes
app.use('/api/user', apiKeyVerification_middleware_1.verifyApiKey, users_route_1.default);
app.use('/api/quizz', apiKeyVerification_middleware_1.verifyApiKey, quizz_route_1.default);
app.use('/api-docs', swaggerProtect_middleware_1.swaggerPasswordProtect, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.swaggerSpec));
app.use('/api/service', apiKeyVerification_middleware_1.verifyApiKey, service_route_1.default);
app.use('/api/session', apiKeyVerification_middleware_1.verifyApiKey, game_route_1.gameRouter);
app.use('/api', apiKeyVerification_middleware_1.verifyApiKey, bug_report_route_1.default);
app.use('/api/reports', apiKeyVerification_middleware_1.verifyApiKey, authenicate_middleware_1.authenticateToken, report_route_1.reportRouter);
app.use(errHandle_middleware_1.errHandle);
exports.default = app;
