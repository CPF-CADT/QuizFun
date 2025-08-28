"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentEmail = sentEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config/config");
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // TLS
    secure: false,
    auth: {
        user: config_1.config.emailUser,
        pass: config_1.config.emailPassword,
    },
});
function sentEmail(to, subject, text, html) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = yield transporter.sendMail({
                from: `"Quiz App" <${config_1.config.emailUser}>`,
                to,
                subject,
                text,
                html,
            });
            console.log("Email sent:", info.messageId);
            return { success: true, message: "Email sent successfully." };
        }
        catch (error) {
            console.error("Error sending email:", error);
            return {
                success: false,
                message: error.message || "Failed to send email.",
            };
        }
    });
}
