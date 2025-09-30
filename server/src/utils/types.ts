export type UserRole = "instructor" | "student";

export interface UserProfile {
  phone: string; // E.164 format preferred
  email?: string;
  name: string;
  role: UserRole;
  accessCode?: string; // for SMS login
  emailAccessCode?: string; // for email login
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  status: "assigned" | "done";
  assignedAt: number;
  completedAt?: number;
}

export interface ChatMessage {
  id: string;
  fromPhone: string;
  toPhone: string;
  text: string;
  createdAt: number;
}


