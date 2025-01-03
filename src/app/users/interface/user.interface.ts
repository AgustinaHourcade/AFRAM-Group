export interface User{
    id?:number,
    name_user: string,
    last_name?: string,
    hashed_password: string,
    email?: string,
    dni: string,
    phone?: number,
    user_type?: string,
    is_Active?: string,
    real_name?: string,
    reset_token?: number,
    login_attempts?: number
}

