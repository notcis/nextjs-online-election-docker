const THAI_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds

export function getNowInThaiTime(): Date {
  const nowUtc = new Date();
  return new Date(nowUtc.getTime() + THAI_TIMEZONE_OFFSET_MS);
}

export function convertUtcToThaiTime(utcDate: Date): Date {
  return new Date(utcDate.getTime() + THAI_TIMEZONE_OFFSET_MS);
}
