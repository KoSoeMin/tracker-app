export const PAYMENT_METHODS = ['Cash', 'Bank', 'Mobile Wallet', 'Credit Card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CURRENCIES = ['MMK', 'USD', 'EUR', 'SGD', 'JPY', 'THB', 'GBP', 'CNY', 'KRW'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Utilities', 'Shopping',
  'Entertainment', 'Health', 'Education', 'Housing', 'Insurance', 'Subscriptions',
] as const;

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Rental Income', 'Business',
] as const;
