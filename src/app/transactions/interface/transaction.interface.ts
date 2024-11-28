export interface Transaction {
    id?: number;
    amount: number;
    transaction_date : Date;
    source_account_id: number;
    destination_account_id: number;
    transaction_type ?: string; 
    is_paid: string;
  }
