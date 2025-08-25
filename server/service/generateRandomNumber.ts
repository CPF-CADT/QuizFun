import cryptoObj from "crypto";

export function generateRandomNumber(digits: number): number {
  if (digits < 1) {
    throw new Error("Number of digits must be at least 1");
  }

  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function getExpiryDate(minutes: number): Date {
  const now = new Date();
  const expireUtc7 = new Date(now.getTime() + minutes * 60 * 1000 + 7 * 60 * 60 * 1000);
  return expireUtc7;
}
export function generatePassword(length: number = 128): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~`";
  let result = "";
  const randomValues = new Uint32Array(length);
  cryptoObj.webcrypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}
