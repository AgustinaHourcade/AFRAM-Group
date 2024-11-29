export interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: Date;
    is_read: string;
    user_id: string;
}
