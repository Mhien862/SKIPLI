import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_FROM_NUMBER || "";

let client: Twilio.Twilio | null = null;

export function getTwilioClient(): Twilio.Twilio {
  if (!client) {
    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials missing: TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN");
    }
    client = Twilio(accountSid, authToken);
  }
  return client;
}

export async function sendSms(to: string, body: string): Promise<void> {
  if (!fromNumber) {
    throw new Error("TWILIO_FROM_NUMBER is not set");
  }
  const cli = getTwilioClient();
  await cli.messages.create({ to, from: fromNumber, body });
}


