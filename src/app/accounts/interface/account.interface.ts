export interface Account {
    id: number;
    balance: number;
    opening_date: Date;
    cbu: string;
    closing_date: string;
    alias: string;
    account_type: 'Checking' | 'Savings';
    overdraft_limit: number;
    user_id: number;
  }
