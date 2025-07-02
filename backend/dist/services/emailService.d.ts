interface EmailData {
    to: string | string[];
    subject: string;
    message: string;
    html?: string;
    actionUrl?: string;
    attachments?: Array<{
        filename: string;
        path: string;
    }>;
}
declare class EmailService {
    private transporter;
    constructor();
    sendNotification(data: EmailData): Promise<void>;
    sendWelcome(userEmail: string, userName: string): Promise<void>;
    sendPasswordReset(userEmail: string, resetToken: string): Promise<void>;
    private send;
    private generateNotificationHTML;
    private generateWelcomeHTML;
    private generatePasswordResetHTML;
}
export declare const emailService: EmailService;
export {};
