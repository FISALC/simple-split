export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  participants: string; // Comma separated string for simplicity in UI
  ownerId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  category: string;
  payer: string;
  date: string;
  createdBy: string;
}
