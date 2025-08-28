"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errHandle = void 0;
const config_1 = require("../config/config");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errHandle = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        stack: config_1.config.nodeEnv === 'production' ? undefined : err.stack
    });
};
exports.errHandle = errHandle;
