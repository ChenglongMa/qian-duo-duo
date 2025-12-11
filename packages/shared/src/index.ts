export type CurrencyCode =
  | 'AUD'
  | 'CNY'  
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'NZD'
  | 'JPY'
  | 'HKD'
  | 'SGD'
  | 'CAD'
  | 'CHF'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'KRW'
  | 'INR';

export type EntryType = 'income' | 'expense';

export type EntryStatus = 'normal' | 'pending_review';

export interface ApiError {
  message: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  mainCurrency: CurrencyCode;
}

export interface Ledger {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  ledgerId: string;
  name: string;
  parentId?: string | null;
  type: EntryType;
  icon?: string;
}

export interface Merchant {
  id: string;
  name: string;
  ledgerId: string;
  tags?: string[];
  defaultCategoryId?: string | null;
}

export interface Project {
  id: string;
  ledgerId: string;
  name: string;
}

export interface FxRate {
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number;
  asOf: string;
}

export interface Entry {
  id: string;
  ledgerId: string;
  type: EntryType;
  amount: number;
  currency: CurrencyCode;
  amountMain: number;
  fxRate: number;
  categoryId?: string | null;
  subcategoryId?: string | null;
  projectId?: string | null;
  merchantId?: string | null;
  member?: string | null;
  date: string;
  note?: string;
  status: EntryStatus;
  duplicateOf?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  entryId?: string | null;
  type: 'pdf' | 'image';
  url: string;
  ocrText?: string;
  parseStatus?: 'pending' | 'success' | 'failed';
}
