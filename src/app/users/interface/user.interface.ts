export interface User{
    id?:number,
    name_user: string,
    last_name?: string,
    hashed_password: string,
    email?: string,
    dni: string,
    phone?: string,
    user_type?: string,
    isActive?: string,
    real_name?: string,
    reset_token?: number
}

