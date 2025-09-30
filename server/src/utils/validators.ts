export function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} is required`);
  }
}

export function assertEmail(value: string, field = "email"): void {
  const re = /\S+@\S+\.\S+/;
  if (!re.test(value)) {
    throw new Error(`${field} is invalid`);
  }
}

export function assertPhone(value: string, field = "phoneNumber"): void {
  // Basic check; Twilio prefers E.164 format
  const cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.length < 8) {
    throw new Error(`${field} is invalid`);
  }
}

export function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


