"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePoint = calculatePoint;
exports.escapeRegex = escapeRegex;
// formula 
//
// point = basePoint * (1 + TimeRemain/TimeAlloed) 
//
function calculatePoint(basePoint, timeAllowed, timeRemain) {
    if (timeAllowed <= 0)
        return basePoint;
    return Math.round(basePoint * (1 + timeRemain / timeAllowed));
}
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
