export type UserRole = "instructor" | "student";
export interface UserProfile {
    phone: string;
    email?: string;
    name: string;
    role: UserRole;
    accessCode?: string;
    emailAccessCode?: string;
    createdAt: number;
    updatedAt: number;
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
//# sourceMappingURL=types.d.ts.map