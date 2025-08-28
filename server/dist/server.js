"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const config_1 = require("./config/config");
const app_1 = __importDefault(require("./app"));
const mongo_1 = __importDefault(require("./config/mongo"));
const socket_1 = __importDefault(require("./config/socket"));
require('events').EventEmitter.defaultMaxListeners = 15;
(0, mongo_1.default)();
const httpServer = http_1.default.createServer(app_1.default);
(0, socket_1.default)(httpServer);
httpServer.listen(config_1.config.port, () => {
    console.log(`Server running at http://localhost:${config_1.config.port}`);
});
