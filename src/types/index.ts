import { ObjectId } from "mongodb";

export interface TripMetadata {
  tripName: string;
  startDate: string;
  endDate: string;
  currency: string;
  budget: number;
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

export interface ItineraryItem {
  itemId: string;
  dayDate: string;
  time: string;
  title: string;
  location: string;
  locationLat?: number;
  locationLng?: number;
  category?: ItineraryCategory;
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

export interface Expense {
  expenseId: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
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
  note?: string;
  date: string;
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
  budget: number;
  members: Member[];
  itinerary: ItineraryItem[];
  expenses: Expense[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}
