export type MessageTemplateKey =
    | 'tracking_link'
    | 'service_completed'
    | 'payment_reminder'
    | 'birthday'
    | 'generic';

export interface MessageTemplate {
    key: MessageTemplateKey;
    name: string;
    message: string;
    variables: string[];
}

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
    {
        key: 'tracking_link',
        name: 'Link de Acompanhamento',
        message: 'Ola {nome}! Acompanhe o servico do seu {veiculo} em tempo real: {link}',
        variables: ['nome', 'veiculo', 'link'],
    },
    {
        key: 'service_completed',
        name: 'Servico Concluido',
        message: 'Ola {nome}! O servico no seu {veiculo} foi concluido! Voce ja pode retirar.',
        variables: ['nome', 'veiculo'],
    },
    {
        key: 'payment_reminder',
        name: 'Lembrete de Pagamento',
        message: 'Ola {nome}! Lembramos que o pagamento do servico esta pendente. Valor: {valor}',
        variables: ['nome', 'valor'],
    },
    {
        key: 'birthday',
        name: 'Feliz Aniversario',
        message: 'Feliz aniversario, {nome}! A equipe da {empresa} deseja um dia incrivel!',
        variables: ['nome', 'empresa'],
    },
    {
        key: 'generic',
        name: 'Mensagem Personalizada',
        message: 'Ola {nome}, aqui e da {empresa}. Como posso ajudar?',
        variables: ['nome', 'empresa'],
    },
];

export function formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('55') && digits.length >= 12) {
        return digits;
    }

    if (digits.length === 11 || digits.length === 10) {
        return `55${digits}`;
    }

    return digits.length > 0 ? `55${digits}` : '';
}

export function generateWhatsAppUrl(phone: string, message: string): string {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function openWhatsApp(phone: string, message: string): void {
    const url = generateWhatsAppUrl(phone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
}

export function replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}

export function getTrackingUrl(orderId: string): string {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/tracking/${orderId}`;
    }
    return `/tracking/${orderId}`;
}
