export interface WhatsAppEventPayload {
  Body__c: string;
  Direction__c: 'inbound' | 'outbound';
  Status__c: string;
  Timestamp__c: string;
  twilio_id__c: string;
  IsMedia__c: boolean;
  MediaResourceUrl__c: string | null;
}

export interface PusherBroadcastEnvelope {
  event: string;
  channel: string;
  data: WhatsAppEventPayload | OmniTalkPushPayload;
}

export interface OmniTalkNotificationItem {
  id: string;
  /** External conversation thread id (maps to WhatsappConversation__c.Thread_Id__c) */
  threadId: string;
  sourceId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  isMuted: boolean;
  isDeleted: boolean;
  hasEmail: boolean;
  lastModifiedDate: string;
  lastViewedDate?: string | null;
  ownerName?: string;
}

export interface OmniTalkPushPayload {
  notifications: OmniTalkNotificationItem[];
  timestamp: string;
}

export interface WsClientMessage {
  action: 'subscribe' | 'unsubscribe' | 'ping';
  channel?: string;
}
