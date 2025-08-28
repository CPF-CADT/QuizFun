"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerPasswordProtect = swaggerPasswordProtect;
const basic_auth_1 = __importDefault(require("basic-auth"));
function swaggerPasswordProtect(req, res, next) {
    const user = (0, basic_auth_1.default)(req);
    const username = process.env.SWAGGER_USER;
    const password = process.env.SWAGGER_PASSWORD;
    if (!user || user.name !== username || user.pass !== password) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Access"');
        res.status(401).send('Access denied');
        return;
    }
    next();
}
