export interface Thread{
    id: number,
    user_id: number, 
    support_subject: string, 
    created_at: string,
    support_status: string // 'open' or 'closed
}

export interface Message{
    id: number,
    thread_id: number, 
    sender_type: string, // 'user' or 'support
    message: string,
    created_at: string
}