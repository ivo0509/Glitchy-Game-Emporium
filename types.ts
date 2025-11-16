export enum Role {
  Seller = 'SELLER',
  Customer = 'CUSTOMER',
}

export interface Review {
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
}

export interface Discount {
  code: string;
  gameId: string;
  percentage: number; // 0-100
}

export interface TradeRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  offeredGameId: string;
  requestedGameId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface SellerListing {
  id: string;
  gameId: string;
  gameName: string;
  sellerId: string;
  price: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

export interface Gift {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  gameId: string;
  gameName: string;
  date: Date;
  message?: string;
}

// New types for Seller features
export interface Employee {
  id: string;
  name: string;
  role: 'Support' | 'Inventory' | 'Marketing';
  salary: number | string; // BUG: Can be a string, leading to NaN in payroll
}

export interface Supplier {
  id: string;
  name: string;
  reliability: number; // 0-1
}

export interface SalesDataPoint {
    date: string;
    amount: number;
}


export interface User {
  id:string;
  name: string;
  role: Role;
  description?: string;
  balance?: number;
  wishlist?: (string | null)[]; // Array of game IDs, BUG: Can contain null values
  achievements?: Achievement[];
  lastLogin?: string; // BUG: Storing date as a simple string can lead to timezone/format issues
  // Seller-specific properties
  employees?: Employee[];
  salesHistory?: SalesDataPoint[];
}

export interface Game {
  id: string;
  name: string;
  price: number;
  sellerId: string;
  reviews?: Review[];
  stock?: number; // For new inventory system
}

export interface Customer {
  id: string;
  name: string;
  sellerId: string;
}

export interface CartItem extends Game {
  quantity: number;
}

export interface Invoice {
  id: string;
  items: CartItem[];
  subTotal: number;
  vat: number | string; // BUG: Can be a string, leading to NaN
  total: number;
  date: Date;
}