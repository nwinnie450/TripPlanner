import { ObjectId } from "mongodb";

export interface TripMetadata {
  tripName: string;
  startDate: string;
  endDate: string;
  currency: string;
  currencies?: string[];
  exchangeRates?: Record<string, number>;
  budget: number;
  budgetPerPax?: number;
  personalBudgets?: Record<string, number>;
  passcode: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
}

export interface Member {
  memberId: string;
  name: string;
  userId?: string;
  joinedAt: string;
}

export type ItineraryCategory =
  | "Food"
  | "Sightseeing"
  | "Transport"
  | "Hotel"
  | "Shopping"
  | "Nightlife"
  | "Activity"
  | "Other";

export type TransportMode = 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING' | 'FLIGHT';

export interface TravelSegment {
  fromItemId: string;
  toItemId: string;
  distance: string;
  distanceMeters: number;
  duration: string;
  durationSeconds: number;
  mode: TransportMode;
  status: 'loading' | 'ok' | 'error' | 'no-coords';
}

export interface ItineraryItem {
  itemId: string;
  dayDate: string;
  time: string;
  title: string;
  location: string;
  locationLat?: number;
  locationLng?: number;
  category?: ItineraryCategory;
  transportMode?: TransportMode;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Accommodation"
  | "Activities"
  | "Shopping"
  | "Other";

export type ExpenseType = 'personal' | 'group';

export interface Expense {
  expenseId: string;
  amount: number;
  currency?: string;
  description: string;
  category: ExpenseCategory;
  expenseType?: ExpenseType;
  paidBy: string;
  splitBetween: string[];
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  memberId: string;
  memberName: string;
  net: number;
}

export interface Transaction {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface Payment {
  paymentId: string;
  from: string;
  to: string;
  amount: number;
  currency?: string;
  note?: string;
  date: string;
  createdAt: string;
}

export interface ChecklistItem {
  checklistItemId: string;
  text: string;
  assignee?: string;
  packed: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export interface TripDocument {
  _id?: ObjectId;
  passcode: string;
  tripName: string;
  startDate: string;
  endDate: string;
  currency: string;
  currencies?: string[];
  exchangeRates?: Record<string, number>;
  budget: number;
  budgetPerPax?: number;
  personalBudgets?: Record<string, number>;
  members: Member[];
  itinerary: ItineraryItem[];
  expenses: Expense[];
  payments?: Payment[];
  checklist?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}
