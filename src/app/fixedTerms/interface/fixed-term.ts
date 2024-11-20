export interface FixedTerm {
  id ?: number;
  account_id: number;
  invested_amount: number;
  start_date: string;
  expiration_date: string;
  interest_rate_id: number;
  interest_earned: number;
  is_paid: string
  
}
