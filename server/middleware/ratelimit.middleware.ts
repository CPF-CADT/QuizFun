import express,{Request,Response} from 'express';
import ratelimit from "express-rate-limit";
import { ratelimitConfig } from '../config/rate-limit';
export const quizRateLimit = ratelimit(ratelimitConfig.quiz);
export const globalRateLimit = ratelimit(ratelimitConfig.global);