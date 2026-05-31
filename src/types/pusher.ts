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
  data: WhatsAppEventPayload;
}

export interface WsClientMessage {
  action: 'subscribe' | 'unsubscribe' | 'ping';
  channel?: string;
}
