export function normalizePhone(phone: string): string {
  return phone.replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '');
}

export function buildPusherChannel(customerPhone: string, loftPhone: string): string {
  return `whatsapp-twilio-${normalizePhone(customerPhone)}-${normalizePhone(loftPhone)}`;
}

export function buildOmniTalkChannel(ownerId: string): string {
  return `omnitalk-notifications-${ownerId}`;
}

export const PUSHER_EVENT_INBOUND = 'message-inbound-received';
export const PUSHER_EVENT_OUTBOUND = 'message-outbound-received';
export const OMNITALK_EVENT_INBOUND = 'case-message-inbound-received';
