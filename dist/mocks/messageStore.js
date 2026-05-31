import { buildPusherChannel, PUSHER_EVENT_INBOUND, PUSHER_EVENT_OUTBOUND } from '../utils/channelUtils.js';
import { broadcastToChannel } from '../websocket/pusherSimulator.js';
export const DEFAULT_THREAD_ID = 'thread-demo-001';
const CUSTOMER_PHONE = '+5511999887766';
const LOFT_PHONE = '+551140202208';
const ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const MESSAGING_SERVICE_SID = 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const conversationScript = [
    { direction: 'inbound', body: 'Olá, preciso de ajuda com meu contrato.' },
    { direction: 'outbound', body: 'Olá Chuck! Claro, em que posso ajudar?' },
    { direction: 'inbound', body: 'Gostaria de saber o valor da próxima parcela.' },
    { direction: 'outbound', body: 'Vou verificar para você. Um momento, por favor.' },
    {
        direction: 'outbound',
        body: 'Encontrei aqui: a próxima parcela é de R$ 1.245,00 com vencimento no dia 10.',
    },
    { direction: 'inbound', body: 'Certo, e consigo antecipar o pagamento?' },
    {
        direction: 'outbound',
        body: 'Sim! Você pode antecipar pelo app ou solicitar o boleto antecipado por aqui mesmo.',
    },
    { direction: 'inbound', body: 'Pode me enviar o boleto antecipado então?' },
    {
        direction: 'outbound',
        body: 'Claro, estou gerando o boleto agora. Assim que ficar pronto te envio por aqui.',
    },
    { direction: 'inbound', body: 'Perfeito, fico no aguardo.' },
    { direction: 'outbound', body: 'Boleto gerado! O vencimento continua sendo dia 10, ok?' },
    { direction: 'inbound', body: 'Sim, pode enviar.' },
    {
        direction: 'outbound',
        body: 'Acabei de enviar o PDF do boleto. Confirma se recebeu, por favor?',
    },
    { direction: 'inbound', body: 'Recebi sim, obrigada!' },
    { direction: 'inbound', body: 'Só mais uma dúvida: o contrato tem seguro incluso?' },
    {
        direction: 'outbound',
        body: 'Sim, seu contrato inclui seguro residencial básico. Quer que eu detalhe a cobertura?',
    },
    { direction: 'inbound', body: 'Sim, por favor.' },
    {
        direction: 'outbound',
        body: 'A cobertura inclui incêndio, roubo de bens dentro do imóvel e danos elétricos até o limite da apólice.',
    },
    { direction: 'inbound', body: 'Entendi. E como faço para acionar em caso de sinistro?' },
    {
        direction: 'outbound',
        body: 'Você pode acionar pela central 0800 ou pelo app, na área "Seguro do contrato".',
    },
    { direction: 'inbound', body: 'Ótimo, anotei aqui.' },
    { direction: 'outbound', body: 'Posso ajudar com mais alguma coisa hoje?' },
    { direction: 'inbound', body: 'Queria saber se consigo alterar a data de vencimento.' },
    {
        direction: 'outbound',
        body: 'A alteração de vencimento pode ser feita uma vez a cada 12 meses. Quer que eu verifique se você já usou essa opção?',
    },
    { direction: 'inbound', body: 'Sim, verifica por favor.' },
    {
        direction: 'outbound',
        body: 'Verifiquei: você ainda não alterou a data este ano. Posso registrar a solicitação agora.',
    },
    { direction: 'inbound', body: 'Quero mudar para dia 15.' },
    {
        direction: 'outbound',
        body: 'Solicitação registrada! A mudança entra em vigor a partir da próxima fatura.',
    },
    { direction: 'inbound', body: 'Maravilha, muito obrigada pelo atendimento!' },
    {
        direction: 'outbound',
        body: 'Por nada, Chuck! Qualquer dúvida estamos à disposição. Tenha um ótimo dia!',
    },
    { direction: 'inbound', body: 'Obrigada!' },
];
function toTwilioDate(date) {
    return date.toUTCString().replace('GMT', '+0000');
}
function buildInitialMessages() {
    const total = conversationScript.length;
    const baseTime = Date.now();
    return conversationScript.map((entry, index) => {
        const minutesAgo = (total - index) * 9;
        const date = new Date(baseTime - minutesAgo * 60 * 1000);
        return createTwilioMessage(entry.direction, entry.body, date, index + 1);
    });
}
function createTwilioMessage(direction, body, date, sequence) {
    const twilioDate = toTwilioDate(date);
    const isInbound = direction === 'inbound';
    const sid = sequence
        ? `SM${String(sequence).padStart(32, '0')}`
        : `SM${Date.now()}${Math.random().toString(36).slice(2, 8)}`.padEnd(34, '0').slice(0, 34);
    return {
        body,
        num_media: '0',
        date_sent: twilioDate,
        date_created: twilioDate,
        date_updated: twilioDate,
        status: isInbound ? 'received' : 'delivered',
        direction: isInbound ? 'inbound' : 'outbound-api',
        sid,
        account_sid: ACCOUNT_SID,
        from: isInbound ? `whatsapp:${CUSTOMER_PHONE}` : `whatsapp:${LOFT_PHONE}`,
        to: isInbound ? `whatsapp:${LOFT_PHONE}` : `whatsapp:${CUSTOMER_PHONE}`,
        messaging_service_sid: MESSAGING_SERVICE_SID,
        num_segments: '1',
        subresource_uris: {
            media: `/2010-04-01/Accounts/${ACCOUNT_SID}/Messages/${sid}/Media.json`,
        },
    };
}
function toWhatsAppEvent(message) {
    const isInbound = message.direction === 'inbound';
    return {
        Body__c: message.body,
        Direction__c: isInbound ? 'inbound' : 'outbound',
        Status__c: message.status,
        Timestamp__c: new Date(message.date_sent).toISOString(),
        twilio_id__c: message.sid,
        IsMedia__c: Number(message.num_media) > 0,
        MediaResourceUrl__c: Number(message.num_media) > 0 ? message.subresource_uris?.media ?? null : null,
    };
}
const twilioMessages = buildInitialMessages();
export function getConversationByThreadId(threadId) {
    const lastMessage = twilioMessages[twilioMessages.length - 1];
    const lastDate = new Date(lastMessage.date_sent).toISOString();
    return {
        Id: threadId || DEFAULT_THREAD_ID,
        Status__c: 'In Progress',
        Phone__c: CUSTOMER_PHONE,
        LoftPhone__c: LOFT_PHONE,
        LastMessage__c: lastDate,
        ClientName: 'Chuck Norris',
        OwnerId__c: 'user-agent-001',
    };
}
export function getMessagesByThreadId(_threadId) {
    const encodedFrom = encodeURIComponent(`whatsapp:${LOFT_PHONE}`);
    const encodedTo = encodeURIComponent(`whatsapp:${CUSTOMER_PHONE}`);
    const basePath = `/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
    return {
        first_page_uri: `${basePath}?From=${encodedFrom}&To=${encodedTo}&PageSize=100&Page=0`,
        next_page_uri: null,
        page: 0,
        page_size: 100,
        uri: `${basePath}?PageSize=100&Page=0`,
        messages: [...twilioMessages],
    };
}
export function getSimulatorDefaults() {
    const conversation = getConversationByThreadId(DEFAULT_THREAD_ID);
    const channel = buildPusherChannel(conversation.Phone__c, conversation.LoftPhone__c);
    return {
        threadId: DEFAULT_THREAD_ID,
        customerPhone: conversation.Phone__c,
        loftPhone: conversation.LoftPhone__c,
        clientName: conversation.ClientName,
        channel,
        pusherEventInbound: PUSHER_EVENT_INBOUND,
        pusherEventOutbound: PUSHER_EVENT_OUTBOUND,
    };
}
export function publishMessage(input) {
    const conversation = getConversationByThreadId(input.threadId);
    const channel = buildPusherChannel(conversation.Phone__c, conversation.LoftPhone__c);
    const twilioMessage = createTwilioMessage(input.direction, input.body, new Date());
    const eventPayload = toWhatsAppEvent(twilioMessage);
    twilioMessages.push(twilioMessage);
    const pusherEvent = input.direction === 'inbound' ? PUSHER_EVENT_INBOUND : PUSHER_EVENT_OUTBOUND;
    const subscribersNotified = broadcastToChannel({
        event: pusherEvent,
        channel,
        data: eventPayload,
    });
    return {
        message: twilioMessage,
        event: eventPayload,
        channel,
        pusherEvent,
        subscribersNotified,
    };
}
