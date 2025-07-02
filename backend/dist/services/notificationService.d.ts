export interface NotificationData {
    userId: string;
    type: 'APPOINTMENT' | 'INSURANCE' | 'SYSTEM' | 'MEDICAL' | 'SECURITY';
    title: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    actionUrl?: string;
    metadata?: Record<string, any>;
    channels?: ('email' | 'sms' | 'push')[];
}
declare class NotificationService {
    create(data: NotificationData): Promise<any>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    getUserNotifications(userId: string, options?: {
        page?: number;
        limit?: number;
        isRead?: boolean;
        type?: string;
    }): Promise<{
        data: never[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    private sendEmail;
    private sendSMS;
    private sendPush;
    notifyAppointmentCreated(appointmentId: string): Promise<void>;
    notifyAppointmentCancelled(appointmentId: string): Promise<void>;
}
export declare const notificationService: NotificationService;
export {};
