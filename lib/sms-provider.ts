export type SmsProviderStatus = {
  configured: boolean;
  enabled: boolean;
  provider: string;
  senderId: string;
  message: string;
};

export function getSmsProviderStatus(): SmsProviderStatus {
  const enabled = process.env.NEXT_PUBLIC_SMS_ENABLED === "true";
  const provider = process.env.SMS_PROVIDER || "Not configured";
  const senderId = process.env.SMS_SENDER_ID || "Not configured";
  const hasCredentials = Boolean(process.env.SMS_API_KEY && (process.env.SMS_USERNAME || process.env.SMS_SENDER_ID));
  const configured = enabled && hasCredentials;

  return {
    configured,
    enabled,
    provider,
    senderId,
    message: configured ? "SMS provider configured." : "SMS provider not configured. Sending is disabled.",
  };
}

export async function sendSms({ recipientPhone, message }: { recipientPhone: string; message: string }) {
  const status = getSmsProviderStatus();
  if (!status.configured) {
    return { success: false, status: "disabled", error: "SMS provider not configured.", recipientPhone, message };
  }

  return { success: false, status: "not_implemented", error: "Provider adapter is not connected yet.", recipientPhone, message };
}

