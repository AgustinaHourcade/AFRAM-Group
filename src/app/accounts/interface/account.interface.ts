export interface Account {
    id: number;
    balance: number;
    opening_date: Date;
    closing_Date: Date | null;  
    cbu: string;
    alias: string;
    account_type: 'Checking' | 'Savings';  
    overdraft_limit: number;
    user_id: number;
  }
  