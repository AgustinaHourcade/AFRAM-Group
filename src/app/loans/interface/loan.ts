export interface Loan {
    id: number;
    amount: number;
    paid: number;
    expiration_date: string;
    request_date: string;
    account_id: number;
    interest_rate_id: number;
    return_amount: number;
}
